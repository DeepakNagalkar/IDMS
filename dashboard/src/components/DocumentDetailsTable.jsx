import React, { useState } from 'react';
import { sampleDocuments } from '../data/documentMockData';

const DocumentDetailsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  
  // Get unique document types for filter dropdown
  const documentTypes = ['All', ...new Set(sampleDocuments.map(doc => doc.documentType))];
  
  // Filter documents based on search term and filters
  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = 
      doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
    const matchesType = filterType === 'All' || doc.documentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Expiring Soon':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Document Details</h2>
      
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            id="search"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="Search by employee or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="statusFilter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Valid">Valid</option>
            <option value="Expired">Expired</option>
            <option value="Expiring Soon">Expiring Soon</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select
            id="typeFilter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {documentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Document ID</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Document Type</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Issue Date</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-4 text-center text-sm text-gray-500">
                  No documents match your search criteria.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{doc.id}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doc.employeeName}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doc.documentType}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doc.issueDate}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doc.expiryDate}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {doc.issues.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs">
                        {doc.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-green-600 text-xs">No issues</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentDetailsTable;