// Scheduled Job Service for Document Processing
import DocumentProcessor from './documentProcessor.js';

class ScheduledJobService {
  constructor(config) {
    this.config = config;
    this.processor = new DocumentProcessor(config);
    this.jobIntervals = new Map();
    this.isInitialized = false;
    
    // Default schedule: every 4 hours
    this.defaultSchedule = config.schedule || {
      interval: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
      timezone: 'UTC'
    };
  }

  // Initialize the scheduled job service
  async initialize() {
    try {
      console.log('Initializing Scheduled Job Service...');
      
      await this.processor.initialize();
      this.isInitialized = true;
      
      console.log('Scheduled Job Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Scheduled Job Service:', error);
      throw error;
    }
  }

  // Start the scheduled document processing job
  async startScheduledJob(jobName = 'document_sync', schedule = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const jobSchedule = schedule || this.defaultSchedule;
    
    console.log(`Starting scheduled job: ${jobName}`);
    console.log(`Schedule: Every ${jobSchedule.interval / 1000 / 60} minutes`);

    // Run immediately on start
    this.runJob(jobName);

    // Schedule recurring execution
    const intervalId = setInterval(async () => {
      await this.runJob(jobName);
    }, jobSchedule.interval);

    this.jobIntervals.set(jobName, intervalId);
    
    return {
      jobName,
      status: 'scheduled',
      interval: jobSchedule.interval,
      nextRun: new Date(Date.now() + jobSchedule.interval)
    };
  }

  // Stop a scheduled job
  stopScheduledJob(jobName) {
    const intervalId = this.jobIntervals.get(jobName);
    
    if (intervalId) {
      clearInterval(intervalId);
      this.jobIntervals.delete(jobName);
      console.log(`Stopped scheduled job: ${jobName}`);
      return true;
    }
    
    console.log(`Job ${jobName} not found or not running`);
    return false;
  }

  // Run a job immediately
  async runJob(jobName) {
    const jobId = `${jobName}_${Date.now()}`;
    
    try {
      console.log(`Executing job: ${jobName} (ID: ${jobId})`);
      
      const startTime = new Date();
      const result = await this.processor.processDocuments(jobId);
      const duration = new Date() - startTime;
      
      console.log(`Job ${jobName} completed successfully in ${duration}ms`);
      console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
      
      // Log job completion
      await this.logJobExecution(jobName, jobId, 'success', result, duration);
      
      return result;
    } catch (error) {
      console.error(`Job ${jobName} failed:`, error);
      
      // Log job failure
      await this.logJobExecution(jobName, jobId, 'failed', null, null, error.message);
      
      throw error;
    }
  }

  // Log job execution details
  async logJobExecution(jobName, jobId, status, result, duration, errorMessage = null) {
    const logEntry = {
      jobName,
      jobId,
      status,
      executedAt: new Date().toISOString(),
      duration,
      result,
      errorMessage
    };

    try {
      // In a production environment, this would log to a proper logging system
      console.log('Job Execution Log:', JSON.stringify(logEntry, null, 2));
      
      // Store in job history table if database is available
      if (this.processor.databaseService) {
        await this.processor.databaseService.executeQuery(
          `INSERT INTO job_execution_log (job_name, job_id, status, executed_at, duration_ms, result_data, error_message) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [jobName, jobId, status, logEntry.executedAt, duration, JSON.stringify(result), errorMessage]
        );
      }
    } catch (error) {
      console.error('Error logging job execution:', error);
    }
  }

  // Get job status and statistics
  async getJobStatus(jobName = null) {
    const status = {
      timestamp: new Date().toISOString(),
      runningJobs: Array.from(this.jobIntervals.keys()),
      isInitialized: this.isInitialized
    };

    if (jobName) {
      status.jobName = jobName;
      status.isRunning = this.jobIntervals.has(jobName);
      status.nextRun = status.isRunning ? 
        new Date(Date.now() + this.defaultSchedule.interval) : null;
    }

    // Get processing statistics if available
    try {
      const health = await this.processor.healthCheck();
      status.serviceHealth = health;
    } catch (error) {
      status.serviceHealth = { status: 'unknown', error: error.message };
    }

    return status;
  }

  // Manual trigger for immediate job execution
  async triggerJobNow(jobName = 'document_sync') {
    try {
      console.log(`Manually triggering job: ${jobName}`);
      const result = await this.runJob(jobName);
      return {
        triggered: true,
        jobName,
        result
      };
    } catch (error) {
      return {
        triggered: false,
        jobName,
        error: error.message
      };
    }
  }

  // Stop all scheduled jobs
  stopAllJobs() {
    const stoppedJobs = [];
    
    for (const [jobName, intervalId] of this.jobIntervals) {
      clearInterval(intervalId);
      stoppedJobs.push(jobName);
    }
    
    this.jobIntervals.clear();
    console.log(`Stopped ${stoppedJobs.length} scheduled jobs:`, stoppedJobs);
    
    return stoppedJobs;
  }

  // Get job execution history
  async getJobHistory(jobName = null, limit = 10) {
    try {
      let query = `
        SELECT job_name, job_id, status, executed_at, duration_ms, error_message
        FROM job_execution_log
      `;
      
      const params = [];
      
      if (jobName) {
        query += ` WHERE job_name = $1`;
        params.push(jobName);
      }
      
      query += ` ORDER BY executed_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);
      
      const result = await this.processor.databaseService.executeQuery(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error retrieving job history:', error);
      return [];
    }
  }

  // Create cron-like scheduling (hours-based for simplicity)
  createSchedule(hours = 4, minutes = 0) {
    const intervalMs = (hours * 60 + minutes) * 60 * 1000;
    
    return {
      interval: intervalMs,
      description: `Every ${hours} hours and ${minutes} minutes`
    };
  }

  // Health check for the scheduler
  async healthCheck() {
    return {
      status: 'healthy',
      isInitialized: this.isInitialized,
      activeJobs: this.jobIntervals.size,
      jobNames: Array.from(this.jobIntervals.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

export default ScheduledJobService;