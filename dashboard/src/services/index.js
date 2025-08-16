// Main Service Orchestrator
import ScheduledJobService from './scheduledJob.js';
import DocumentProcessor from './documentProcessor.js';
import { getConfig } from './config.js';

class DocumentAnalyticsService {
  constructor(environment = 'development') {
    this.environment = environment;
    this.config = getConfig(environment);
    this.scheduledJobService = new ScheduledJobService(this.config);
    this.isRunning = false;
  }

  // Start the complete service
  async start() {
    try {
      console.log(`Starting Document Analytics Service in ${this.environment} mode...`);
      
      // Initialize services
      await this.scheduledJobService.initialize();
      
      // Start scheduled jobs if enabled
      if (this.config.schedule.enabled) {
        await this.scheduledJobService.startScheduledJob('document_sync');
        console.log('Scheduled document processing job started');
      }
      
      this.isRunning = true;
      console.log('Document Analytics Service started successfully');
      
      return {
        status: 'started',
        environment: this.environment,
        scheduledJobs: this.config.schedule.enabled,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to start Document Analytics Service:', error);
      throw error;
    }
  }

  // Stop the service
  async stop() {
    try {
      console.log('Stopping Document Analytics Service...');
      
      // Stop all scheduled jobs
      this.scheduledJobService.stopAllJobs();
      
      this.isRunning = false;
      console.log('Document Analytics Service stopped');
      
      return {
        status: 'stopped',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error stopping Document Analytics Service:', error);
      throw error;
    }
  }

  // Manual trigger for document processing
  async processDocumentsNow() {
    try {
      console.log('Manually triggering document processing...');
      const result = await this.scheduledJobService.triggerJobNow('document_sync');
      return result;
    } catch (error) {
      console.error('Error in manual document processing:', error);
      throw error;
    }
  }

  // Get service status
  async getStatus() {
    try {
      const jobStatus = await this.scheduledJobService.getJobStatus();
      
      return {
        service: {
          isRunning: this.isRunning,
          environment: this.environment,
          startedAt: this.startedAt || null
        },
        jobs: jobStatus,
        config: {
          batchSize: this.config.batchSize,
          scheduleInterval: this.config.schedule.interval,
          scheduleEnabled: this.config.schedule.enabled
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: {
          isRunning: this.isRunning,
          environment: this.environment,
          error: error.message
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const schedulerHealth = await this.scheduledJobService.healthCheck();
      
      return {
        status: 'healthy',
        service: this.isRunning ? 'running' : 'stopped',
        scheduler: schedulerHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get processing statistics
  async getProcessingStats() {
    try {
      const processor = this.scheduledJobService.processor;
      
      // Get recent job history
      const jobHistory = await this.scheduledJobService.getJobHistory('document_sync', 10);
      
      // Get database statistics
      const dbStats = await processor.databaseService.getDocumentStatistics();
      
      return {
        recentJobs: jobHistory,
        documentStats: dbStats.rows[0] || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
const documentAnalyticsService = new DocumentAnalyticsService(
  (typeof process !== 'undefined' && process.env) ? process.env.NODE_ENV || 'development' : 'development'
);

// Start service if running as main module
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env && process.env.AUTO_START !== 'false') {
  // Only start automatically in Node.js environment, not in browser
  documentAnalyticsService.start().catch(console.error);
}

export default documentAnalyticsService;
export { DocumentAnalyticsService, ScheduledJobService, DocumentProcessor };