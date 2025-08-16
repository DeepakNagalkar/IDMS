// Document Processing Service Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import services (these would be the actual service files)
// const DocumentProcessor = require('../../../src/services/documentProcessor');
// const ScheduledJobService = require('../../../src/services/scheduledJob');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Document Processing Service',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Document processing endpoints
app.post('/api/process/trigger', async (req, res) => {
  try {
    // Trigger document processing job
    res.json({
      message: 'Document processing job triggered',
      jobId: `job_${Date.now()}`,
      status: 'started'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/status', (req, res) => {
  res.json({
    activeJobs: 0,
    completedJobs: 15,
    failedJobs: 1,
    lastRun: new Date().toISOString()
  });
});

// Document statistics endpoint
app.get('/api/documents/stats', (req, res) => {
  res.json({
    totalDocuments: 250,
    validDocuments: 210,
    expiredDocuments: 25,
    expiringSoon: 15,
    avgScore: 85.5,
    requiresReview: 40
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Document Processing Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;