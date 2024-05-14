const MINIMUM_PASSWORD_LENGTH = 8;

export const isEmpty = (value) => {
  return value.trim() === "";
};

export const isValidLength = (value, minLength) => {
  return value.length > minLength;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return (
    hasSpecialCharacter(password) &&
    hasNumber(password) &&
    hasMinimumLength(password)
  );
};

export const isValidSWTDDate = (date, term) => {
  const selectedDate = new Date(date);
  const startTerm = new Date(term.start);
  const endTerm = new Date(term.end);
  const today = new Date();

  if (term.ongoing) return startTerm <= selectedDate && today >= selectedDate;
  else return startTerm <= selectedDate && endTerm >= selectedDate;
};

export const isValidDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  return today > selectedDate;
};

const hasSpecialCharacter = (password) => {
  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
  return specialCharacterRegex.test(password);
};

const hasNumber = (password) => {
  const numberRegex = /\d/;
  return numberRegex.test(password);
};

const hasMinimumLength = (password) => {
  return password.length >= MINIMUM_PASSWORD_LENGTH;
};
