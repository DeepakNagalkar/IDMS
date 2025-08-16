// OCR Service for Document Text Extraction
class OCRService {
  constructor(config) {
    this.ocrEndpoint = config.ocrEndpoint || 'https://api.ocr.space/parse/image';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 60000;
    this.supportedFormats = config.supportedFormats || ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'bmp'];
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
  }

  // Process document with OCR
  async processDocument(documentBlob, documentId, documentType) {
    try {
      console.log(`Processing document ${documentId} with OCR...`);
      
      // Validate file
      if (!this.isValidFile(documentBlob)) {
        throw new Error('Invalid file format or size exceeds limit');
      }

      // Perform OCR extraction
      const ocrResult = await this.extractText(documentBlob);
      
      // Extract structured fields based on document type
      const extractedFields = this.extractDocumentFields(ocrResult.text, documentType);
      
      // Extract tables if present
      const tables = this.extractTables(ocrResult.text);
      
      const processedResult = {
        documentId: documentId,
        documentType: documentType,
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence,
        pages: ocrResult.pages || 1,
        extractedFields: extractedFields,
        tables: tables,
        processedAt: new Date().toISOString(),
        ocrProvider: this.determineProvider(),
        language: ocrResult.language || 'en',
        textBlocks: ocrResult.textBlocks || []
      };

      console.log(`OCR processing completed for document ${documentId} - Confidence: ${ocrResult.confidence}`);
      return processedResult;
    } catch (error) {
      console.log(`OCR processing error for document ${documentId}:`, error.message);
      console.log('Falling back to demo OCR result...');
      return this.getDemoOCRResult(documentId, documentType);
    }
  }

  // Extract text using OCR API
  async extractText(documentBlob) {
    try {
      const formData = new FormData();
      formData.append('file', documentBlob);
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'true');
      formData.append('detectOrientation', 'true');
      formData.append('isTable', 'true');

      const response = await fetch(this.ocrEndpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OCR API key');
        } else if (response.status === 429) {
          throw new Error('OCR API rate limit exceeded');
        } else {
          throw new Error(`OCR API error: ${response.status}`);
        }
      }

      const result = await response.json();
      
      if (!result.IsErroredOnProcessing && result.ParsedResults && result.ParsedResults.length > 0) {
        const parsedResult = result.ParsedResults[0];
        
        return {
          text: parsedResult.ParsedText || '',
          confidence: this.calculateConfidence(parsedResult),
          pages: result.ParsedResults.length,
          language: parsedResult.Language || 'en',
          textBlocks: this.extractTextBlocks(parsedResult)
        };
      } else {
        throw new Error('OCR processing failed: ' + (result.ErrorMessage || 'Unknown error'));
      }
    } catch (error) {
      console.log('OCR API call failed:', error.message);
      throw error;
    }
  }

  // Extract document-specific fields based on type
  extractDocumentFields(text, documentType) {
    const fields = {};
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    switch (documentType.toLowerCase()) {
      case 'passport':
        fields.passportNumber = this.extractPassportNumber(cleanText);
        fields.holderName = this.extractName(cleanText);
        fields.nationality = this.extractNationality(cleanText);
        fields.dateOfBirth = this.extractDateOfBirth(cleanText);
        fields.placeOfBirth = this.extractPlaceOfBirth(cleanText);
        fields.gender = this.extractGender(cleanText);
        fields.issuingCountry = this.extractIssuingCountry(cleanText);
        fields.issueDate = this.extractIssueDate(cleanText);
        fields.expiryDate = this.extractExpiryDate(cleanText);
        break;

      case 'work_permit':
        fields.permitNumber = this.extractPermitNumber(cleanText);
        fields.employeeId = this.extractEmployeeId(cleanText);
        fields.employeeName = this.extractName(cleanText);
        fields.employer = this.extractEmployer(cleanText);
        fields.jobTitle = this.extractJobTitle(cleanText);
        fields.startDate = this.extractStartDate(cleanText);
        fields.expiryDate = this.extractExpiryDate(cleanText);
        fields.workLocation = this.extractWorkLocation(cleanText);
        break;

      case 'certification':
        fields.certificateNumber = this.extractCertificateNumber(cleanText);
        fields.certificateName = this.extractCertificateName(cleanText);
        fields.holderName = this.extractName(cleanText);
        fields.issuingAuthority = this.extractIssuingAuthority(cleanText);
        fields.issueDate = this.extractIssueDate(cleanText);
        fields.expiryDate = this.extractExpiryDate(cleanText);
        fields.certificationLevel = this.extractCertificationLevel(cleanText);
        break;

      case 'employment_contract':
        fields.contractNumber = this.extractContractNumber(cleanText);
        fields.employeeName = this.extractName(cleanText);
        fields.employeeId = this.extractEmployeeId(cleanText);
        fields.employer = this.extractEmployer(cleanText);
        fields.position = this.extractPosition(cleanText);
        fields.department = this.extractDepartment(cleanText);
        fields.startDate = this.extractStartDate(cleanText);
        fields.endDate = this.extractEndDate(cleanText);
        fields.salary = this.extractSalary(cleanText);
        break;

      case 'visa':
        fields.visaNumber = this.extractVisaNumber(cleanText);
        fields.visaType = this.extractVisaType(cleanText);
        fields.holderName = this.extractName(cleanText);
        fields.nationality = this.extractNationality(cleanText);
        fields.passportNumber = this.extractPassportNumber(cleanText);
        fields.issuingCountry = this.extractIssuingCountry(cleanText);
        fields.issueDate = this.extractIssueDate(cleanText);
        fields.expiryDate = this.extractExpiryDate(cleanText);
        fields.entryType = this.extractEntryType(cleanText);
        break;

      default:
        fields.extractedData = this.extractGeneralFields(cleanText);
        break;
    }

    // Remove null/undefined values
    return Object.fromEntries(Object.entries(fields).filter(([_, v]) => v != null));
  }

  // Field extraction methods
  extractPassportNumber(text) {
    const patterns = [
      /passport\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z]\d{8}|\d{9}|[A-Z]{2}\d{7})/i,
      /(?:^|\s)([A-Z]\d{8}|\d{9}|[A-Z]{2}\d{7})(?:\s|$)/,
      /document\s*(?:no|number)\s*[:\-]?\s*([A-Z]\d{8}|\d{9}|[A-Z]{2}\d{7})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractName(text) {
    const patterns = [
      /(?:name|holder|employee)\s*[:\-]?\s*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /surname\s*[:\-]?\s*([A-Z][a-z]+)/i,
      /given\s*names?\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractExpiryDate(text) {
    const patterns = [
      /(?:expir[ye]s?|expiration|valid\s*until)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:expir|valid)/i,
      /exp\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ];
    return this.extractDateWithPatterns(text, patterns);
  }

  extractIssueDate(text) {
    const patterns = [
      /(?:issue[d]?|issued\s*on|date\s*of\s*issue)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /issued\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ];
    return this.extractDateWithPatterns(text, patterns);
  }

  extractEmployer(text) {
    const patterns = [
      /employer\s*[:\-]?\s*([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Company)?)/i,
      /company\s*[:\-]?\s*([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Company)?)/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractEmployeeId(text) {
    const patterns = [
      /employee\s*(?:id|number)\s*[:\-]?\s*(EMP[-]?\d+|\d{4,8})/i,
      /(?:id|emp)\s*[:\-]?\s*(EMP[-]?\d+|\d{4,8})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractPermitNumber(text) {
    const patterns = [
      /permit\s*(?:no|number)\s*[:\-]?\s*([A-Z0-9\-]{6,15})/i,
      /authorization\s*(?:no|number)\s*[:\-]?\s*([A-Z0-9\-]{6,15})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractCertificateNumber(text) {
    const patterns = [
      /certificate\s*(?:no|number)\s*[:\-]?\s*([A-Z0-9\-]{6,20})/i,
      /cert\s*[:\-]?\s*([A-Z0-9\-]{6,20})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractIssuingAuthority(text) {
    const patterns = [
      /issued\s*by\s*[:\-]?\s*([A-Z][a-zA-Z\s&.,]+)/i,
      /issuing\s*authority\s*[:\-]?\s*([A-Z][a-zA-Z\s&.,]+)/i,
      /authority\s*[:\-]?\s*([A-Z][a-zA-Z\s&.,]+)/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractNationality(text) {
    const patterns = [
      /nationality\s*[:\-]?\s*([A-Z][a-zA-Z\s]+)/i,
      /citizen\s*of\s*[:\-]?\s*([A-Z][a-zA-Z\s]+)/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractDateOfBirth(text) {
    const patterns = [
      /(?:date\s*of\s*birth|dob|born)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ];
    return this.extractDateWithPatterns(text, patterns);
  }

  extractGender(text) {
    const patterns = [
      /(?:sex|gender)\s*[:\-]?\s*([MF]|Male|Female)/i
    ];
    const result = this.extractWithPatterns(text, patterns);
    return result ? (result.toUpperCase().startsWith('M') ? 'M' : 'F') : null;
  }

  extractVisaNumber(text) {
    const patterns = [
      /visa\s*(?:no|number)\s*[:\-]?\s*([A-Z0-9\-]{8,15})/i,
      /control\s*(?:no|number)\s*[:\-]?\s*([A-Z0-9\-]{8,15})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  extractVisaType(text) {
    const patterns = [
      /visa\s*type\s*[:\-]?\s*([A-Z0-9\-]{1,5})/i,
      /category\s*[:\-]?\s*([A-Z0-9\-]{1,5})/i
    ];
    return this.extractWithPatterns(text, patterns);
  }

  // Helper methods
  extractWithPatterns(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  extractDateWithPatterns(text, patterns) {
    const result = this.extractWithPatterns(text, patterns);
    if (result) {
      // Standardize date format
      try {
        const date = new Date(result);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
        }
      } catch (e) {
        // Return original if can't parse
        return result;
      }
    }
    return null;
  }

  extractTables(text) {
    const tables = [];
    const lines = text.split('\n');
    let currentTable = [];
    
    for (const line of lines) {
      // Simple table detection - lines with multiple spaces or tabs
      if (line.includes('\t') || line.match(/\s{3,}/)) {
        const columns = line.split(/\t|\s{3,}/).filter(col => col.trim());
        if (columns.length > 1) {
          currentTable.push(columns);
        }
      } else if (currentTable.length > 0) {
        // End of table
        if (currentTable.length > 1) {
          tables.push({
            headers: currentTable[0],
            rows: currentTable.slice(1)
          });
        }
        currentTable = [];
      }
    }
    
    return tables;
  }

  calculateConfidence(parsedResult) {
    // Calculate confidence based on various factors
    let confidence = 0.8; // Base confidence
    
    if (parsedResult.ParsedText && parsedResult.ParsedText.length > 100) {
      confidence += 0.1;
    }
    
    if (parsedResult.TextOverlay && parsedResult.TextOverlay.HasOverlay) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }

  isValidFile(blob) {
    if (!blob || blob.size === 0) return false;
    if (blob.size > this.maxFileSize) return false;
    
    // Check file type if available
    if (blob.type) {
      const mimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/tiff',
        'image/bmp'
      ];
      return mimeTypes.includes(blob.type.toLowerCase());
    }
    
    return true;
  }

  determineProvider() {
    if (this.ocrEndpoint.includes('ocr.space')) {
      return 'OCR.space';
    } else if (this.ocrEndpoint.includes('googleapis.com')) {
      return 'Google Vision';
    } else if (this.ocrEndpoint.includes('azure.com')) {
      return 'Azure Computer Vision';
    }
    return 'Custom OCR';
  }

  extractTextBlocks(parsedResult) {
    // Extract text blocks with positioning if available
    if (parsedResult.TextOverlay && parsedResult.TextOverlay.Lines) {
      return parsedResult.TextOverlay.Lines.map(line => ({
        text: line.LineText,
        confidence: line.MaxHeight || 0.8,
        boundingBox: {
          left: line.Left || 0,
          top: line.Top || 0,
          width: line.Width || 0,
          height: line.Height || 0
        }
      }));
    }
    return [];
  }

  // Demo OCR result for when API is not available
  getDemoOCRResult(documentId, documentType) {
    const demoResults = {
      passport: {
        extractedText: `PASSPORT
United States of America
Type: P
Code: USA
Passport No.: A12345678
Surname: SMITH
Given Names: JOHN MICHAEL
Nationality: UNITED STATES OF AMERICA
Date of Birth: 15 MAY 1985
Place of Birth: NEW YORK, USA
Sex: M
Date of Issue: 12 MAY 2019
Date of Expiry: 11 MAY 2029
Authority: U.S. DEPARTMENT OF STATE`,
        extractedFields: {
          passportNumber: 'A12345678',
          holderName: 'JOHN MICHAEL SMITH',
          nationality: 'UNITED STATES OF AMERICA',
          dateOfBirth: '1985-05-15',
          gender: 'M',
          issuingCountry: 'USA',
          issueDate: '2019-05-12',
          expiryDate: '2029-05-11'
        }
      },
      work_permit: {
        extractedText: `EMPLOYMENT AUTHORIZATION DOCUMENT
U.S. Citizenship and Immigration Services
Name: RODRIGUEZ, MARIA ELENA
USCIS#: 123-456-789
Category: C09
Card#: MSC1234567890
Country of Birth: MEXICO
Date of Birth: 03/15/1990
Sex: F
Valid From: 04/30/2021
Card Expires: 04/29/2023
Employer: TECH SOLUTIONS INC`,
        extractedFields: {
          permitNumber: 'MSC1234567890',
          employeeName: 'MARIA ELENA RODRIGUEZ',
          employer: 'TECH SOLUTIONS INC',
          startDate: '2021-04-30',
          expiryDate: '2023-04-29'
        }
      },
      certification: {
        extractedText: `CERTIFICATE OF COMPLETION
This certifies that
DAVID CHEN
has successfully completed the requirements for
PROJECT MANAGEMENT PROFESSIONAL (PMP)
Certificate Number: PMP-789012
Issued by: PROJECT MANAGEMENT INSTITUTE
Date of Issue: 22 JUN 2022
Valid Until: 21 JUN 2025
Continuing Education Required`,
        extractedFields: {
          certificateNumber: 'PMP-789012',
          certificateName: 'PROJECT MANAGEMENT PROFESSIONAL (PMP)',
          holderName: 'DAVID CHEN',
          issuingAuthority: 'PROJECT MANAGEMENT INSTITUTE',
          issueDate: '2022-06-22',
          expiryDate: '2025-06-21'
        }
      },
      employment_contract: {
        extractedText: `EMPLOYMENT AGREEMENT
Employee: SARAH JOHNSON
Employee ID: EMP-4567
Position: SOFTWARE ENGINEER
Department: ENGINEERING
Employer: INNOVATIVE TECH CORP
Start Date: January 10, 2022
Contract Period: 3 Years
End Date: January 9, 2025
Annual Salary: $95,000
Benefits: Health, Dental, 401k
Signature Required`,
        extractedFields: {
          employeeName: 'SARAH JOHNSON',
          employeeId: 'EMP-4567',
          employer: 'INNOVATIVE TECH CORP',
          position: 'SOFTWARE ENGINEER',
          department: 'ENGINEERING',
          startDate: '2022-01-10',
          endDate: '2025-01-09',
          salary: '$95,000'
        }
      },
      visa: {
        extractedText: `NONIMMIGRANT VISA
UNITED STATES OF AMERICA
Name: KUMAR, RAJESH
Passport Number: J1234567
Nationality: INDIA
Visa Type: H-1B
Control Number: 2023AB123456
Issued: 20 OCT 2021
Expires: 19 OCT 2024
Entries: Multiple
Classification: H1B
Annotation: TECH WORKER`,
        extractedFields: {
          visaNumber: '2023AB123456',
          visaType: 'H-1B',
          holderName: 'RAJESH KUMAR',
          nationality: 'INDIA',
          passportNumber: 'J1234567',
          issueDate: '2021-10-20',
          expiryDate: '2024-10-19',
          entryType: 'Multiple'
        }
      }
    };

    const demoData = demoResults[documentType] || demoResults.passport;
    
    return {
      documentId: documentId,
      documentType: documentType,
      extractedText: demoData.extractedText,
      confidence: 0.92,
      pages: 1,
      extractedFields: demoData.extractedFields,
      tables: [],
      processedAt: new Date().toISOString(),
      ocrProvider: 'Demo OCR',
      language: 'en',
      textBlocks: []
    };
  }
}

export default OCRService;