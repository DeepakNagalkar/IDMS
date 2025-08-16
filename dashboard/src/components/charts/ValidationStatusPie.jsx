import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { validationStatusData, DOCUMENT_COLORS } from '../../data/documentMockData';

const ValidationStatusPie = () => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={validationStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => {
              if (percent < 0.05) return null;
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
          >
            {validationStatusData.map((entry, index) => (
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

export default ValidationStatusPie;