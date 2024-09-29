import { formatDate } from "../common/format/date";

export const defaultLineData = (swtd) => {
  const monthCount = {};
  console.log(swtd);
  swtd?.forEach((item) => {
    const formattedDate = formatDate(item.dates.date);
    const date = new Date(formattedDate);
    const month = date.toLocaleString("default", { month: "long" });

    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  const labels = Object.keys(monthCount);
  const data = Object.values(monthCount);
  return {
    labels,
    datasets: [
      {
        label: "Number of SWTDs attended per month",
        data,
        borderColor: "#180018",
        backgroundColor: "#9d084a",
      },
    ],
  };
};

export const createLineData = (swtd, term) => {
  const monthCount = {};
  const termSWTDs = swtd?.filter((item) => item.term.id === term?.id);

  console.log(termSWTDs);

  termSWTDs?.forEach((item) => {
    const formattedDate = formatDate(item.dates.date);
    const date = new Date(formattedDate);
    const month = date.toLocaleString("default", { month: "long" });
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  const labels = Object.keys(monthCount);
  const data = Object.values(monthCount);

  return {
    labels,
    datasets: [
      {
        label: "Number of SWTDs attended per month",
        data,
        borderColor: "#180018",
        backgroundColor: "#9d084a",
      },
    ],
  };
};

export const defaultPieData = () => {};

export const createPieData = () => {};
