import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  plugins,
  Ticks,
} from "chart.js";
import { createHistogramData } from "./Data";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const Histogram = ({ departments, term }) => {
  const chartData = createHistogramData(departments, term);

  const options = {
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        min: 0,
        max: 100,
        stacked: true,
        title: {
          display: true,
          text: "% of Employees",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Departments",
        },
      },
    },

    barThickness: 20,
  };

  return <Bar data={chartData} options={options} />;
};
