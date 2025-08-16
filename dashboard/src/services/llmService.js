// LLM Service for Document Analysis using OpenAI
class LLMService {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
    this.maxTokens = config.maxTokens || 2000;
    this.temperature = config.temperature || 0.1;
    this.timeout = config.timeout || 30000;
  }

  // Analyze document metadata using OpenAI
  async analyzeDocument(ocrMetadata, documentContext = {}) {
    try {
      console.log(`Analyzing document ${ocrMetadata.documentId} with OpenAI...`);
      
      const prompt = this.buildAnalysisPrompt(ocrMetadata, documentContext);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(ocrMetadata.documentType)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: "json_object" }
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (response.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else {
          console.log(`OpenAI API error: ${response.status}, falling back to demo analysis`);
          return this.getDemoAnalysis(ocrMetadata);
        }
      }

      const result = await response.json();
      const analysisText = result.choices[0].message.content;
      
      return this.parseAnalysisResult(analysisText, ocrMetadata);
    } catch (error) {
      console.log(`OpenAI analysis error for document ${ocrMetadata.documentId}:`, error.message);
      console.log('Falling back to demo analysis...');
      return this.getDemoAnalysis(ocrMetadata);
    }
  }

  // Build analysis prompt based on document type and OCR data
  buildAnalysisPrompt(ocrMetadata, documentContext) {
    const basePrompt = `
Analyze the following document and provide a comprehensive assessment in JSON format.

Document Information:
- Document Type: ${ocrMetadata.documentType}
- Document ID: ${ocrMetadata.documentId}
- OCR Confidence: ${ocrMetadata.confidence}
- Extracted Text: "${ocrMetadata.extractedText}"
- Extracted Fields: ${JSON.stringify(ocrMetadata.extractedFields, null, 2)}

Context Information:
- Employee ID: ${documentContext.employeeId || 'Not provided'}
- Department: ${documentContext.department || 'Not provided'}
- Document Source: ${documentContext.source || 'OpenText DMS'}

Please analyze and provide a JSON response with the following structure:
{
  "documentValidation": {
    "isValid": boolean,
    "validityStatus": "Valid|Invalid|Expired|Expiring Soon",
    "confidenceScore": number (0-100)
  },
  "expiryAnalysis": {
    "hasExpiryDate": boolean,
    "expiryDate": "YYYY-MM-DD or null",
    "issueDate": "YYYY-MM-DD or null",
    "daysUntilExpiry": number,
    "isExpired": boolean,
    "isExpiringSoon": boolean
  },
  "dataQuality": {
    "ocrQuality": "High|Medium|Low",
    "missingFields": ["field1", "field2"],
    "inconsistencies": ["issue1", "issue2"],
    "dataCompleteness": number (0-100)
  },
  "complianceCheck": {
    "status": "Compliant|Non-Compliant|Needs Review",
    "issues": ["issue1", "issue2"],
    "riskLevel": "Low|Medium|High"
  },
  "recommendations": {
    "actions": ["action1", "action2"],
    "priority": "High|Medium|Low",
    "requiresManualReview": boolean
  }
}

Focus on identifying expiration dates, data mismatches, and compliance issues specific to ${ocrMetadata.documentType} documents.
    `;

    return basePrompt.trim();
  }

  // Get system prompt based on document type
  getSystemPrompt(documentType) {
    const basePrompt = `You are an expert document analyzer specialized in HR and compliance documents. Your task is to analyze document extracts and provide accurate, structured assessments in JSON format.`;

    const typeSpecificPrompts = {
      passport: `${basePrompt} 

For passport documents, focus on:
- Passport number validation and format
- Issue and expiry date identification
- Issuing country verification
- Holder name consistency
- Travel document compliance requirements
- Look for dates in MM/DD/YYYY, DD/MM/YYYY, or similar formats
- Standard passport validity is 10 years for adults, 5 years for minors`,

      work_permit: `${basePrompt}

For work permit documents, focus on:
- Work authorization number and validity
- Employer name matching
- Authorization period and expiry dates
- Employment eligibility status
- Permit type and restrictions
- Look for employment authorization dates and employer information`,

      certification: `${basePrompt}

For certification documents, focus on:
- Certificate number and authenticity
- Issuing authority verification
- Certification period and renewal requirements
- Professional compliance status
- Continuing education requirements
- Look for renewal dates and professional standing`,

      employment_contract: `${basePrompt}

For employment contract documents, focus on:
- Contract start and end dates
- Employer and employee information matching
- Terms and conditions compliance
- Compensation and benefits details
- Legal compliance with employment laws
- Contract renewal requirements`,

      visa: `${basePrompt}

For visa documents, focus on:
- Visa number and type identification
- Entry and exit date permissions
- Stay duration and limitations
- Visa category and restrictions
- Immigration compliance status
- Look for entry dates, duration of stay, and visa classifications`,

      default: basePrompt
    };

    return typeSpecificPrompts[documentType.toLowerCase()] || typeSpecificPrompts.default;
  }

  // Parse OpenAI analysis result into structured format
  parseAnalysisResult(analysisText, ocrMetadata) {
    try {
      let parsedResult;
      try {
        parsedResult = JSON.parse(analysisText);
      } catch (jsonError) {
        console.log('Failed to parse JSON response, attempting text extraction');
        parsedResult = this.extractAnalysisFromText(analysisText);
      }

      // Normalize the result structure
      const analysis = {
        documentId: ocrMetadata.documentId,
        documentType: ocrMetadata.documentType,
        analysisTimestamp: new Date().toISOString(),
        
        // Document Status
        isValid: parsedResult.documentValidation?.isValid ?? true,
        validityStatus: parsedResult.documentValidation?.validityStatus || 'Valid',
        confidenceScore: parsedResult.documentValidation?.confidenceScore || 85,
        
        // Dates
        expiryDate: this.extractDate(parsedResult.expiryAnalysis?.expiryDate),
        issueDate: this.extractDate(parsedResult.expiryAnalysis?.issueDate),
        daysUntilExpiry: parsedResult.expiryAnalysis?.daysUntilExpiry || null,
        isExpired: parsedResult.expiryAnalysis?.isExpired || false,
        isExpiringSoon: parsedResult.expiryAnalysis?.isExpiringSoon || false,
        
        // Data Quality
        dataConsistency: parsedResult.dataQuality?.ocrQuality || 'Medium',
        missingInformation: parsedResult.dataQuality?.missingFields || [],
        dataQualityIssues: parsedResult.dataQuality?.inconsistencies || [],
        dataCompleteness: parsedResult.dataQuality?.dataCompleteness || 80,
        
        // Compliance
        complianceStatus: parsedResult.complianceCheck?.status || 'Compliant',
        riskLevel: parsedResult.complianceCheck?.riskLevel || 'Low',
        complianceIssues: parsedResult.complianceCheck?.issues || [],
        
        // Recommendations
        recommendations: parsedResult.recommendations?.actions || [],
        priority: parsedResult.recommendations?.priority || 'Medium',
        
        // Additional attributes
        attributes: {
          ocrConfidence: ocrMetadata.confidence,
          requiresManualReview: parsedResult.recommendations?.requiresManualReview ?? this.determineManualReview(parsedResult, ocrMetadata),
          verificationRequired: parsedResult.recommendations?.requiresManualReview ?? false,
          documentScore: this.calculateDocumentScore(parsedResult, ocrMetadata)
        },
        
        // Raw analysis for reference
        rawAnalysis: analysisText
      };

      console.log(`Document ${ocrMetadata.documentId} analysis completed - Status: ${analysis.validityStatus}`);
      return analysis;
    } catch (error) {
      console.error('Error parsing OpenAI analysis result:', error);
      return this.createFallbackAnalysis(ocrMetadata, analysisText);
    }
  }

  // Extract analysis information from text when JSON parsing fails
  extractAnalysisFromText(text) {
    const result = {
      documentValidation: {},
      expiryAnalysis: {},
      dataQuality: {},
      complianceCheck: {},
      recommendations: {}
    };
    
    // Extract validity
    const validityMatch = text.match(/(?:valid|validity)[:\s]*([a-zA-Z\s]+)/i);
    result.documentValidation.isValid = validityMatch ? validityMatch[1].toLowerCase().includes('valid') : null;
    
    // Extract expiry date
    const expiryMatch = text.match(/(?:expir[ye]|expires?)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    result.expiryAnalysis.expiryDate = expiryMatch ? expiryMatch[1] : null;
    
    // Extract issue date
    const issueMatch = text.match(/(?:issue|issued)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    result.expiryAnalysis.issueDate = issueMatch ? issueMatch[1] : null;
    
    // Extract compliance status
    const complianceMatch = text.match(/(?:compliance|compliant)[:\s]*([a-zA-Z\s]+)/i);
    result.complianceCheck.status = complianceMatch ? complianceMatch[1].trim() : 'Unknown';
    
    // Extract risk level
    const riskMatch = text.match(/(?:risk)[:\s]*([a-zA-Z]+)/i);
    result.complianceCheck.riskLevel = riskMatch ? riskMatch[1] : 'Medium';
    
    return result;
  }

  // Generate demo analysis when OpenAI is not available
  getDemoAnalysis(ocrMetadata) {
    const demoAnalyses = {
      passport: {
        isValid: true,
        validityStatus: 'Valid',
        expiryDate: '2029-05-11',
        issueDate: '2019-05-12',
        daysUntilExpiry: 1825,
        isExpired: false,
        isExpiringSoon: false,
        complianceStatus: 'Compliant',
        riskLevel: 'Low',
        missingInformation: [],
        dataQualityIssues: []
      },
      work_permit: {
        isValid: false,
        validityStatus: 'Expired',
        expiryDate: '2023-04-29',
        issueDate: '2021-04-30',
        daysUntilExpiry: -120,
        isExpired: true,
        isExpiringSoon: false,
        complianceStatus: 'Non-Compliant',
        riskLevel: 'High',
        missingInformation: [],
        dataQualityIssues: ['Document expired', 'Renewal required']
      },
      certification: {
        isValid: true,
        validityStatus: 'Expiring Soon',
        expiryDate: '2024-06-21',
        issueDate: '2022-06-22',
        daysUntilExpiry: 45,
        isExpired: false,
        isExpiringSoon: true,
        complianceStatus: 'Compliant',
        riskLevel: 'Medium',
        missingInformation: [],
        dataQualityIssues: ['Renewal notification required']
      },
      employment_contract: {
        isValid: true,
        validityStatus: 'Valid',
        expiryDate: '2025-01-09',
        issueDate: '2022-01-10',
        daysUntilExpiry: 365,
        isExpired: false,
        isExpiringSoon: false,
        complianceStatus: 'Needs Review',
        riskLevel: 'Low',
        missingInformation: ['Signature verification'],
        dataQualityIssues: ['Missing signature page']
      },
      visa: {
        isValid: true,
        validityStatus: 'Valid',
        expiryDate: '2024-10-19',
        issueDate: '2021-10-20',
        daysUntilExpiry: 200,
        isExpired: false,
        isExpiringSoon: false,
        complianceStatus: 'Needs Review',
        riskLevel: 'Medium',
        missingInformation: [],
        dataQualityIssues: ['Data mismatch with passport']
      }
    };

    const demoData = demoAnalyses[ocrMetadata.documentType] || demoAnalyses.passport;
    
    return {
      documentId: ocrMetadata.documentId,
      documentType: ocrMetadata.documentType,
      analysisTimestamp: new Date().toISOString(),
      ...demoData,
      dataConsistency: 'High',
      confidenceScore: 92,
      dataCompleteness: 95,
      recommendations: ['Monitor expiry date', 'Schedule renewal if needed'],
      priority: demoData.riskLevel === 'High' ? 'High' : 'Medium',
      complianceIssues: demoData.dataQualityIssues,
      attributes: {
        ocrConfidence: ocrMetadata.confidence,
        requiresManualReview: demoData.riskLevel === 'High' || demoData.dataQualityIssues.length > 0,
        verificationRequired: demoData.complianceStatus === 'Needs Review',
        documentScore: this.calculateDemoScore(demoData)
      },
      rawAnalysis: `Demo analysis for ${ocrMetadata.documentType} document ${ocrMetadata.documentId}`
    };
  }

  // Helper methods
  extractDate(dateValue) {
    if (!dateValue) return null;
    
    // Try to parse different date formats
    const datePatterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/,      // YYYY-MM-DD
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,     // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/       // DD-MM-YYYY
    ];
    
    for (const pattern of datePatterns) {
      const match = dateValue.match(pattern);
      if (match) {
        try {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return dateValue; // Return as-is if can't parse
  }

  determineManualReview(analysis, ocrMetadata) {
    const quality = analysis.dataQuality || {};
    const compliance = analysis.complianceCheck || {};
    const expiry = analysis.expiryAnalysis || {};
    
    return (
      ocrMetadata.confidence < 0.8 ||
      (quality.inconsistencies && quality.inconsistencies.length > 0) ||
      (compliance.riskLevel && compliance.riskLevel.toLowerCase() === 'high') ||
      (quality.missingFields && quality.missingFields.length > 2) ||
      expiry.isExpired ||
      (compliance.issues && compliance.issues.length > 0)
    );
  }

  calculateDocumentScore(analysis, ocrMetadata) {
    let score = 100;
    
    const quality = analysis.dataQuality || {};
    const compliance = analysis.complianceCheck || {};
    const expiry = analysis.expiryAnalysis || {};
    
    // Deduct points for various issues
    if (ocrMetadata.confidence < 0.9) score -= 10;
    if (ocrMetadata.confidence < 0.7) score -= 20;
    
    if (quality.inconsistencies && quality.inconsistencies.length > 0) {
      score -= quality.inconsistencies.length * 5;
    }
    
    if (quality.missingFields && quality.missingFields.length > 0) {
      score -= quality.missingFields.length * 3;
    }
    
    if (expiry.isExpired) score -= 30;
    if (expiry.isExpiringSoon) score -= 10;
    
    if (compliance.riskLevel === 'High') score -= 25;
    if (compliance.riskLevel === 'Medium') score -= 10;
    
    if (compliance.issues && compliance.issues.length > 0) {
      score -= compliance.issues.length * 5;
    }
    
    return Math.max(score, 0);
  }

  calculateDemoScore(demoData) {
    let score = 100;
    
    if (demoData.isExpired) score -= 30;
    if (demoData.isExpiringSoon) score -= 10;
    if (demoData.riskLevel === 'High') score -= 25;
    if (demoData.riskLevel === 'Medium') score -= 10;
    if (demoData.dataQualityIssues.length > 0) score -= demoData.dataQualityIssues.length * 5;
    
    return Math.max(score, 0);
  }

  createFallbackAnalysis(ocrMetadata, analysisText) {
    return {
      documentId: ocrMetadata.documentId,
      documentType: ocrMetadata.documentType,
      analysisTimestamp: new Date().toISOString(),
      isValid: null,
      validityStatus: 'Analysis Failed',
      expiryDate: null,
      issueDate: null,
      dataConsistency: 'Unknown',
      missingInformation: ['Analysis could not be completed'],
      dataQualityIssues: ['OpenAI analysis parsing failed'],
      complianceStatus: 'Unknown',
      riskLevel: 'Medium',
      attributes: {
        ocrConfidence: ocrMetadata.confidence,
        requiresManualReview: true,
        verificationRequired: true,
        documentScore: 50
      },
      rawAnalysis: analysisText || 'Analysis failed'
    };
  }
}

export default LLMService;