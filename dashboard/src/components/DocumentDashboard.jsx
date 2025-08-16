import React, { useState } from 'react';
import { sampleDocuments } from '../data/documentMockData.js';
import DocumentDetailsTable from './DocumentDetailsTable.jsx';
import ProcessingLineChart from './charts/ProcessingLineChart.jsx';
import DocumentTypeDistribution from './charts/DocumentTypeDistribution.jsx';
import ValidationStatusPie from './charts/ValidationStatusPie.jsx';
import DocumentExpirationChart from './charts/DocumentExpirationChart.jsx';
import DocumentExpirationByTypeChart from './charts/DocumentExpirationByTypeChart.jsx';
import DocumentIssuesRadar from './charts/DocumentIssuesRadar.jsx';
import SystemArchitectureDiagram from './SystemArchitectureDiagram.jsx';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';

const DocumentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate statistics using sampleDocuments
  const stats = {
    total: sampleDocuments.length,
    valid: sampleDocuments.filter(doc => doc.status === 'Valid').length,
    expired: sampleDocuments.filter(doc => doc.status === 'Expired').length,
    expiring: sampleDocuments.filter(doc => doc.status === 'Expiring Soon').length,
    avgScore: Math.round(sampleDocuments.reduce((sum, doc) => sum + 85, 0) / sampleDocuments.length), // Default score since not in sample data
    needsReview: sampleDocuments.filter(doc => doc.issues && doc.issues.length > 0).length
  };

  const StatCard = ({ title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
          <div className={`mt-2 flex items-baseline text-3xl font-semibold text-${color}-600`}>
            {value}
            {subtitle && <span className="ml-2 text-sm font-medium text-gray-500">{subtitle}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor document compliance, expiration dates, and processing status across your organization
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
            <TabButton 
              id="overview" 
              label="📊 Overview" 
              isActive={activeTab === 'overview'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="details" 
              label="📄 Document Details" 
              isActive={activeTab === 'details'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="architecture" 
              label="🏗️ System Architecture" 
              isActive={activeTab === 'architecture'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="data-flow" 
              label="🔄 Data Flow" 
              isActive={activeTab === 'data-flow'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <StatCard title="Total Documents" value={stats.total} color="blue" />
              <StatCard title="Valid" value={stats.valid} color="green" />
              <StatCard title="Expired" value={stats.expired} color="red" />
              <StatCard title="Expiring Soon" value={stats.expiring} color="yellow" />
              <StatCard title="Avg Score" value={`${stats.avgScore}%`} color="purple" />
              <StatCard title="Needs Review" value={stats.needsReview} color="orange" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Document Processing Timeline</h3>
                <ProcessingLineChart />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Document Type Distribution</h3>
                <DocumentTypeDistribution />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Validation Status</h3>
                <ValidationStatusPie />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Expiration Timeline</h3>
                <DocumentExpirationChart />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Document Status by Type</h3>
                <DocumentExpirationByTypeChart />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Document Quality Assessment</h3>
                <DocumentIssuesRadar />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
              <p className="text-gray-600 mt-1">Search and filter through all processed documents</p>
            </div>
            <DocumentDetailsTable />
          </div>
        )}

        {activeTab === 'architecture' && (
          <SystemArchitectureDiagram />
        )}

        {activeTab === 'data-flow' && (
          <ArchitectureDiagram />
        )}
      </div>
    </div>
  );
};

export default DocumentDashboard;