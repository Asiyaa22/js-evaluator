// Assignment 1: Max of three numbers
function findMax(a, b, c) {
  if (a === b || b === c || a === c) {
    return null;
  }
  return Math.max(a, b, c);
}

// Assignment 2: Leap year checker
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Assignment 3: Even or Odd
function isEven(num) {
  return num % 2 === 0;
}

// Assignment 4: Character type
function checkCharType(char) {
  if (!char || char.length !== 1) return "Invalid";
  const code = char.charCodeAt(0);
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
    return "Alphabet";
  } else if (code >= 48 && code <= 57) {
    return "Digit";
  } else {
    return "Special Character";
  }
}

// Assignment 5: Triangle validity
function isValidTriangle(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return false;
  return a + b + c === 180;
}
