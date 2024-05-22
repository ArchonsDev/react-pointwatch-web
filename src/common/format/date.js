export const formatDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

export const wordDate = (date) => {
  if (!date) return "";
  const format = formatDate(date);
  const dateObj = new Date(format);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
};

export const formatTermDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${day}-${month}-${year}`;
};
