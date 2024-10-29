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

export const createPieData = (swtd, term) => {
  const categoriesArr = categories.categories;
  const filteredSWTDs = swtd?.filter((item) => item.term.id === term?.id);
  const data = categoriesArr.map((category) => {
    return filteredSWTDs.filter((item) => item.category === category.name)
      .length;
  });

  const labels = categoriesArr.map((category) => category.id);
  return {
    labels,
    datasets: [
      {
        label: `SWTDs submitted`,
        data,
        backgroundColor: [
          "#9D084A",
          "#A92761",
          "#B64677",
          "#C2658E",
          "#CE84A5",
          "#DAA2BB",
          "#E7C1D2",
          "#F3E0E8",
          "#FFFFFF",
        ],
        hoverOffset: 4,
      },
    ],
  };
};
