import React from 'react';

const SystemArchitectureDiagram = () => {
  // Define architectural layers
  const layers = [
    { id: 'external', name: 'External Systems', y: 5, height: 12, color: '#EBF4FF', borderColor: '#3B82F6' },
    { id: 'integration', name: 'Integration Layer', y: 20, height: 12, color: '#F0FDF4', borderColor: '#10B981' },
    { id: 'processing', name: 'Processing Layer', y: 35, height: 12, color: '#FEF3C7', borderColor: '#F59E0B' },
    { id: 'data', name: 'Data Layer', y: 50, height: 12, color: '#FEE2E2', borderColor: '#EF4444' },
    { id: 'service', name: 'Service Layer', y: 65, height: 12, color: '#EDE9FE', borderColor: '#8B5CF6' },
    { id: 'presentation', name: 'Presentation Layer', y: 80, height: 12, color: '#E0F2FE', borderColor: '#0EA5E9' },
  ];

  // Define components for the architecture diagram
  const components = [
    // External Systems Layer
    { id: 'opentext', name: 'OpenText DMS', layer: 'external', x: 15, width: 20 },
    { id: 'sap', name: 'SAP SuccessFactors', layer: 'external', x: 65, width: 20 },
    
    // Integration Layer
    { id: 'api-gateway', name: 'API Gateway', layer: 'integration', x: 15, width: 15 },
    { id: 'esb', name: 'Enterprise Service Bus', layer: 'integration', x: 40, width: 20 },
    { id: 'event-broker', name: 'Event Broker', layer: 'integration', x: 70, width: 15 },
    
    // Processing Layer
    { id: 'doc-processor', name: 'Document Processor', layer: 'processing', x: 10, width: 15 },
    { id: 'ocr-engine', name: 'OCR Engine', layer: 'processing', x: 30, width: 15 },
    { id: 'llm-service', name: 'LLM Service', layer: 'processing', x: 50, width: 15 },
    { id: 'validation', name: 'Validation Engine', layer: 'processing', x: 70, width: 15 },
    
    // Data Layer
    { id: 'document-store', name: 'Document Store', layer: 'data', x: 15, width: 15 },
    { id: 'metadata-db', name: 'Metadata DB', layer: 'data', x: 40, width: 15 },
    { id: 'analytics-db', name: 'Analytics DB', layer: 'data', x: 65, width: 15 },
    
    // Service Layer
    { id: 'auth-service', name: 'Auth Service', layer: 'service', x: 10, width: 12 },
    { id: 'doc-service', name: 'Document Service', layer: 'service', x: 25, width: 12 },
    { id: 'analytics-service', name: 'Analytics Service', layer: 'service', x: 40, width: 12 },
    { id: 'notification', name: 'Notification Service', layer: 'service', x: 55, width: 12 },
    { id: 'audit', name: 'Audit Service', layer: 'service', x: 70, width: 12 },
    
    // Presentation Layer
    { id: 'admin-portal', name: 'Admin Portal', layer: 'presentation', x: 20, width: 15 },
    { id: 'dashboard', name: 'Analytics Dashboard', layer: 'presentation', x: 40, width: 15 },
    { id: 'mobile', name: 'Mobile App', layer: 'presentation', x: 60, width: 15 },
  ];

  // Define connections between components
  const connections = [
    // External to Integration
    { from: 'opentext', to: 'api-gateway', type: 'primary' },
    { from: 'sap', to: 'api-gateway', type: 'primary' },
    { from: 'opentext', to: 'esb', type: 'secondary' },
    { from: 'sap', to: 'esb', type: 'secondary' },
    { from: 'sap', to: 'event-broker', type: 'primary' },
    
    // Integration to Processing
    { from: 'api-gateway', to: 'doc-processor', type: 'primary' },
    { from: 'esb', to: 'doc-processor', type: 'primary' },
    { from: 'esb', to: 'ocr-engine', type: 'secondary' },
    { from: 'esb', to: 'llm-service', type: 'secondary' },
    { from: 'event-broker', to: 'validation', type: 'primary' },
    
    // Processing Layer Internal
    { from: 'doc-processor', to: 'ocr-engine', type: 'primary' },
    { from: 'ocr-engine', to: 'llm-service', type: 'primary' },
    { from: 'llm-service', to: 'validation', type: 'primary' },
    
    // Processing to Data
    { from: 'doc-processor', to: 'document-store', type: 'primary' },
    { from: 'llm-service', to: 'metadata-db', type: 'primary' },
    { from: 'validation', to: 'metadata-db', type: 'primary' },
    { from: 'validation', to: 'analytics-db', type: 'secondary' },
    
    // Data to Service
    { from: 'document-store', to: 'doc-service', type: 'primary' },
    { from: 'metadata-db', to: 'doc-service', type: 'primary' },
    { from: 'metadata-db', to: 'analytics-service', type: 'secondary' },
    { from: 'analytics-db', to: 'analytics-service', type: 'primary' },
    
    // Service Layer Internal
    { from: 'auth-service', to: 'doc-service', type: 'security' },
    { from: 'auth-service', to: 'analytics-service', type: 'security' },
    { from: 'doc-service', to: 'notification', type: 'secondary' },
    { from: 'analytics-service', to: 'notification', type: 'secondary' },
    { from: 'doc-service', to: 'audit', type: 'security' },
    { from: 'analytics-service', to: 'audit', type: 'security' },
    
    // Service to Presentation
    { from: 'auth-service', to: 'admin-portal', type: 'security' },
    { from: 'auth-service', to: 'dashboard', type: 'security' },
    { from: 'auth-service', to: 'mobile', type: 'security' },
    { from: 'doc-service', to: 'admin-portal', type: 'primary' },
    { from: 'analytics-service', to: 'dashboard', type: 'primary' },
    { from: 'doc-service', to: 'mobile', type: 'primary' },
    { from: 'notification', to: 'mobile', type: 'secondary' },
  ];

  // Position components within their layers
  components.forEach(comp => {
    const layer = layers.find(l => l.id === comp.layer);
    if (layer) {
      comp.y = layer.y + layer.height/2 - 3; // Center the component vertically in its layer
    }
  });

  // Line style based on connection type
  const getConnectionStyle = (type) => {
    switch (type) {
      case 'primary':
        return { stroke: '#3B82F6', strokeWidth: '0.5', strokeDasharray: 'none' };
      case 'secondary':
        return { stroke: '#6B7280', strokeWidth: '0.4', strokeDasharray: '1,1' };
      case 'security':
        return { stroke: '#EF4444', strokeWidth: '0.4', strokeDasharray: '0.5,0.5' };
      default:
        return { stroke: '#6B7280', strokeWidth: '0.3', strokeDasharray: '1,1' };
    }
  };

  // Draw vertical connection line between components
  const getConnectionPath = (from, to) => {
    const fromComp = components.find(c => c.id === from);
    const toComp = components.find(c => c.id === to);
    
    if (!fromComp || !toComp) return '';
    
    const fromX = fromComp.x + fromComp.width / 2;
    const fromY = fromComp.y + 3;
    const toX = toComp.x + toComp.width / 2;
    const toY = toComp.y - 3;
    
    // Direct vertical connection if components are aligned
    if (Math.abs(fromX - toX) < 5) {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
    
    // Add curve if not directly aligned
    const midY = (fromY + toY) / 2;
    return `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  };

  return (
    <div className="flex justify-center w-full overflow-auto py-6">
      <svg width="1000" height="900" viewBox="0 0 100 100" className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Title */}
        <text x="50" y="3" textAnchor="middle" fontSize="2.2" fontWeight="bold" fill="#1F2937">
          Enterprise Document Analytics System - Architecture
        </text>

        {/* Draw layers */}
        {layers.map((layer) => (
          <g key={layer.id}>
            <rect
              x="5"
              y={layer.y}
              width="90"
              height={layer.height}
              rx="1"
              ry="1"
              fill={layer.color}
              stroke={layer.borderColor}
              strokeWidth="0.3"
              opacity="0.7"
            />
            <text
              x="7"
              y={layer.y + 3.5}
              fontSize="2"
              fontWeight="bold"
              fill="#374151"
            >
              {layer.name}
            </text>
          </g>
        ))}

        {/* Draw connections */}
        {connections.map((conn, index) => {
          const style = getConnectionStyle(conn.type);
          const path = getConnectionPath(conn.from, conn.to);
          
          return (
            <path
              key={`conn-${index}`}
              d={path}
              fill="none"
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeDasharray={style.strokeDasharray}
              markerEnd="url(#arrow)"
            />
          );
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
          </marker>
        </defs>
        
        {/* Draw components */}
        {components.map((comp) => (
          <g key={comp.id}>
            <rect
              x={comp.x}
              y={comp.y}
              width={comp.width}
              height="6"
              rx="1"
              ry="1"
              fill="white"
              stroke="#6B7280"
              strokeWidth="0.3"
            />
            <text
              x={comp.x + comp.width / 2}
              y={comp.y + 3.5}
              textAnchor="middle"
              fontSize="1.6"
              fontWeight="500"
              fill="#1F2937"
            >
              {comp.name}
            </text>
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(5, 95)">
          <text fontSize="1.8" fontWeight="bold" fill="#374151">Connection Types:</text>
          
          <line x1="20" y1="0.5" x2="25" y2="0.5" stroke="#3B82F6" strokeWidth="0.5" />
          <text x="27" y="1" fontSize="1.6" fill="#374151">Primary Data Flow</text>
          
          <line x1="47" y1="0.5" x2="52" y2="0.5" stroke="#6B7280" strokeWidth="0.4" strokeDasharray="1,1" />
          <text x="54" y="1" fontSize="1.6" fill="#374151">Secondary Flow</text>
          
          <line x1="75" y1="0.5" x2="80" y2="0.5" stroke="#EF4444" strokeWidth="0.4" strokeDasharray="0.5,0.5" />
          <text x="82" y="1" fontSize="1.6" fill="#374151">Security Flow</text>
        </g>
      </svg>
    </div>
  );
};

export default SystemArchitectureDiagram;