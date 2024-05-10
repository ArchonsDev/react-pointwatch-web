import categories from "../../data/categories.json";

export const calculatePoints = (name, start, finish) => {
  const hours = calculateHours(start, finish);
  const id = getCategoryID(name);
  let multiplier;
  switch (id) {
    case 1:
      multiplier = 1;
      break;
    case 2:
      multiplier = 0.5;
      break;
    case 3:
    case 4:
      multiplier = 1.5;
      break;
    case 5:
    case 6:
      multiplier = 2;
      break;
    default:
      multiplier = 1;
  }

  if (hours >= 8) return 4 * multiplier;
  if (hours >= 4) return 2 * multiplier;
  if (hours >= 2) return 1 * multiplier;
  return 0.5 * multiplier;
};

const getCategoryID = (name) => {
  const category = categories.categories.find(
    (category) => category.name === name
  );
  return category ? category.id : null;
};

const calculateHours = (start, finish) => {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = finish.split(":").map(Number);

  const startTime = new Date(0, 0, 0, startHours, startMinutes);
  const endTime = new Date(0, 0, 0, endHours, endMinutes);

  let timeDifference = endTime.getTime() - startTime.getTime();

  if (timeDifference < 0) {
    timeDifference = 24 * 60 * 60 * 1000 + timeDifference;
  }

  const hours = Math.floor(timeDifference / (60 * 60 * 1000));

  return hours;
};
