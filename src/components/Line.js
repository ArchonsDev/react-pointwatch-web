import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { createLineData, defaultLineData } from "./Data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const LineGraph = ({ swtd, term }) => {
  const options = {};
  const lineData = term ? createLineData(swtd, term) : defaultLineData(swtd);
  return <Line options={options} data={lineData} />;
};
