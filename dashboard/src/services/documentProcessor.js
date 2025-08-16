// Document Processing Pipeline
import OpenTextDMSConnector from './opentextConnector.js';
import OCRService from './ocrService.js';
import LLMService from './llmService.js';
import DatabaseService from './databaseService.js';

class DocumentProcessor {
  constructor(config) {
    this.config = config;
    this.dmsConnector = new OpenTextDMSConnector(config.opentext);
    this.ocrService = new OCRService(config.ocr);
    this.llmService = new LLMService(config.llm);
    this.databaseService = new DatabaseService(config.database);
    
    this.batchSize = config.batchSize || 10;
    this.maxRetries = config.maxRetries || 3;
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // Initialize all services
  async initialize() {
    try {
      console.log('Initializing Document Processor...');
      
      await this.databaseService.initialize();
      await this.databaseService.createSchema();
      
      console.log('Document Processor initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Document Processor:', error);
      throw error;
    }
  }

  // Main processing method called by scheduled job
  async processDocuments(jobId = null) {
    if (this.isProcessing) {
      console.log('Document processing already in progress');
      return;
    }

    this.isProcessing = true;
    const currentJobId = jobId || `job_${Date.now()}`;
    let processedCount = 0;
    let failedCount = 0;
    const startTime = new Date();

    try {
      console.log(`Starting document processing job: ${currentJobId}`);
      
      // Store job start
      await this.databaseService.storeSyncJob({
        jobId: currentJobId,
        status: 'running',
        startedAt: startTime.toISOString(),
        documentsProcessed: 0,
        documentsFailed: 0
      });

      // Get last sync timestamp
      const lastSync = await this.getLastSyncTimestamp();
      console.log(`Last sync timestamp: ${lastSync}`);

      // Fetch documents from OpenText DMS
      let hasMore = true;
      let nextCursor = null;

      while (hasMore) {
        const batch = await this.dmsConnector.getDocumentsBatch(
          lastSync,
          ['passport', 'work_permit', 'certification', 'employment_contract', 'visa']
        );

        if (batch.documents.length === 0) {
          console.log('No new documents to process');
          break;
        }

        console.log(`Processing batch of ${batch.documents.length} documents`);

        // Process documents in parallel with concurrency limit
        const results = await this.processBatch(batch.documents);
        
        processedCount += results.processed;
        failedCount += results.failed;

        hasMore = batch.hasMore;
        nextCursor = batch.nextCursor;

        // Update job progress
        await this.databaseService.storeSyncJob({
          jobId: currentJobId,
          status: 'running',
          startedAt: startTime.toISOString(),
          documentsProcessed: processedCount,
          documentsFailed: failedCount
        });
      }

      // Complete job
      const completedAt = new Date().toISOString();
      await this.databaseService.storeSyncJob({
        jobId: currentJobId,
        status: 'completed',
        startedAt: startTime.toISOString(),
        completedAt: completedAt,
        documentsProcessed: processedCount,
        documentsFailed: failedCount,
        lastSyncTimestamp: completedAt
      });

      console.log(`Job ${currentJobId} completed. Processed: ${processedCount}, Failed: ${failedCount}`);
      
      return {
        jobId: currentJobId,
        processed: processedCount,
        failed: failedCount,
        duration: new Date() - startTime
      };

    } catch (error) {
      console.error(`Job ${currentJobId} failed:`, error);
      
      // Mark job as failed
      await this.databaseService.storeSyncJob({
        jobId: currentJobId,
        status: 'failed',
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        documentsProcessed: processedCount,
        documentsFailed: failedCount,
        errorMessage: error.message
      });

      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a batch of documents
  async processBatch(documents) {
    const results = { processed: 0, failed: 0 };
    const concurrency = 3; // Process 3 documents at a time
    
    for (let i = 0; i < documents.length; i += concurrency) {
      const batch = documents.slice(i, i + concurrency);
      const promises = batch.map(doc => this.processDocument(doc));
      
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.processed++;
          console.log(`Successfully processed document: ${batch[index].id}`);
        } else {
          results.failed++;
          console.error(`Failed to process document ${batch[index].id}:`, result.reason);
        }
      });
    }
    
    return results;
  }

  // Process a single document through the pipeline
  async processDocument(document) {
    const documentId = document.id;
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        console.log(`Processing document ${documentId} (attempt ${retryCount + 1})`);

        // Step 1: Download document content
        const documentBlob = await this.dmsConnector.downloadDocument(documentId);
        const documentMetadata = await this.dmsConnector.getDocumentMetadata(documentId);

        // Step 2: OCR Processing
        const ocrResult = await this.ocrService.processDocument(
          documentBlob,
          documentId,
          document.type || documentMetadata.documentType
        );

        // Store OCR metadata
        await this.databaseService.storeOCRMetadata(ocrResult);

        // Step 3: LLM Analysis
        const analysisResult = await this.llmService.analyzeDocument(ocrResult, {
          employeeId: document.employeeId,
          department: document.department,
          source: 'OpenText DMS',
          requiresVerification: true
        });

        // Step 4: Store final analysis
        await this.databaseService.storeDocumentAnalysis(analysisResult);

        console.log(`Successfully processed document ${documentId}`);
        return analysisResult;

      } catch (error) {
        retryCount++;
        console.error(`Error processing document ${documentId} (attempt ${retryCount}):`, error);

        if (retryCount >= this.maxRetries) {
          // Store failed processing record
          await this.storeFailedProcessing(documentId, error.message);
          throw error;
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, retryCount) * 1000);
      }
    }
  }

  // Store failed processing information
  async storeFailedProcessing(documentId, errorMessage) {
    try {
      const failedRecord = {
        documentId: documentId,
        documentType: 'unknown',
        analysisTimestamp: new Date().toISOString(),
        isValid: null,
        validityStatus: 'Processing Failed',
        complianceStatus: 'Unknown',
        riskLevel: 'High',
        expiryDate: null,
        issueDate: null,
        dataConsistency: 'Unknown',
        missingInformation: ['Processing failed'],
        dataQualityIssues: [errorMessage],
        attributes: {
          ocrConfidence: 0,
          requiresManualReview: true,
          verificationRequired: true,
          documentScore: 0
        },
        rawAnalysis: `Processing failed: ${errorMessage}`
      };

      await this.databaseService.storeDocumentAnalysis(failedRecord);
    } catch (error) {
      console.error('Error storing failed processing record:', error);
    }
  }

  // Get last successful sync timestamp
  async getLastSyncTimestamp() {
    try {
      const lastSync = await this.databaseService.getLastSyncStatus();
      return lastSync.rows.length > 0 ? lastSync.rows[0].last_sync_timestamp : null;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  // Utility method for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    try {
      // Check database connection
      await this.databaseService.initialize();
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'unhealthy';
    }

    try {
      // Check OpenText DMS connection
      await this.dmsConnector.authenticate();
      health.services.opentext = 'healthy';
    } catch (error) {
      health.services.opentext = 'unhealthy';
      health.status = 'unhealthy';
    }

    health.services.ocr = 'healthy'; // Assume healthy if no errors
    health.services.llm = 'healthy'; // Assume healthy if no errors

    return health;
  }
}

export default DocumentProcessor;