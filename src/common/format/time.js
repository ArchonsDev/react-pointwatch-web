import { wordDate } from "./date";

export const formatTime = (time) => {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}:${minute < 10 ? "0" : ""}${minute} ${ampm}`;
};

export const formatDateTime = (str) => {
  if (!str) return "";

  const [datePart, timePart] = str.split(" ");

  const formattedDate = wordDate(datePart);
  const formattedTime = formatTime(timePart);

  return `${formattedDate} ${formattedTime}`;
};
