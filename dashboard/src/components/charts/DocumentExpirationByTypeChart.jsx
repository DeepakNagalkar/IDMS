import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { documentExpirationByType } from '../../data/documentMockData';

const DocumentExpirationByTypeChart = () => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={documentExpirationByType}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="expired" name="Expired" stackId="a" fill="#EF4444" />
          <Bar dataKey="expiringSoon" name="Expiring Soon" stackId="a" fill="#F59E0B" />
          <Bar dataKey="valid" name="Valid" stackId="a" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentExpirationByTypeChart;