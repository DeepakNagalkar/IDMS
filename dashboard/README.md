# Document Analytics System for SAP SuccessFactors

This project is a proof of concept for a Document Analytics system that integrates with SAP SuccessFactors HRMS and OpenText DMS.

## Overview

The Document Analytics System allows organizations to track and manage employee documents by:
- Connecting to OpenText DMS to fetch documents
- Using OCR to read document content
- Extracting metadata with LLM models
- Analyzing document status and compliance
- Providing dashboards for expired/expiring documents and mismatches

## System Architecture

The system consists of the following components:

1. **Integration Layer**
   - OpenText DMS Connector
   - SAP SuccessFactors Connector

2. **Processing Pipeline**
   - OCR Document Processing
   - LLM Metadata Extraction
   - Document Validation Engine

3. **Data Storage**
   - Document Metadata Store
   - Employee Record Linkage
   - Compliance Rules Engine

4. **Analytics & Dashboard**
   - Document Expiration Analytics
   - Compliance Reporting
   - Department Metrics

## Installation and Setup

```shell
# Install dependencies
pnpm i

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## Security Considerations

The system is designed to be deployed in a client's environment with:
- Secure API connections to OpenText and SuccessFactors
- Encrypted document storage
- Role-based access control
- Audit logging for all document access

## Technology Stack

- Frontend: React, Recharts, Tailwind CSS
- Backend: Node.js (API Layer)
- Document Processing: OCR Engine, LLM Models
- Integration: REST APIs, SOAP Services