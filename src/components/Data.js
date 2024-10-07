import { formatDate } from "../common/format/date";
import months from "../data/months.json";

export const defaultLineData = (swtd) => {
  const monthsArr = months.months;
  const monthCount = monthsArr.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  const swtdDates = swtd?.map((event) => event.dates);
  const flattenedDates = swtdDates.flatMap((eventArray) => eventArray);

  flattenedDates?.forEach((item) => {
    const formattedDates = formatDate(item.date);
    const date = new Date(formattedDates);
    const month = date.toLocaleString("default", { month: "long" });

    if (monthCount.hasOwnProperty(month)) {
      monthCount[month] += 1;
    }
  });
  const labels = monthsArr;
  const data = months.months.map((month) => monthCount[month]);
  return {
    labels,
    datasets: [
      {
        label: "Overall SWTDs attended",
        data,
        borderColor: "#9d084a",
        backgroundColor: "#9d084a",
      },
    ],
  };
};

export const createLineData = (swtd, term) => {
  const monthsArr = months.months;
  const monthCount = monthsArr.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  const termSWTDs = swtd?.filter((item) => item.term.id === term?.id);
  const swtdDates = termSWTDs?.map((event) => event.dates);
  const flattenedDates = swtdDates.flatMap((eventArray) => eventArray);

  flattenedDates?.forEach((item) => {
    const formattedDate = formatDate(item.date);
    const date = new Date(formattedDate);
    const month = date.toLocaleString("default", { month: "long" });

    if (monthCount.hasOwnProperty(month)) {
      monthCount[month] += 1;
    }
  });

  const labels = monthsArr;
  const data = months.months.map((month) => monthCount[month]);

  return {
    labels,
    datasets: [
      {
        label: `${term.name} SWTDs attended per month`,
        data,
        borderColor: "#9d084a",
        backgroundColor: "#9d084a",
      },
    ],
  };
};

export const defaultPieData = () => {};

export const createPieData = () => {};
