import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { createHistogramData } from "./Data";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const Histogram = ({ departments, term }) => {
  const chartData = createHistogramData(departments, term);
  const maxDataValue = departments.reduce((total, department) => {
    return total + (department?.members?.length || 0);
  }, 0);
  const yAxisMax = maxDataValue + 3;
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: yAxisMax,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Number of Employees",
        },
      },
      x: {
        title: {
          display: true,
          text: "Departments",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
