import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { documentTypeData, DOCUMENT_COLORS } from '../../data/documentMockData';

const DocumentTypeDistribution = () => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={documentTypeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {documentTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={DOCUMENT_COLORS[index % DOCUMENT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} documents`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentTypeDistribution;