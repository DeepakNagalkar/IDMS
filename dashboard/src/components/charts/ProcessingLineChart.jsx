import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { processingData } from '../../data/documentMockData';

const ProcessingLineChart = () => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processingData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => {
            if (name === 'processed') return `${value} documents processed`;
            if (name === 'withIssues') return `${value} documents with issues`;
            return value;
          }} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="processed" 
            name="Documents Processed" 
            stroke="#4C9BE8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="withIssues" 
            name="Documents with Issues" 
            stroke="#E86C4C" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProcessingLineChart;