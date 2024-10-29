import categories from "../../data/categories.json";

export const calculateHourPoints = (name, hours) => {
  const id = getCategoryID(name);
  const points = calculatePoints(id, hours);
  return points;
};

const calculatePoints = (id, totalHours) => {
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
    case 7:
      return totalHours * 0.5;
    case 8:
    case 9:
      return totalHours * 1;
      break;
    default:
      multiplier = 1;
  }

  let points = 0;
  let remainingHours = totalHours;

  const hourBlocks = [
    { hours: 8, points: 4 },
    { hours: 4, points: 2 },
    { hours: 2, points: 1 },
    { hours: 1, points: 0.5 },
  ];

  for (let block of hourBlocks) {
    while (remainingHours >= block.hours) {
      points += block.points * multiplier;
      remainingHours -= block.hours;
    }
  }
  return points;
};

const getCategoryID = (name) => {
  const category = categories.categories.find(
    (category) => category.name === name
  );
  return category ? category.id : null;
};
