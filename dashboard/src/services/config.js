// Configuration for Document Processing Services
const getEnvVar = (key, defaultValue) => {
  if (typeof window !== 'undefined') {
    // Browser environment - use window.ENV or defaults
    return window.ENV?.[key] || defaultValue;
  }
  // Node.js environment
  return (typeof process !== 'undefined' && process.env) ? process.env[key] || defaultValue : defaultValue;
};

export const processingConfig = {
  // OpenText DMS Configuration
  opentext: {
    baseUrl: getEnvVar('OPENTEXT_BASE_URL', 'http://opentext-dms-server:8080'),
    username: getEnvVar('OPENTEXT_USERNAME', 'admin'),
    password: getEnvVar('OPENTEXT_PASSWORD', 'password'),
    apiKey: getEnvVar('OPENTEXT_API_KEY', 'your-api-key'),
    batchSize: parseInt(getEnvVar('OPENTEXT_BATCH_SIZE', '50')),
    timeout: parseInt(getEnvVar('OPENTEXT_TIMEOUT', '30000'))
  },

  // OCR Service Configuration
  ocr: {
    ocrEndpoint: getEnvVar('OCR_ENDPOINT', 'https://api.ocr.space/parse/image'),
    apiKey: getEnvVar('OCR_API_KEY', 'your-ocr-api-key'),
    timeout: parseInt(getEnvVar('OCR_TIMEOUT', '60000')),
    supportedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'bmp'],
    maxFileSize: parseInt(getEnvVar('OCR_MAX_FILE_SIZE', String(10 * 1024 * 1024))) // 10MB
  },

  // LLM Service Configuration (OpenAI)
  llm: {
    apiKey: getEnvVar('OPENAI_API_KEY', 'your-openai-api-key'),
    baseUrl: getEnvVar('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    model: getEnvVar('OPENAI_MODEL', 'gpt-4'),
    maxTokens: parseInt(getEnvVar('OPENAI_MAX_TOKENS', '2000')),
    temperature: parseFloat(getEnvVar('OPENAI_TEMPERATURE', '0.1')),
    timeout: parseInt(getEnvVar('OPENAI_TIMEOUT', '30000'))
  },

  // Database Configuration
  database: {
    dbEndpoint: getEnvVar('DATABASE_URL', 'postgresql://user:password@localhost:5432/document_analytics'),
    dbName: getEnvVar('DATABASE_NAME', 'document_analytics'),
    username: getEnvVar('DATABASE_USERNAME', 'postgres'),
    password: getEnvVar('DATABASE_PASSWORD', 'password'),
    host: getEnvVar('DATABASE_HOST', 'localhost'),
    port: parseInt(getEnvVar('DATABASE_PORT', '5432')),
    ssl: getEnvVar('DATABASE_SSL', 'false') === 'true',
    maxConnections: parseInt(getEnvVar('DATABASE_MAX_CONNECTIONS', '20'))
  },

  // Processing Configuration
  batchSize: parseInt(getEnvVar('PROCESSING_BATCH_SIZE', '10')),
  maxRetries: parseInt(getEnvVar('PROCESSING_MAX_RETRIES', '3')),
  concurrency: parseInt(getEnvVar('PROCESSING_CONCURRENCY', '3')),
  
  // Scheduling Configuration
  schedule: {
    interval: parseInt(getEnvVar('SCHEDULE_INTERVAL', String(4 * 60 * 60 * 1000))), // 4 hours
    timezone: getEnvVar('SCHEDULE_TIMEZONE', 'UTC'),
    enabled: getEnvVar('SCHEDULE_ENABLED', 'true') !== 'false'
  },

  // Logging Configuration
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    enableFileLogging: getEnvVar('ENABLE_FILE_LOGGING', 'false') === 'true',
    logDirectory: getEnvVar('LOG_DIRECTORY', './logs')
  },

  // Document Type Mapping
  documentTypes: {
    passport: {
      requiredFields: ['passportNumber', 'expiryDate', 'issuingCountry', 'holderName'],
      validityPeriod: 10 * 365, // 10 years in days
      complianceChecks: ['expiry', 'issuing_authority', 'holder_match']
    },
    work_permit: {
      requiredFields: ['permitNumber', 'expiryDate', 'employer', 'employeeId'],
      validityPeriod: 2 * 365, // 2 years in days
      complianceChecks: ['expiry', 'employer_match', 'authorization']
    },
    certification: {
      requiredFields: ['certificateNumber', 'expiryDate', 'issuingAuthority'],
      validityPeriod: 3 * 365, // 3 years in days
      complianceChecks: ['expiry', 'issuing_authority', 'professional_status']
    },
    employment_contract: {
      requiredFields: ['startDate', 'endDate', 'employer', 'position'],
      validityPeriod: null, // Variable
      complianceChecks: ['dates', 'employer_match', 'terms']
    },
    visa: {
      requiredFields: ['visaNumber', 'expiryDate', 'visaType', 'issuingCountry'],
      validityPeriod: 1 * 365, // 1 year in days
      complianceChecks: ['expiry', 'visa_type', 'entry_permissions']
    }
  }
};

// Environment-specific configurations
export const environments = {
  development: {
    ...processingConfig,
    logging: {
      ...processingConfig.logging,
      level: 'debug'
    },
    schedule: {
      ...processingConfig.schedule,
      interval: 5 * 60 * 1000, // 5 minutes for testing
    }
  },

  staging: {
    ...processingConfig,
    schedule: {
      ...processingConfig.schedule,
      interval: 2 * 60 * 60 * 1000, // 2 hours
    }
  },

  production: {
    ...processingConfig,
    logging: {
      ...processingConfig.logging,
      level: 'warn',
      enableFileLogging: true
    }
  }
};

// Get configuration based on environment
export function getConfig(env = 'development') {
  return environments[env] || environments.development;
}

export default processingConfig;