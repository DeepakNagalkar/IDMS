import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { expirationTimelineData } from '../../data/documentMockData';

const DocumentExpirationChart = () => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={expirationTimelineData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="days" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} documents`} />
          <Legend />
          <Bar dataKey="count" name="Documents Expiring" fill="#FF9843" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentExpirationChart;