import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieChart = ({ label, data }) => {
  const pieData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: label,
        data: Object.values(data),
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  return <Pie data={pieData} options={options} />;
};

{
  /*import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { createPieData } from "./Data";

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieChart = ({ swtd, term }) => {
  const pieData = createPieData(swtd, term);
  const options = { responsive: true, maintainAspectRatio: false };

  return <Pie options={options} data={pieData} width={400} height={400} />;
};*/
}
