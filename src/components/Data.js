import categories from "../data/categories.json";

export const createBarData = (swtd, term) => {
  const categoriesArr = categories.categories;
  const filteredSWTDs = term
    ? swtd?.filter((item) => item.term?.id === term?.id)
    : swtd;
  const data = categoriesArr.map((category) => {
    return filteredSWTDs.filter((item) => item.category === category.name)
      .length;
  });

  const labels = categoriesArr.map((category) => category.id);
  return {
    labels,
    datasets: [
      {
        label: `Category`,
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
  const clearedPercentageData = [];
  const nonClearedPercentageData = [];

  departments.forEach((department) => {
    const totalMembers = department?.members?.length || 0;
    const clearedMembers =
      department?.members?.reduce((clearedCount, member) => {
        const termStatus = member?.clearances?.find(
          (clearance) =>
            clearance?.term?.id === term.id && !clearance.is_deleted
        );
        return termStatus ? clearedCount + 1 : clearedCount;
      }, 0) || 0;

    const nonClearedMembers = totalMembers - clearedMembers;

    clearedData.push(clearedMembers);
    nonClearedData.push(nonClearedMembers);

    const clearedPercentage = totalMembers
      ? ((clearedMembers / totalMembers) * 100).toFixed(2)
      : 0;
    const nonClearedPercentage = totalMembers
      ? ((nonClearedMembers / totalMembers) * 100).toFixed(2)
      : 0;

    clearedPercentageData.push(clearedPercentage);
    nonClearedPercentageData.push(nonClearedPercentage);
  });

  return {
    labels: departments.map((department) => department.name),
    datasets: [
      {
        label: "Cleared Employees",
        data: clearedPercentageData,
        borderColor: "#9D084A",
        borderWidth: 1,
        backgroundColor: "#9D084A",
      },
      {
        label: "Non-Cleared Employees",
        data: nonClearedPercentageData,
        borderColor: "#180018",
        borderWidth: 1,
        backgroundColor: "#180018",
      },
    ],
  };
};
