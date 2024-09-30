import React from 'react';
import { Pie } from 'react-chartjs-2';
import { getAllSWTDs } from "../api/swtd";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const data = {
    labels: ['Rejected SWTDs', 'Approved SWTDs', 'Pending SWTDs'],
    datasets: [
      {
        label: '% of Status',
        data: [25, 25, 50], 
        backgroundColor: [
          'rgba(90, 4, 49, 1)',  
          'rgba(157, 8, 74, 1)', 
          'rgba(231, 76, 196, 1)'
        ],
        borderColor: [
          '#180018', 
          '#180018',
          '#180018'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
