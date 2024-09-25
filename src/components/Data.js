export const defaultLineData = (swtd) => {
  const monthCount = {};
  swtd?.forEach((item) => {
    const date = new Date(item.date);
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

  termSWTDs?.forEach((item) => {
    const date = new Date(item.date);
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
