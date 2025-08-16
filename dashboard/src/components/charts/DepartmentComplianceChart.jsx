import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { departmentComplianceData } from '../../data/documentMockData';

const DepartmentComplianceChart = () => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={departmentComplianceData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" scale="band" />
          <YAxis yAxisId="left" orientation="left" domain={[80, 100]} label={{ value: 'Compliance %', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 1000]} label={{ value: 'Document Count', angle: -90, position: 'insideRight' }} />
          <Tooltip formatter={(value, name) => {
            if (name === 'compliance') return `${value}%`;
            if (name === 'documentCount') return `${value} documents`;
            return value;
          }} />
          <Legend />
          <Bar yAxisId="right" dataKey="documentCount" name="Document Count" barSize={20} fill="#4C9BE8" />
          <Line yAxisId="left" type="monotone" dataKey="compliance" name="Compliance %" stroke="#E84C9B" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentComplianceChart;