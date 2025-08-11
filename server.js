// Import required modules
import express from 'express';           // Web server
import multer from 'multer';             // (Unused now) File upload utility
import path from 'path';                 // Path utilities
import axios from 'axios';               // For downloading zip and test case files
import fs from 'fs';                     // File system utilities
import { fileURLToPath } from 'url';     // Support __dirname in ES modules
import AdmZip from 'adm-zip';            // To unzip the ZIP file
import { VM } from 'vm2';                // Secure sandbox to run JS code
import { createObjectCsvWriter as csvWriter } from 'csv-writer'; // For generating CSV

// Define file path utilities for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing in request body
app.use(express.json());

// Serve static files (for CSV download)
app.use(express.static(path.join(__dirname, 'public')));

// Unused multer setup (kept in case you want to support file uploads later)
const upload = multer({ dest: 'uploads/' });

// Utility: Clear and recreate a directory
function clearFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
  fs.mkdirSync(folderPath, { recursive: true });
}

// Utility: Find the `.js` file in a student folder
function getJSFile(folderPath) {
  const files = fs.readdirSync(folderPath);
  return files.find(f => f.endsWith('.js'));
}

// NEW Utility: Recursively scan a directory to find all student folders
function scanForStudentFolders(baseDir) {
  let studentDirs = [];
  const items = fs.readdirSync(baseDir);

  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      // If the directory contains at least one .js file, treat it as a student folder
      const jsFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
      if (jsFiles.length > 0) {
        studentDirs.push(fullPath);
      } else {
        // Otherwise, go deeper
        studentDirs = studentDirs.concat(scanForStudentFolders(fullPath));
      }
    }
  }
  return studentDirs;
}

// Core Evaluator: Run test cases on student function
function runTest(studentCode, functionName, testCases) {
  const vm = new VM({ timeout: 1000, sandbox: {} });

  try {
    // Load student code into VM
    vm.run(studentCode);
    let passed = 0;

    // Evaluate each test case
    for (const { input, expected } of testCases) {
      const codeToRun = `(${functionName})(...${JSON.stringify(input)})`;
      const result = vm.run(codeToRun);

      // Compare output
      if (JSON.stringify(result) === JSON.stringify(expected)) {
        passed++;
      }
    }

    // Grading logic
    const percent = (passed / testCases.length) * 100;
    const score = percent === 100 ? 10 : percent >= 60 ? 6 : percent > 0 ? 3 : 0;
    const feedback = percent === 100
      ? "All test cases passed."
      : percent >= 60
      ? "Most test cases passed. Minor logic issues."
      : "Failed most test cases. Logic needs correction.";

    return { score, feedback };

  } catch {
    // If code crashes or syntax error
    return { score: 0, feedback: 'Code error. Check syntax or function structure.' };
  }
}

// Route: Evaluate using zipUrl + testCasesUrl
app.post('/evaluate-by-url', async (req, res) => {
  try {
    const { zipUrl, testCasesUrl } = req.body;

    // Validation
    if (!zipUrl || !testCasesUrl) {
      return res.status(400).json({ error: "Missing zipUrl or testCasesUrl in request body." });
    }

    console.log('🌐 Downloading ZIP from URL:', zipUrl);
    console.log('📥 Fetching test cases from URL:', testCasesUrl);

    // Download the ZIP and test case files
    const zipResponse = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    const testCasesResponse = await axios.get(testCasesUrl);
    const testConfig = testCasesResponse.data;

    // Prepare extraction directory
    const EXTRACT_DIR = path.join(__dirname, 'submissions');
    clearFolder(EXTRACT_DIR);

    // Save and extract ZIP
    const tempZipPath = path.join(__dirname, 'temp-download.zip');
    fs.writeFileSync(tempZipPath, zipResponse.data);
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(EXTRACT_DIR, true);
    fs.unlinkSync(tempZipPath);

    // Find all student folders recursively
    const students = scanForStudentFolders(EXTRACT_DIR);

    // Evaluate each student's submission
    const results = [];

    for (const studentFolder of students) {
      const student = path.basename(studentFolder);
      const fileName = getJSFile(studentFolder);

      if (!fileName) {
        results.push({ student, marks: 0, feedback: 'No JS file found.' });
        continue;
      }

      const studentCode = fs.readFileSync(path.join(studentFolder, fileName), 'utf-8');
      let totalMarks = 0;
      let allFeedback = [];

      for (const fn of testConfig.testFunctions) {
        const result = runTest(studentCode, fn.functionName, fn.testCases);
        totalMarks += result.score;
        allFeedback.push(`${fn.functionName}: ${result.feedback}`);
      }

      results.push({
        student,
        marks: totalMarks,
        feedback: allFeedback.join(' | ')
      });
    }

    // --- NEW: Generate CSV file in /public folder ---
    const publicDir = path.join(__dirname, 'public');
    clearFolder(publicDir);

    const csvPath = path.join(publicDir, 'results.csv');
    const writer = csvWriter({
      path: csvPath,
      header: [
        { id: 'student', title: 'Student Name' },
        { id: 'marks', title: 'Marks' },
        { id: 'feedback', title: 'Feedback' },
      ],
    });

    await writer.writeRecords(results);

    const csvUrl = `${req.protocol}://${req.get('host')}/download-results`;

    // Return JSON result + CSV link
    res.json({ results, csvUrl });

  } catch (err) {
    console.error("❌ Evaluation from URL failed:", err);
    res.status(500).json({ error: "Evaluation from URL failed." });
  }
});

app.get('/download-results', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'results.csv');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Results file not found.');
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
  res.sendFile(filePath);
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 JS Evaluator (Dynamic TestCases) running on http://localhost:${PORT}`);
});
