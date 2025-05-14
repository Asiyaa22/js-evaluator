// Assignment 1: Max of three numbers
function findMax(a, b, c) {
  if (a > b && a > c) {
    return a;
  } else if (b > c) {
    return b;
  } else {
    return c;
  }
}

// Assignment 2: Leap year checker
function isLeapYear(year) {
  if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
    return true;
  } else {
    return false;
  }
}

// Assignment 3: Even or Odd
function isEven(num) {
  if (num % 2 == 0) {
    return true;
  } else {
    return false;
  }
}

// Assignment 4: Character type
function checkCharType(char) {
  if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
    return "Alphabet";
  } else if (char >= '0' && char <= '9') {
    return "Digit";
  } else {
    return "Special Character";
  }
}

// Assignment 5: Triangle validity
function isValidTriangle(a, b, c) {
  if (a + b + c == 180) {
    return true;
  } else {
    return false;
  }
}
