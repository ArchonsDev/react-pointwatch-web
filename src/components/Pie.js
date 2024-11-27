import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const createChartData = (title, data) => {
  return {
    labels: data.map((item) => item.label), // Extract labels from data.
    datasets: [
      {
        label: title, // Set chart title.
        data: data.map((item) => item.value), // Extract chart data.
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };
};

export const PieChart = ({ title, data }) => {
  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return <Pie data={() => createChartData(title, data)} options={options} />;
};
