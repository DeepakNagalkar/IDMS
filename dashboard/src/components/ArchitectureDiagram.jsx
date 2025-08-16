import React from 'react';

const ArchitectureDiagram = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Analytics System Architecture</h2>
      
      {/* Main Architecture Flow */}
      <div className="relative">
        <svg viewBox="0 0 1200 800" className="w-full h-auto">
          {/* Background */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f8fafc', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#e2e8f0', stopOpacity: 1}} />
            </linearGradient>
            
            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
              </marker>
            </defs>
          </defs>
          
          <rect width="1200" height="800" fill="url(#bgGradient)" rx="10" />
          
          {/* Title */}
          <text x="600" y="40" textAnchor="middle" className="text-xl font-bold" fill="#1f2937">
            Document Processing Pipeline - OpenText DMS to Dashboard
          </text>
          
          {/* Layer 1: Data Sources */}
          <g>
            <rect x="50" y="100" width="200" height="120" rx="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
            <text x="150" y="125" textAnchor="middle" className="font-semibold" fill="#1e40af">Data Sources</text>
            
            {/* OpenText DMS */}
            <rect x="70" y="140" width="160" height="40" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="150" y="165" textAnchor="middle" className="text-sm font-medium" fill="#92400e">OpenText DMS</text>
            
            {/* SAP SuccessFactors */}
            <rect x="70" y="190" width="160" height="25" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1"/>
            <text x="150" y="207" textAnchor="middle" className="text-xs" fill="#047857">SAP SuccessFactors</text>
          </g>
          
          {/* Arrow 1 */}
          <line x1="250" y1="160" x2="320" y2="160" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrowhead)"/>
          <text x="285" y="150" textAnchor="middle" className="text-xs font-medium" fill="#4f46e5">Batch Sync</text>
          <text x="285" y="177" textAnchor="middle" className="text-xs" fill="#6b7280">Every 4 hours</text>
          
          {/* Layer 2: Document Connector */}
          <g>
            <rect x="340" y="100" width="180" height="120" rx="10" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="2"/>
            <text x="430" y="125" textAnchor="middle" className="font-semibold" fill="#7c3aed">Document Connector</text>
            
            {/* Batch Processing */}
            <rect x="360" y="140" width="140" height="35" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="430" y="162" textAnchor="middle" className="text-sm font-medium" fill="#92400e">Batch Processing</text>
            
            {/* Document Download */}
            <rect x="360" y="185" width="140" height="25" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1"/>
            <text x="430" y="200" textAnchor="middle" className="text-xs" fill="#047857">Document Download</text>
          </g>
          
          {/* Arrow 2 */}
          <line x1="520" y1="160" x2="590" y2="160" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrowhead)"/>
          <text x="555" y="150" textAnchor="middle" className="text-xs font-medium" fill="#4f46e5">PDF/Images</text>
          
          {/* Layer 3: OCR Processing */}
          <g>
            <rect x="610" y="100" width="180" height="120" rx="10" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
            <text x="700" y="125" textAnchor="middle" className="font-semibold" fill="#dc2626">OCR Processing</text>
            
            {/* Text Extraction */}
            <rect x="630" y="140" width="140" height="25" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="700" y="155" textAnchor="middle" className="text-xs font-medium" fill="#92400e">Text Extraction</text>
            
            {/* Field Detection */}
            <rect x="630" y="170" width="140" height="25" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1"/>
            <text x="700" y="185" textAnchor="middle" className="text-xs" fill="#047857">Field Detection</text>
            
            {/* Metadata Generation */}
            <rect x="630" y="195" width="140" height="20" rx="5" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1"/>
            <text x="700" y="207" textAnchor="middle" className="text-xs" fill="#4f46e5">Metadata Gen</text>
          </g>
          
          {/* Arrow 3 */}
          <line x1="790" y1="160" x2="860" y2="160" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrowhead)"/>
          <text x="825" y="150" textAnchor="middle" className="text-xs font-medium" fill="#4f46e5">Structured Data</text>
          
          {/* Layer 4: LLM Analysis */}
          <g>
            <rect x="880" y="100" width="180" height="120" rx="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="2"/>
            <text x="970" y="125" textAnchor="middle" className="font-semibold" fill="#059669">LLM Analysis (OpenAI)</text>
            
            {/* Document Validation */}
            <rect x="900" y="140" width="140" height="22" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="970" y="153" textAnchor="middle" className="text-xs font-medium" fill="#92400e">Document Validation</text>
            
            {/* Expiry Detection */}
            <rect x="900" y="167" width="140" height="22" rx="5" fill="#fee2e2" stroke="#ef4444" strokeWidth="1"/>
            <text x="970" y="180" textAnchor="middle" className="text-xs" fill="#dc2626">Expiry Detection</text>
            
            {/* Data Mismatch */}
            <rect x="900" y="194" width="140" height="21" rx="5" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1"/>
            <text x="970" y="206" textAnchor="middle" className="text-xs" fill="#4f46e5">Data Mismatch Check</text>
          </g>
          
          {/* Arrow down to Database */}
          <line x1="970" y1="220" x2="970" y2="290" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrowhead)"/>
          <text x="1000" y="255" className="text-xs font-medium" fill="#4f46e5">Analysis Results</text>
          
          {/* Layer 5: Database Storage */}
          <g>
            <rect x="850" y="310" width="240" height="100" rx="10" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2"/>
            <text x="970" y="335" textAnchor="middle" className="font-semibold" fill="#d97706">Database Storage</text>
            
            {/* Document Analysis Table */}
            <rect x="870" y="350" width="90" height="25" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1"/>
            <text x="915" y="365" textAnchor="middle" className="text-xs" fill="#1e40af">Document Analysis</text>
            
            {/* OCR Metadata Table */}
            <rect x="970" y="350" width="90" height="25" rx="3" fill="#dcfce7" stroke="#16a34a" strokeWidth="1"/>
            <text x="1015" y="365" textAnchor="middle" className="text-xs" fill="#15803d">OCR Metadata</text>
            
            {/* Job History */}
            <rect x="870" y="380" width="90" height="25" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="915" y="395" textAnchor="middle" className="text-xs" fill="#d97706">Job History</text>
            
            {/* Employee Info */}
            <rect x="970" y="380" width="90" height="25" rx="3" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="1"/>
            <text x="1015" y="395" textAnchor="middle" className="text-xs" fill="#7c3aed">Employee Info</text>
          </g>
          
          {/* Arrow to Dashboard */}
          <line x1="850" y1="360" x2="650" y2="480" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arrowhead)"/>
          <text x="720" y="410" className="text-xs font-medium" fill="#4f46e5">Query Data</text>
          
          {/* Layer 6: Dashboard */}
          <g>
            <rect x="450" y="500" width="400" height="150" rx="10" fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="2"/>
            <text x="650" y="525" textAnchor="middle" className="font-semibold" fill="#0284c7">Analytics Dashboard</text>
            
            {/* Dashboard Components */}
            <rect x="470" y="540" width="110" height="35" rx="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1"/>
            <text x="525" y="560" textAnchor="middle" className="text-xs font-medium" fill="#1e40af">Document Overview</text>
            
            <rect x="590" y="540" width="110" height="35" rx="5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1"/>
            <text x="645" y="560" textAnchor="middle" className="text-xs font-medium" fill="#15803d">Expiry Alerts</text>
            
            <rect x="710" y="540" width="110" height="35" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="765" y="560" textAnchor="middle" className="text-xs font-medium" fill="#d97706">Compliance Status</text>
            
            <rect x="470" y="585" width="110" height="35" rx="5" fill="#fee2e2" stroke="#ef4444" strokeWidth="1"/>
            <text x="525" y="605" textAnchor="middle" className="text-xs font-medium" fill="#dc2626">Risk Assessment</text>
            
            <rect x="590" y="585" width="110" height="35" rx="5" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="1"/>
            <text x="645" y="605" textAnchor="middle" className="text-xs font-medium" fill="#7c3aed">Data Quality</text>
            
            <rect x="710" y="585" width="110" height="35" rx="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="1"/>
            <text x="765" y="605" textAnchor="middle" className="text-xs font-medium" fill="#047857">Department View</text>
          </g>
          
          {/* Side Components */}
          
          {/* Scheduled Job Service */}
          <g>
            <rect x="50" y="280" width="200" height="80" rx="10" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
            <text x="150" y="305" textAnchor="middle" className="font-semibold" fill="#dc2626">Scheduled Jobs</text>
            
            <rect x="70" y="315" width="160" height="20" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
            <text x="150" y="327" textAnchor="middle" className="text-xs" fill="#d97706">Every 4 Hours</text>
            
            <rect x="70" y="340" width="160" height="15" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1"/>
            <text x="150" y="349" textAnchor="middle" className="text-xs" fill="#4f46e5">Manual Trigger</text>
          </g>
          
          {/* Arrow from Scheduled Jobs to Connector */}
          <line x1="250" y1="300" x2="340" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)"/>
          <text x="280" y="240" className="text-xs" fill="#ef4444">Triggers</text>
          
          {/* Document Types */}
          <g>
            <rect x="50" y="450" width="200" height="120" rx="10" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2"/>
            <text x="150" y="475" textAnchor="middle" className="font-semibold" fill="#16a34a">Document Types</text>
            
            <text x="70" y="495" className="text-xs" fill="#15803d">• Passports</text>
            <text x="70" y="510" className="text-xs" fill="#15803d">• Work Permits</text>
            <text x="70" y="525" className="text-xs" fill="#15803d">• Certifications</text>
            <text x="70" y="540" className="text-xs" fill="#15803d">• Employment Contracts</text>
            <text x="70" y="555" className="text-xs" fill="#15803d">• Visas</text>
          </g>
          
          {/* Processing Statistics */}
          <g>
            <rect x="950" y="450" width="200" height="120" rx="10" fill="#fefce8" stroke="#eab308" strokeWidth="2"/>
            <text x="1050" y="475" textAnchor="middle" className="font-semibold" fill="#ca8a04">Processing Stats</text>
            
            <text x="970" y="495" className="text-xs" fill="#a16207">• Batch Size: 50 docs</text>
            <text x="970" y="510" className="text-xs" fill="#a16207">• Concurrency: 3 parallel</text>
            <text x="970" y="525" className="text-xs" fill="#a16207">• Success Rate: 95%</text>
            <text x="970" y="540" className="text-xs" fill="#a16207">• Avg Processing: 30s</text>
            <text x="970" y="555" className="text-xs" fill="#a16207">• Daily Volume: 1200+</text>
          </g>
          
          {/* Data Flow Labels */}
          <text x="600" y="750" textAnchor="middle" className="text-lg font-bold" fill="#374151">
            Real-time Document Analytics Pipeline
          </text>
          <text x="600" y="770" textAnchor="middle" className="text-sm" fill="#6b7280">
            Automated processing with manual oversight and compliance monitoring
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">Data Sources</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-200 border border-purple-500 rounded"></div>
          <span className="text-sm text-gray-700">Processing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 border border-green-500 rounded"></div>
          <span className="text-sm text-gray-700">AI/ML Services</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700">Storage & UI</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;