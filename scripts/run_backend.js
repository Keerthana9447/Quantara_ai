/**
 * run_backend.js — Cross-platform backend launcher
 * Finds the correct Python 3.14 executable on Windows/Mac/Linux
 * and starts uvicorn from the backend directory.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const BACKEND = path.join(ROOT, "backend");
const NO_RELOAD = process.argv.includes("--no-reload");

// Candidate Python executables in priority order
const PYTHON_CANDIDATES = [
  "python3.14",
  "python3",
  "python",
];

function findPython() {
  const { execSync } = require("child_process");
  for (const cmd of PYTHON_CANDIDATES) {
    try {
      const out = execSync(`${cmd} --version 2>&1`).toString().trim();
      if (out.includes("3.14")) {
        return cmd;
      }
    } catch {}
  }
  // Last resort — try bare python and warn
  console.warn("[API] ⚠️  Could not find Python 3.14 in PATH. Trying 'python'...");
  return "python";
}

const python = findPython();
const args = [
  "-m", "uvicorn",
  "app.main:app",
  "--host", "0.0.0.0",
  "--port", "8000",
];
if (!NO_RELOAD) args.push("--reload");

console.log(`[API] Starting: ${python} ${args.join(" ")}`);
console.log(`[API] Working dir: ${BACKEND}`);

const proc = spawn(python, args, {
  cwd: BACKEND,
  stdio: "inherit",
  shell: true,   // Required on Windows for PATH resolution
});

proc.on("error", (err) => {
  console.error(`[API] Failed to start backend: ${err.message}`);
  process.exit(1);
});

proc.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    process.exit(code);
  }
});
