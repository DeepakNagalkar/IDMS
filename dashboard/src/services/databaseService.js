// Database Service for Document Storage and Retrieval
class DatabaseService {
  constructor(config) {
    this.dbEndpoint = config.dbEndpoint || 'http://localhost:5432';
    this.dbName = config.dbName || 'document_analytics';
    this.username = config.username;
    this.password = config.password;
    this.connectionPool = null;
  }

  // Initialize database connection
  async initialize() {
    try {
      // In a real implementation, this would establish a connection pool
      console.log('Initializing database connection...');
      this.connectionPool = {
        connected: true,
        timestamp: new Date().toISOString()
      };
      return true;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  // Store processed document analysis in database
  async storeDocumentAnalysis(analysisResult) {
    try {
      const documentRecord = {
        document_id: analysisResult.documentId,
        document_type: analysisResult.documentType,
        analysis_timestamp: analysisResult.analysisTimestamp,
        
        // Status fields
        is_valid: analysisResult.isValid,
        validity_status: analysisResult.validityStatus,
        compliance_status: analysisResult.complianceStatus,
        risk_level: analysisResult.riskLevel,
        
        // Date fields
        expiry_date: analysisResult.expiryDate,
        issue_date: analysisResult.issueDate,
        
        // Data quality
        data_consistency: analysisResult.dataConsistency,
        missing_information: JSON.stringify(analysisResult.missingInformation),
        data_quality_issues: JSON.stringify(analysisResult.dataQualityIssues),
        
        // Attributes
        ocr_confidence: analysisResult.attributes.ocrConfidence,
        requires_manual_review: analysisResult.attributes.requiresManualReview,
        verification_required: analysisResult.attributes.verificationRequired,
        document_score: analysisResult.attributes.documentScore,
        
        // Raw data
        raw_analysis: analysisResult.rawAnalysis,
        
        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        processing_status: 'completed'
      };

      // In a real implementation, this would execute SQL INSERT
      const insertQuery = this.buildInsertQuery('document_analysis', documentRecord);
      console.log('Storing document analysis:', documentRecord.document_id);
      
      // Simulate database storage
      return await this.executeQuery(insertQuery, documentRecord);
    } catch (error) {
      console.error('Error storing document analysis:', error);
      throw error;
    }
  }

  // Store OCR metadata
  async storeOCRMetadata(ocrMetadata) {
    try {
      const ocrRecord = {
        document_id: ocrMetadata.documentId,
        document_type: ocrMetadata.documentType,
        extracted_text: ocrMetadata.extractedText,
        confidence: ocrMetadata.confidence,
        pages: ocrMetadata.pages,
        extracted_fields: JSON.stringify(ocrMetadata.extractedFields),
        tables: JSON.stringify(ocrMetadata.tables),
        processed_at: ocrMetadata.processedAt,
        created_at: new Date().toISOString()
      };

      const insertQuery = this.buildInsertQuery('ocr_metadata', ocrRecord);
      return await this.executeQuery(insertQuery, ocrRecord);
    } catch (error) {
      console.error('Error storing OCR metadata:', error);
      throw error;
    }
  }

  // Store sync job information
  async storeSyncJob(jobInfo) {
    try {
      const jobRecord = {
        job_id: jobInfo.jobId,
        job_type: 'document_sync',
        status: jobInfo.status,
        started_at: jobInfo.startedAt,
        completed_at: jobInfo.completedAt,
        documents_processed: jobInfo.documentsProcessed,
        documents_failed: jobInfo.documentsFailed,
        last_sync_timestamp: jobInfo.lastSyncTimestamp,
        error_message: jobInfo.errorMessage,
        created_at: new Date().toISOString()
      };

      const insertQuery = this.buildInsertQuery('sync_jobs', jobRecord);
      return await this.executeQuery(insertQuery, jobRecord);
    } catch (error) {
      console.error('Error storing sync job:', error);
      throw error;
    }
  }

  // Retrieve documents for dashboard
  async getDocumentsForDashboard(filters = {}) {
    try {
      let query = `
        SELECT 
          da.document_id,
          da.document_type,
          da.validity_status,
          da.compliance_status,
          da.risk_level,
          da.expiry_date,
          da.issue_date,
          da.document_score,
          da.requires_manual_review,
          da.analysis_timestamp,
          ocr.confidence as ocr_confidence,
          ocr.extracted_fields
        FROM document_analysis da
        LEFT JOIN ocr_metadata ocr ON da.document_id = ocr.document_id
        WHERE da.processing_status = 'completed'
      `;

      const queryParams = [];
      
      // Apply filters
      if (filters.documentType) {
        query += ` AND da.document_type = $${queryParams.length + 1}`;
        queryParams.push(filters.documentType);
      }
      
      if (filters.validityStatus) {
        query += ` AND da.validity_status = $${queryParams.length + 1}`;
        queryParams.push(filters.validityStatus);
      }
      
      if (filters.expiringWithinDays) {
        query += ` AND da.expiry_date <= $${queryParams.length + 1}`;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiringWithinDays);
        queryParams.push(futureDate.toISOString().split('T')[0]);
      }

      query += ` ORDER BY da.analysis_timestamp DESC`;
      
      if (filters.limit) {
        query += ` LIMIT $${queryParams.length + 1}`;
        queryParams.push(filters.limit);
      }

      return await this.executeQuery(query, queryParams);
    } catch (error) {
      console.error('Error retrieving documents for dashboard:', error);
      throw error;
    }
  }

  // Get document statistics for dashboard
  async getDocumentStatistics() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_documents,
          COUNT(CASE WHEN validity_status = 'Valid' THEN 1 END) as valid_documents,
          COUNT(CASE WHEN validity_status = 'Expired' THEN 1 END) as expired_documents,
          COUNT(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND expiry_date > CURRENT_DATE THEN 1 END) as expiring_soon,
          AVG(document_score) as avg_document_score,
          COUNT(CASE WHEN requires_manual_review = true THEN 1 END) as requires_review
        FROM document_analysis 
        WHERE processing_status = 'completed'
      `;

      return await this.executeQuery(statsQuery);
    } catch (error) {
      console.error('Error retrieving document statistics:', error);
      throw error;
    }
  }

  // Get document type distribution
  async getDocumentTypeDistribution() {
    try {
      const query = `
        SELECT 
          document_type,
          COUNT(*) as count,
          COUNT(CASE WHEN validity_status = 'Valid' THEN 1 END) as valid_count,
          COUNT(CASE WHEN validity_status = 'Expired' THEN 1 END) as expired_count
        FROM document_analysis
        WHERE processing_status = 'completed'
        GROUP BY document_type
        ORDER BY count DESC
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error retrieving document type distribution:', error);
      throw error;
    }
  }

  // Get compliance metrics by department
  async getComplianceMetrics() {
    try {
      const query = `
        SELECT 
          COALESCE(employee_department, 'Unknown') as department,
          COUNT(*) as total_documents,
          COUNT(CASE WHEN compliance_status = 'Compliant' THEN 1 END) as compliant_documents,
          AVG(document_score) as avg_score,
          COUNT(CASE WHEN requires_manual_review = true THEN 1 END) as needs_review
        FROM document_analysis da
        LEFT JOIN employee_info ei ON da.employee_id = ei.employee_id
        WHERE da.processing_status = 'completed'
        GROUP BY employee_department
        ORDER BY total_documents DESC
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error retrieving compliance metrics:', error);
      throw error;
    }
  }

  // Get last sync job status
  async getLastSyncStatus() {
    try {
      const query = `
        SELECT *
        FROM sync_jobs
        ORDER BY started_at DESC
        LIMIT 1
      `;

      return await this.executeQuery(query);
    } catch (error) {
      console.error('Error retrieving last sync status:', error);
      throw error;
    }
  }

  // Helper methods
  buildInsertQuery(tableName, record) {
    const columns = Object.keys(record);
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    
    return {
      text: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values: Object.values(record)
    };
  }

  buildUpdateQuery(tableName, record, whereClause) {
    const columns = Object.keys(record);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`);
    
    return {
      text: `UPDATE ${tableName} SET ${setClause.join(', ')} ${whereClause}`,
      values: Object.values(record)
    };
  }

  async executeQuery(query, params = []) {
    try {
      // In a real implementation, this would execute against actual database
      console.log('Executing query:', typeof query === 'string' ? query : query.text);
      
      // Simulate database response
      return {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Create database schema (for setup)
  async createSchema() {
    const schemaQueries = [
      `CREATE TABLE IF NOT EXISTS document_analysis (
        id SERIAL PRIMARY KEY,
        document_id VARCHAR(255) UNIQUE NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        employee_id VARCHAR(100),
        analysis_timestamp TIMESTAMP NOT NULL,
        is_valid BOOLEAN,
        validity_status VARCHAR(50),
        compliance_status VARCHAR(50),
        risk_level VARCHAR(20),
        expiry_date DATE,
        issue_date DATE,
        data_consistency VARCHAR(50),
        missing_information JSONB,
        data_quality_issues JSONB,
        ocr_confidence DECIMAL(3,2),
        requires_manual_review BOOLEAN DEFAULT false,
        verification_required BOOLEAN DEFAULT false,
        document_score INTEGER,
        raw_analysis TEXT,
        processing_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS ocr_metadata (
        id SERIAL PRIMARY KEY,
        document_id VARCHAR(255) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        extracted_text TEXT,
        confidence DECIMAL(3,2),
        pages INTEGER,
        extracted_fields JSONB,
        tables JSONB,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS sync_jobs (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(255) UNIQUE NOT NULL,
        job_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        documents_processed INTEGER DEFAULT 0,
        documents_failed INTEGER DEFAULT 0,
        last_sync_timestamp TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS employee_info (
        employee_id VARCHAR(100) PRIMARY KEY,
        employee_name VARCHAR(255),
        employee_department VARCHAR(100),
        employee_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of schemaQueries) {
      await this.executeQuery(query);
    }

    // Create indexes
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_document_analysis_type ON document_analysis(document_type)',
      'CREATE INDEX IF NOT EXISTS idx_document_analysis_status ON document_analysis(validity_status)',
      'CREATE INDEX IF NOT EXISTS idx_document_analysis_expiry ON document_analysis(expiry_date)',
      'CREATE INDEX IF NOT EXISTS idx_ocr_metadata_document_id ON ocr_metadata(document_id)',
      'CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status)'
    ];

    for (const query of indexQueries) {
      await this.executeQuery(query);
    }

    console.log('Database schema created successfully');
    return true;
  }
}

export default DatabaseService;