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
import { createBarData } from "./Data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const BarGraph = ({ swtd, term }) => {
  const barData = createBarData(swtd, term);
  const maxDataValue = Math.max(...barData.datasets[0].data);
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
          text: "Number of SWTDs",
        },
      },
      x: {
        title: {
          display: true,
          text: "SWTDs submitted per category",
        },
      },
    },
  };

  return <Bar options={options} data={barData} />;
};
