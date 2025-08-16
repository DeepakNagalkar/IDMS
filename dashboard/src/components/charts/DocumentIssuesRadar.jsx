import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';
import { documentIssuesData } from '../../data/documentMockData';

const DocumentIssuesRadar = () => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} data={documentIssuesData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Tooltip formatter={(value) => `${value} documents`} />
          <Radar
            name="Document Issues"
            dataKey="count"
            stroke="#E86C4C"
            fill="#E86C4C"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentIssuesRadar;