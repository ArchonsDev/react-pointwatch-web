import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { createPieData } from "./Data";

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieChart = ({ swtd, term }) => {
  const pieData = createPieData(swtd, term);
  const options = { responsive: true, maintainAspectRatio: false };

  return <Pie options={options} data={pieData} width={400} height={400} />;
};
