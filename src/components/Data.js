import categories from "../data/categories.json";
import Department from "../pages/admin/Department";

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

export const createStackedBarData = (employees, departments, term) => {
  if (!employees || !departments || departments.length === 0 || !term) {
    return { labels: [], datasets: [] };
  }

  const clearedData = [];
  const notClearedData = [];

  departments.forEach((department) => {
    const filteredEmployees = employees.filter(
      (employee) =>
        employee.department?.id === department.id &&
        employee.terms?.some((t) => t.id === term.id)
    );

    const clearedCount = filteredEmployees.filter(
      (employee) => employee.cleared
    ).length;

    const notClearedCount = filteredEmployees.filter(
      (employee) => !employee.cleared
    ).length;

    clearedData.push(clearedCount);
    notClearedData.push(notClearedCount);
  });

  return {
    labels: departments.map((dept) => dept.name),
    datasets: [
      {
        label: "Cleared Employees",
        data: clearedData,
        backgroundColor: "hsl(120, 70%, 50%)",
        borderColor: "#000000",
        borderWidth: 1,
      },
      {
        label: "Not Cleared Employees",
        data: notClearedData,
        backgroundColor: "hsl(0, 70%, 50%)",
        borderColor: "#000000",
        borderWidth: 1,
      },
    ],
  };
};
