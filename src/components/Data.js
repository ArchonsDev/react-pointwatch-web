import categories from "../data/categories.json";

export const createBarData = (swtd, term) => {
  const categoriesArr = categories.categories;
  const filteredSWTDs = swtd?.filter((item) => item.term?.id === term?.id);
  const data = categoriesArr.map((category) => {
    return filteredSWTDs.filter((item) => item.category === category.name)
      .length;
  });

  const labels = categoriesArr.map((category) => category.id);
  return {
    labels,
    datasets: [
      {
        label: `SWTDs submitted per category`,
        data,
        borderColor: "#180018",
        borderWidth: 1,
        backgroundColor: [
          "#9D084A",
          "#A8235E",
          "#B33F72",
          "#BE5A86",
          "#C9769A",
          "#D391AF",
          "#DEADC3",
          "#E9C8D7",
          "#F4E4EB",
        ],
      },
    ],
  };
};

export const createHistogramData = (departments, term) => {
  const clearedData = [];
  const nonClearedData = [];

  departments.forEach((department) => {
    const clearedMembers =
      department?.members?.reduce((clearedCount, member) => {
        const termStatus = member?.clearances?.find(
          (clearance) =>
            clearance?.term?.id === term.id && !clearance.is_deleted
        );
        return termStatus ? clearedCount + 1 : clearedCount;
      }, 0) || 0;

    const nonClearedMembers = department?.members?.length - clearedMembers || 0;

    clearedData.push(clearedMembers);
    nonClearedData.push(nonClearedMembers);
  });

  return {
    labels: departments.map((department) => department.name),
    datasets: [
      {
        label: "Cleared Employees",
        data: clearedData,
        borderColor: "#9D084A",
        borderWidth: 1,
        backgroundColor: "#9D084A",
      },
      {
        label: "Non-Cleared Employees",
        data: nonClearedData,
        borderColor: "#180018",
        borderWidth: 1,
        backgroundColor: "#180018",
      },
    ],
  };
};
