import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatPieChart = ({ title, data, height = 300 }) => {
  // Filter out items with 0 value
  const filteredData = data.filter(item => item.value > 0);
  
  // If no data has values, show a message
  if (filteredData.length === 0) {
    return (
      <div>
        {title && <h2 className="text-xl font-medium text-neutral-dark mb-4">{title}</h2>}
        <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
          <p className="text-neutral">Chưa có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-medium text-neutral-dark mb-4">{title}</h2>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              padding: '10px'
            }}
          />
          <Legend
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{
              fontSize: '12px',
              paddingLeft: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatPieChart;