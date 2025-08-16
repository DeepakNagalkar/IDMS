// Mock data for document analytics

// Document status summary for stats cards
export const documentStats = [
  {
    title: 'Valid Documents',
    value: '7,832',
    change: '+3.2%',
    trend: 'up',
    icon: {
      path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-green-500'
    }
  },
  {
    title: 'Expired Documents',
    value: '184',
    change: '-5.1%',
    trend: 'down',
    icon: {
      path: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-red-500'
    }
  },
  {
    title: 'Expiring Soon',
    value: '243',
    change: '+12.5%',
    trend: 'up',
    icon: {
      path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-amber-500'
    }
  },
  {
    title: 'Compliance Rate',
    value: '92.4%',
    change: '+1.8%',
    trend: 'up',
    icon: {
      path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      bgColor: 'bg-blue-500'
    }
  }
];

// Document expiration timeline data
export const expirationTimelineData = [
  { days: '0-30 days', count: 86 },
  { days: '31-60 days', count: 72 },
  { days: '61-90 days', count: 85 },
  { days: '91-180 days', count: 132 },
  { days: '181-365 days', count: 245 },
  { days: '>365 days', count: 540 },
];

// Updated document type distribution with more specific categories
export const documentTypeData = [
  { name: 'Passports', value: 742 },
  { name: 'Work Permits', value: 430 },
  { name: 'Certifications', value: 980 },
  { name: 'Employment Contracts', value: 745 },
  { name: 'Visas', value: 498 },
  { name: 'Tax Forms', value: 865 },
  { name: 'ID Cards', value: 498 },
];

// Department compliance data
export const departmentComplianceData = [
  { name: 'HR', compliance: 97.5, documentCount: 845 },
  { name: 'Finance', compliance: 94.2, documentCount: 623 },
  { name: 'IT', compliance: 91.8, documentCount: 712 },
  { name: 'Operations', compliance: 88.3, documentCount: 932 },
  { name: 'Sales', compliance: 85.1, documentCount: 543 },
  { name: 'Marketing', compliance: 93.7, documentCount: 321 },
];

// Monthly document processing data
export const processingData = [
  { month: 'Jan', processed: 540, withIssues: 32 },
  { month: 'Feb', processed: 620, withIssues: 41 },
  { month: 'Mar', processed: 710, withIssues: 38 },
  { month: 'Apr', processed: 590, withIssues: 25 },
  { month: 'May', processed: 730, withIssues: 44 },
  { month: 'Jun', processed: 810, withIssues: 51 },
];

// Document validation status data
export const validationStatusData = [
  { name: 'Valid', value: 7832 },
  { name: 'Expired', value: 184 },
  { name: 'Missing Info', value: 156 },
  { name: 'Incorrect Data', value: 92 },
  { name: 'Pending Review', value: 245 },
];

// Documents with issues by type
export const documentIssuesData = [
  { subject: 'Expiration Date', count: 184 },
  { subject: 'Missing Information', count: 156 },
  { subject: 'Data Mismatch', count: 92 },
  { subject: 'Format Issues', count: 78 },
  { subject: 'System Processing Error', count: 35 },
];

// Document expiration by type
export const documentExpirationByType = [
  { type: 'Passports', expired: 38, expiringSoon: 54, valid: 650 },
  { type: 'Work Permits', expired: 62, expiringSoon: 83, valid: 285 },
  { type: 'Certifications', expired: 23, expiringSoon: 47, valid: 910 },
  { type: 'Employment Contracts', expired: 15, expiringSoon: 28, valid: 702 },
  { type: 'Visas', expired: 46, expiringSoon: 31, valid: 421 },
];

// Sample document records for detailed view
export const sampleDocuments = [
  {
    id: 'DOC-1001',
    employeeId: 'EMP-5432',
    employeeName: 'John Smith',
    documentType: 'Passport',
    issuedBy: 'United States',
    issueDate: '2019-05-12',
    expiryDate: '2029-05-11',
    status: 'Valid',
    verificationDate: '2023-01-15',
    verifiedBy: 'HR System',
    issues: [],
  },
  {
    id: 'DOC-1002',
    employeeId: 'EMP-5432',
    employeeName: 'John Smith',
    documentType: 'Work Permit',
    issuedBy: 'Department of Labor',
    issueDate: '2022-03-10',
    expiryDate: '2024-03-09',
    status: 'Expiring Soon',
    verificationDate: '2023-01-15',
    verifiedBy: 'HR System',
    issues: [],
  },
  {
    id: 'DOC-1003',
    employeeId: 'EMP-6543',
    employeeName: 'Maria Rodriguez',
    documentType: 'Employment Contract',
    issuedBy: 'Company HR',
    issueDate: '2021-08-15',
    expiryDate: '2024-08-14',
    status: 'Valid',
    verificationDate: '2023-01-16',
    verifiedBy: 'HR Director',
    issues: [],
  },
  {
    id: 'DOC-1004',
    employeeId: 'EMP-6543',
    employeeName: 'Maria Rodriguez',
    documentType: 'Visa',
    issuedBy: 'United States',
    issueDate: '2020-11-03',
    expiryDate: '2023-11-02',
    status: 'Expired',
    verificationDate: '2023-01-16',
    verifiedBy: 'HR System',
    issues: ['Document expired', 'Renewal required'],
  },
  {
    id: 'DOC-1005',
    employeeId: 'EMP-7654',
    employeeName: 'David Chen',
    documentType: 'Certification',
    issuedBy: 'Oracle University',
    issueDate: '2022-06-22',
    expiryDate: '2025-06-21',
    status: 'Valid',
    verificationDate: '2023-01-17',
    verifiedBy: 'HR System',
    issues: [],
  },
  {
    id: 'DOC-1006',
    employeeId: 'EMP-7654',
    employeeName: 'David Chen',
    documentType: 'Employment Contract',
    issuedBy: 'Company HR',
    issueDate: '2022-01-10',
    expiryDate: '2025-01-09',
    status: 'Valid',
    verificationDate: '2023-01-17',
    verifiedBy: 'HR Director',
    issues: ['Missing signature page'],
  },
  {
    id: 'DOC-1007',
    employeeId: 'EMP-8765',
    employeeName: 'Sarah Johnson',
    documentType: 'Work Permit',
    issuedBy: 'Department of Labor',
    issueDate: '2021-04-30',
    expiryDate: '2023-04-29',
    status: 'Expired',
    verificationDate: '2023-01-18',
    verifiedBy: 'HR System',
    issues: ['Document expired', 'Renewal in progress'],
  },
  {
    id: 'DOC-1008',
    employeeId: 'EMP-8765',
    employeeName: 'Sarah Johnson',
    documentType: 'Passport',
    issuedBy: 'United Kingdom',
    issueDate: '2018-09-05',
    expiryDate: '2028-09-04',
    status: 'Valid',
    verificationDate: '2023-01-18',
    verifiedBy: 'HR System',
    issues: [],
  },
  {
    id: 'DOC-1009',
    employeeId: 'EMP-9876',
    employeeName: 'Mohammed Al-Farsi',
    documentType: 'Certification',
    issuedBy: 'Microsoft Learning',
    issueDate: '2020-12-15',
    expiryDate: '2023-12-14',
    status: 'Expiring Soon',
    verificationDate: '2023-01-19',
    verifiedBy: 'HR System',
    issues: [],
  },
  {
    id: 'DOC-1010',
    employeeId: 'EMP-9876',
    employeeName: 'Mohammed Al-Farsi',
    documentType: 'Visa',
    issuedBy: 'United States',
    issueDate: '2021-10-20',
    expiryDate: '2024-10-19',
    status: 'Valid',
    verificationDate: '2023-01-19',
    verifiedBy: 'HR System',
    issues: ['Data mismatch with passport'],
  },
];

// Colors for charts
export const DOCUMENT_COLORS = [
  '#4C9BE8', // Blue
  '#E86C4C', // Red
  '#4CE89B', // Green
  '#E8DB4C', // Yellow
  '#9B4CE8', // Purple
  '#E84C9B', // Pink
  '#4CE8E8', // Cyan
  '#E8864C', // Orange
];