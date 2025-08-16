import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { id: 'documents', name: 'Document Analytics', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'settings', name: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'integrations', name: 'Integrations', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800">Document Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">SAP SuccessFactors Integration</p>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
              item.id === 'documents' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`mr-3 h-5 w-5 ${
                item.id === 'documents' ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={item.icon} 
              />
            </svg>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="pt-8 mt-8 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-white">
            SA
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">System Admin</p>
            <p className="text-xs text-gray-500">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;