export default {
  assignmentName: "Conditional Statements",
  testFunctions: [
    {
      functionName: "findMax",
      testCases: [
        { input: [1, 2, 3], expected: 3 },
        { input: [99, 12, 34], expected: 99 },
        { input: [-5, -1, -10], expected: -1 },
      ],
    },
    {
      functionName: "isLeapYear",
      testCases: [
        { input: [2020], expected: true },
        { input: [1900], expected: false },
        { input: [2000], expected: true },
      ],
    },
    {
      functionName: "isEven",
      testCases: [
        { input: [2], expected: true },
        { input: [3], expected: false },
      ],
    },
    {
      functionName: "checkCharType",
      testCases: [
        { input: ['a'], expected: "Alphabet" },
        { input: ['5'], expected: "Digit" },
      ],
    },
    {
      functionName: "isValidTriangle",
      testCases: [
        { input: [60, 60, 60], expected: true },
        { input: [90, 45, 45], expected: true },
        { input: [0, 90, 90], expected: false },
      ],
    }
  ]
};
