export const formatDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

export const formatTermDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${day}-${month}-${year}`;
};
