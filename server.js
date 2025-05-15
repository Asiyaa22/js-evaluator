import express from 'express';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import { VM } from 'vm2';
import { createObjectCsvWriter as csvWriter } from 'csv-writer';
import testConfig from './testCases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Zip folder to extract submissions
const upload = multer({ dest: 'uploads/' });

function clearFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
  fs.mkdirSync(folderPath);
}

function getJSFile(folderPath) {
  const files = fs.readdirSync(folderPath);
  return files.find(f => f.endsWith('.js'));
}

function runTest(studentCode, functionName, testCases) {
  const vm = new VM({ timeout: 1000, sandbox: {} });
  try {
    vm.run(studentCode);
    let passed = 0;
    for (const { input, expected } of testCases) {
      const codeToRun = `(${functionName})(...${JSON.stringify(input)})`;
      const result = vm.run(codeToRun);
      if (JSON.stringify(result) === JSON.stringify(expected)) {
        passed++;
      }
    }
    const percent = (passed / testCases.length) * 100;
    const score = percent === 100 ? 10 : percent >= 60 ? 6 : percent > 0 ? 3 : 0;
    const feedback = percent === 100
      ? "All test cases passed."
      : percent >= 60
      ? "Most test cases passed. Minor logic issues."
      : "Failed most test cases. Logic needs correction.";
    return { score, feedback };
  } catch {
    return { score: 0, feedback: 'Code error. Check syntax or function structure.' };
  }
}

// 🆕 Route to accept a zip file URL instead of file upload
app.post('/evaluate-by-url', async (req, res) => {
  try {
    const { zipUrl } = req.body;
    if (!zipUrl) {
      return res.status(400).json({ error: "Missing zipUrl in request body." });
    }

    console.log('🌐 Downloading ZIP from URL:', zipUrl);

    const zipResponse = await axios.get(zipUrl, { responseType: 'arraybuffer' });

    const EXTRACT_DIR = path.join(__dirname, 'submissions');
    clearFolder(EXTRACT_DIR);

    const tempZipPath = path.join(__dirname, 'temp-download.zip');
    fs.writeFileSync(tempZipPath, zipResponse.data);
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(EXTRACT_DIR, true);
    fs.unlinkSync(tempZipPath);

    // Evaluation logic
    let students = [];
    const subDirs = fs.readdirSync(EXTRACT_DIR).map(p => path.join(EXTRACT_DIR, p));
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

    res.json({ results });

  } catch (err) {
    console.error("❌ Evaluation from URL failed:", err);
    res.status(500).json({ error: "Evaluation from URL failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
