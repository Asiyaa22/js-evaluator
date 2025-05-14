// evaluator.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { VM } from 'vm2';
import { createObjectCsvWriter as csvWriter } from 'csv-writer';
import testConfig from './testCases.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the submissions folder and output CSV
// const SUBMISSION_DIR = path.join(__dirname, 'submissions');
const ZIP_PATH = path.join(__dirname, 'submissions', 'js-submissions.zip');
const SUBMISSION_DIR = path.join(__dirname, 'submissions');

// Extract zip to submissions/
if (fs.existsSync(ZIP_PATH)) {
  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(SUBMISSION_DIR, true);
  console.log('✅ Zip extracted to submissions/');
} else {
  console.error('❌ Zip file not found. Make sure conditional-submissions.zip exists.');
  process.exit(1);
}

const OUTPUT_CSV = path.join(__dirname, 'results.csv');

// Setup CSV writer
const writer = csvWriter({
  path: OUTPUT_CSV,
  header: [
    { id: 'student', title: 'Student Name' },
    { id: 'function', title: 'Function' },
    { id: 'marks', title: 'Marks' },
    { id: 'feedback', title: 'Feedback' },
  ],
});

// Find the .js file inside a student's folder
function getJSFile(folderPath) {
  const files = fs.readdirSync(folderPath);
  return files.find(f => f.endsWith('.js'));
}

// Run tests on a student's function using VM2 sandbox
function runTest(studentCode, functionName, testCases) {
  const vm = new VM({
    timeout: 1000,
    sandbox: {},
  });

  try {
    // Load the student's JS code into the VM
    vm.run(studentCode);

    let passed = 0;

    // Run each test case on the given function
    for (const { input, expected } of testCases) {
      try {
        const codeToRun = `(${functionName})(...${JSON.stringify(input)})`;
        const result = vm.run(codeToRun);
        if (JSON.stringify(result) === JSON.stringify(expected)) {
          passed++;
        }
      } catch {
        return {
          score: 0,
          feedback: 'Runtime error during test case execution.',
        };
      }
    }

    const total = testCases.length;
    const percent = (passed / total) * 100;

    // Score logic
    const marks = percent === 100 ? 10 : percent >= 60 ? 6 : percent > 0 ? 3 : 0;
    const feedback =
      percent === 100
        ? 'All test cases passed.'
        : percent >= 60
        ? 'Most test cases passed. Minor logic issues.'
        : 'Failed most test cases. Logic needs correction.';

    return { score: marks, feedback };
  } catch (err) {
    return {
      score: 0,
      feedback: 'Code could not be executed. Check syntax or function structure.',
    };
  }
}

// Main execution block
const evaluateAll = async () => {
  const subDirs = fs.readdirSync(SUBMISSION_DIR).map(p => path.join(SUBMISSION_DIR, p));
  let students = [];

  for (const subDir of subDirs) {
    if (fs.statSync(subDir).isDirectory()) {
      const innerFolders = fs.readdirSync(subDir).map(s => path.join(subDir, s));
      for (const studentFolder of innerFolders) {
        if (fs.statSync(studentFolder).isDirectory()) {
          students.push(studentFolder);
        }
      }
    }
  }

  const records = [];

  for (const studentFolder of students) {
    const student = path.basename(studentFolder); // Extract student name from folder path
    const fileName = getJSFile(studentFolder);

    if (!fileName) {
      records.push({
        student,
        function: 'N/A',
        marks: 0,
        feedback: 'No JS file found.',
      });
      continue;
    }

    const filePath = path.join(studentFolder, fileName);
    const studentCode = fs.readFileSync(filePath, 'utf-8');

    for (const fn of testConfig.testFunctions) {
      const result = runTest(studentCode, fn.functionName, fn.testCases);
      records.push({
        student,
        function: fn.functionName,
        marks: result.score,
        feedback: result.feedback,
      });
    }
  }

  await writer.writeRecords(records);
  console.log('✅ Evaluation complete. Results written to results.csv');
};


evaluateAll();
