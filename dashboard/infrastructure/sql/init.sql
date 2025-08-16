-- Initialize Document Analytics Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Document Analysis Table
CREATE TABLE IF NOT EXISTS document_analysis (
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
);

-- OCR Metadata Table
CREATE TABLE IF NOT EXISTS ocr_metadata (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    extracted_text TEXT,
    confidence DECIMAL(3,2),
    pages INTEGER,
    extracted_fields JSONB,
    tables JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES document_analysis(document_id)
);

-- Sync Jobs Table
CREATE TABLE IF NOT EXISTS sync_jobs (
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
);

-- Employee Information Table
CREATE TABLE IF NOT EXISTS employee_info (
    employee_id VARCHAR(100) PRIMARY KEY,
    employee_name VARCHAR(255),
    employee_department VARCHAR(100),
    employee_email VARCHAR(255),
    manager_id VARCHAR(100),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Execution Log Table
CREATE TABLE IF NOT EXISTS job_execution_log (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    job_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    executed_at TIMESTAMP NOT NULL,
    duration_ms INTEGER,
    result_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Categories Table
CREATE TABLE IF NOT EXISTS document_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_description TEXT,
    required_fields JSONB,
    validation_rules JSONB,
    retention_period_days INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_document_analysis_type ON document_analysis(document_type);
CREATE INDEX IF NOT EXISTS idx_document_analysis_status ON document_analysis(validity_status);
CREATE INDEX IF NOT EXISTS idx_document_analysis_expiry ON document_analysis(expiry_date);
CREATE INDEX IF NOT EXISTS idx_document_analysis_employee ON document_analysis(employee_id);
CREATE INDEX IF NOT EXISTS idx_document_analysis_created ON document_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_ocr_metadata_document_id ON ocr_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_timestamp ON sync_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_department ON employee_info(employee_department);
CREATE INDEX IF NOT EXISTS idx_job_execution_log_name ON job_execution_log(job_name);
CREATE INDEX IF NOT EXISTS idx_job_execution_log_executed ON job_execution_log(executed_at DESC);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_document_analysis_text_search ON document_analysis USING gin(to_tsvector('english', document_id || ' ' || COALESCE(raw_analysis, '')));
CREATE INDEX IF NOT EXISTS idx_ocr_metadata_text_search ON ocr_metadata USING gin(to_tsvector('english', COALESCE(extracted_text, '')));

-- Insert Initial Data
INSERT INTO document_categories (category_name, category_description, required_fields, validation_rules, retention_period_days) VALUES
('passport', 'Passport Documents', '["passportNumber", "expiryDate", "issuingCountry", "holderName"]', '{"maxAge": 3650, "requiredFields": ["passportNumber", "expiryDate"]}', 3650),
('work_permit', 'Work Permit Documents', '["permitNumber", "expiryDate", "employer", "employeeId"]', '{"maxAge": 730, "requiredFields": ["permitNumber", "expiryDate"]}', 2555),
('certification', 'Professional Certifications', '["certificateNumber", "expiryDate", "issuingAuthority"]', '{"maxAge": 1095, "requiredFields": ["certificateNumber", "expiryDate"]}', 2190),
('employment_contract', 'Employment Contracts', '["startDate", "endDate", "employer", "position"]', '{"requiredFields": ["startDate", "employer"]}', 2555),
('visa', 'Visa Documents', '["visaNumber", "expiryDate", "visaType", "issuingCountry"]', '{"maxAge": 365, "requiredFields": ["visaNumber", "expiryDate"]}', 1825)
ON CONFLICT (category_name) DO NOTHING;

-- Insert Sample Employee Data
INSERT INTO employee_info (employee_id, employee_name, employee_department, employee_email, hire_date) VALUES
('EMP-5432', 'John Smith', 'HR', 'john.smith@company.com', '2020-03-15'),
('EMP-6543', 'Maria Rodriguez', 'IT', 'maria.rodriguez@company.com', '2021-06-01'),
('EMP-7654', 'David Chen', 'Finance', 'david.chen@company.com', '2019-09-12'),
('EMP-8765', 'Sarah Johnson', 'Engineering', 'sarah.johnson@company.com', '2022-01-10'),
('EMP-9876', 'Ahmed Hassan', 'Operations', 'ahmed.hassan@company.com', '2020-11-20'),
('EMP-1234', 'Lisa Wang', 'Marketing', 'lisa.wang@company.com', '2021-04-05'),
('EMP-2345', 'Carlos Lopez', 'Sales', 'carlos.lopez@company.com', '2022-02-14'),
('EMP-3456', 'Anna Kowalski', 'Legal', 'anna.kowalski@company.com', '2020-08-30'),
('EMP-4567', 'Raj Patel', 'IT', 'raj.patel@company.com', '2021-12-03'),
('EMP-5678', 'Emma Thompson', 'HR', 'emma.thompson@company.com', '2019-05-18')
ON CONFLICT (employee_id) DO NOTHING;

-- Create Functions for Common Queries
CREATE OR REPLACE FUNCTION get_expiring_documents(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    document_id VARCHAR,
    document_type VARCHAR,
    employee_name VARCHAR,
    department VARCHAR,
    expiry_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.document_id,
        da.document_type,
        ei.employee_name,
        ei.employee_department,
        da.expiry_date,
        (da.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry
    FROM document_analysis da
    LEFT JOIN employee_info ei ON da.employee_id = ei.employee_id
    WHERE da.expiry_date IS NOT NULL 
      AND da.expiry_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
      AND da.expiry_date > CURRENT_DATE
    ORDER BY da.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create Function for Document Statistics
CREATE OR REPLACE FUNCTION get_document_statistics()
RETURNS TABLE (
    total_documents BIGINT,
    valid_documents BIGINT,
    expired_documents BIGINT,
    expiring_soon BIGINT,
    avg_document_score NUMERIC,
    requires_review BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN validity_status = 'Valid' THEN 1 END) as valid_documents,
        COUNT(CASE WHEN validity_status = 'Expired' THEN 1 END) as expired_documents,
        COUNT(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND expiry_date > CURRENT_DATE THEN 1 END) as expiring_soon,
        AVG(document_score) as avg_document_score,
        COUNT(CASE WHEN requires_manual_review = true THEN 1 END) as requires_review
    FROM document_analysis 
    WHERE processing_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Updated Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_analysis_updated_at 
    BEFORE UPDATE ON document_analysis 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_info_updated_at 
    BEFORE UPDATE ON employee_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Views for Common Queries
CREATE OR REPLACE VIEW document_summary AS
SELECT 
    da.document_id,
    da.document_type,
    da.validity_status,
    da.compliance_status,
    da.risk_level,
    da.expiry_date,
    da.document_score,
    da.requires_manual_review,
    ei.employee_name,
    ei.employee_department,
    ocr.confidence as ocr_confidence,
    da.created_at
FROM document_analysis da
LEFT JOIN employee_info ei ON da.employee_id = ei.employee_id
LEFT JOIN ocr_metadata ocr ON da.document_id = ocr.document_id
WHERE da.processing_status = 'completed';

-- Grant Permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE 'Document Analytics Database initialized successfully!';
    RAISE NOTICE 'Tables created: document_analysis, ocr_metadata, sync_jobs, employee_info, job_execution_log, document_categories, audit_log';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Sample data inserted for 10 employees';
    RAISE NOTICE 'Views and functions created for common queries';
END $$;