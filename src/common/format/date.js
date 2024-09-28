//FROM MM-DD-YYYY to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

//FROM YYYY-MM-DD to MM-DD-YYYY
export const apiDate = (date) => {
  const [year, month, day] = date.split("-");
  return `${month}-${day}-${year}`;
};

export const wordDate = (date) => {
  if (!date) return "";
  //const format = formatDate(date);
  const dateObj = new Date(date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
};

export const formatTermDate = (date) => {
  if (!date) return "";
  const [month, day, year] = date.split("-");
  return `${day}-${month}-${year}`;
};

export const monthYearDate = (date) => {
  if (!date) return "";
  const format = formatDate(date);
  const dateObj = new Date(format);
  const options = { year: "numeric", month: "long" };
  return dateObj.toLocaleDateString("en-US", options);
};
