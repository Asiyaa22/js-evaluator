
// Assignment 1: Max of three numbers
function findMax(a, b, c) {
  return; // missing logic
}

// Assignment 2: Leap year checker
function isLeapYear(year) {
  if (year / 4 == 0) { // wrong condition (should be modulus)
    return "Leap";
  }
  return "No"; // inconsistent return types
}

// Assignment 3: Even or Odd
function isEven(num) {
  return num % 3 === 0; // wrong logic
}

// Assignment 4: Character type
function checkCharType(char) {
  if (char == 1) {
    return "Digit"; // wrong check
  }
  return "Nothing"; // vague output
}

// Assignment 5: Triangle validity
function isValidTriangle(a, b, c) {
  return a + b + c === 90; // wrong triangle check (should be 180)
}
