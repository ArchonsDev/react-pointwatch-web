import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const StackedBarGraph = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.department),
    datasets: [
      {
        label: "Cleared",
        data: data.map((item) => item.cleared),
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Customize as needed
      },
      {
        label: "Not Cleared",
        data: data.map((item) => item.notCleared),
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Customize as needed
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Employee Clearance by Department",
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,

          text: "Departments",
        },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: "Number of Employees",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
