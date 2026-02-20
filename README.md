# 🚀 JavaScript Code Evaluator (Batch Evaluation Engine)

A **production-ready JavaScript evaluator** that securely evaluates student code submissions using predefined test cases.

Built for:
- Education platforms
- Automated assessments
- Batch evaluation (multiple students at once)
- Safe execution of untrusted code

> **No AI. No guessing. Fully deterministic & fair evaluation.**

---

## What this Evaluator Does

- Accepts **batch submission links**
- Fetches **student code from backend database**
- Runs code in a **secure VM sandbox (vm2)**
- Evaluates against **predefined test cases**
- Returns **marks + feedback**
- Generates **CSV results** automatically

---

## High-Level Architecture

```text
Student Editor
   ↓
Code saved in DB
   ↓
Submission Link
   ↓
JS Evaluator (this service)
   ↓
JSON Results + CSV
   ↓
Teacher confirms → Saved in main app DB
```

---

## 🔗 API Endpoint

### POST `/evaluate-batch-by-links`

Evaluates **multiple student submissions in one request**.

---

## Request Payload (Postman Ready)

### Headers
```http
Content-Type: application/json
```

### Body (JSON)
```json
{
  "submissions": [
    {
      "student": "Student-1",
      "submissionLink": "https://editor-backend.onrender.com/api/submissions/abc123"
    },
    {
      "student": "Student-2",
      "submissionLink": "https://editor-backend.onrender.com/api/submissions/def456"
    }
  ],
  "testCasesUrl": "https://your-backend.onrender.com/testcases/task2.json"
}
```

---

## Test Cases Format

The evaluator expects test cases in the following JSON format:

```json
{
  "testFunctions": [
    {
      "functionName": "printNumbers",
      "testCases": [
        {
          "input": [],
          "expected": [10, 20, 30, 40, 50]
        }
      ]
    }
  ]
}
```

### Important Notes
- `functionName` must match the function name in student code
- Evaluation is **return-based**
- `console.log()` output is **NOT evaluated**

---

## Response Structure

### Success Response (JSON)

```json
{
  "results": [
    {
      "student": "Student-1",
      "marks": 10,
      "feedback": "printNumbers: All test cases passed."
    },
    {
      "student": "Student-2",
      "marks": 0,
      "feedback": "printNumbers: Failed most test cases. Logic needs correction."
    }
  ],
  "csvUrl": "https://evaluator.onrender.com/download-results"
}
```

---

## Response Fields Explained

| Field | Description |
|------|------------|
| `student` | Identifier provided in request |
| `marks` | Total marks obtained |
| `feedback` | Evaluation feedback |
| `csvUrl` | Downloadable CSV results file |

---

## How to Test Using Postman

1. Open **Postman**
2. Create a **POST** request
3. Enter evaluator URL:
   ```text
   https://<your-evaluator-url>/evaluate-batch-by-links
   ```
4. Add header:
   ```text
   Content-Type: application/json
   ```
5. Paste the request body JSON
6. Click **Send**

🎉 Evaluation results will be returned instantly.

---

## Security & Safety

- Student code is executed inside **vm2 sandbox**
- No filesystem access
- No network access
- Execution timeout enabled
- Each submission is isolated

Safe for evaluating untrusted student code.

---

## Rules for Students (Very Important)

- Students **MUST return** output from the function
- `console.log()` will **NOT** be evaluated

### Correct
```js
function printNumbers() {
  return [10, 20, 30, 40, 50];
}
```

### Incorrect
```js
function printNumbers() {
  console.log(10, 20, 30, 40, 50);
}
```

---

## Scoring Logic

| Condition | Marks |
|----------|-------|
| All test cases pass | 10 |
| Most test cases pass | 6 |
| Some test cases pass | 3 |
| Code error / wrong logic | 0 |

---

## 🛠 Tech Stack

- Node.js
- Express.js
- vm2 (secure sandbox)
- MongoDB (via submission links)
- CSV Writer

---

## Deployment Notes

- **Render** → Recommended for testing & QA
- **AWS EC2** → Recommended for real batch usage (500+ students)

---

**Happy Evaluating!**

---

## How to Fork, Clone & Run Locally

Follow these steps to run the JS Evaluator on your local machine.

---

### 1. Fork the Repository
- Click the **Fork** button on the top-right of this repository
- This will create a copy under your GitHub account

---

### 2. Clone the Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
```

```bash
cd <repo-name>
```

---

### 3. Install Dependencies

Make sure **Node.js (v18+)** is installed.

```bash
npm install
```

> This evaluator does NOT require a database connection.  
> It fetches student code using submission links.

---

### 4. Start the Server

```bash
node server.js
```
---

### 5. Verify Server is Running

Open browser or Postman:

```text
http://localhost:3000
```

You should see the evaluator running.

---

### 6. Test Using Postman

Use the endpoint:

```text
POST http://localhost:3000/evaluate-batch-by-links
```

Refer to the **Postman request body** and **test cases format** mentioned above in this README.

---

### You’re Ready to Test!

You can now:
- Test batch submissions
- Validate marks & feedback
- Test failure cases
- Verify CSV generation

