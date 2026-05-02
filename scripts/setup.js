#!/usr/bin/env node
/**
 * Quantara AI — Setup Script
 * Windows + Mac + Linux compatible
 * Does NOT use venv — installs directly to Python 3.14 site-packages
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IS_WIN = process.platform === "win32";

function run(cmd, cwd = ROOT, label = "") {
  if (label) console.log(`\n▶  ${label}`);
  console.log(`   $ ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

function exists(p) { return fs.existsSync(p); }

// ── Find Python 3.14 ─────────────────────────────────────────────────────────
function findPython() {
  const candidates = ["python3.14", "python3", "python"];
  for (const cmd of candidates) {
    try {
      const out = execSync(`${cmd} --version 2>&1`, { shell: true }).toString().trim();
      if (out.startsWith("Python 3.14")) return cmd;
    } catch {}
  }
  return null;
}

console.log(`
╔══════════════════════════════════════════╗
║        QUANTARA AI  —  Setup             ║
║  "Quantifying Value. Decoding Liquidity" ║
╚══════════════════════════════════════════╝
`);

const python = findPython();
if (!python) {
  console.error("❌  Python 3.14 not found in PATH.");
  console.error("    Download: https://python.org/downloads/");
  process.exit(1);
}
const pyVer = execSync(`${python} --version 2>&1`, { shell: true }).toString().trim();
console.log(`✅  ${pyVer}  (${python})`);

try {
  const nodeVer = execSync("node --version", { shell: true }).toString().trim();
  console.log(`✅  Node ${nodeVer}`);
} catch {
  console.error("❌  Node.js not found."); process.exit(1);
}

// .env files
const backendEnv = path.join(ROOT, "backend", ".env");
const backendEx  = path.join(ROOT, "backend", ".env.example");
if (!exists(backendEnv) && exists(backendEx)) {
  fs.copyFileSync(backendEx, backendEnv);
  console.log("✅  Created backend/.env");
} else { console.log("✅  backend/.env exists"); }

const feEnv = path.join(ROOT, "frontend", ".env.local");
if (!exists(feEnv)) {
  fs.writeFileSync(feEnv, "NEXT_PUBLIC_API_URL=http://localhost:8000\n");
  console.log("✅  Created frontend/.env.local");
} else { console.log("✅  frontend/.env.local exists"); }

// Python deps
console.log("\n📦  Installing Python dependencies...");
run(`${python} -m pip install -r requirements.txt --no-warn-script-location`,
    path.join(ROOT, "backend"), "pip install");

// Frontend deps
console.log("\n📦  Installing frontend dependencies...");
run("npm install --legacy-peer-deps", path.join(ROOT, "frontend"), "npm install (frontend)");

// Root deps
console.log("\n📦  Installing root dependencies...");
run("npm install", ROOT, "npm install (root)");

console.log(`
╔══════════════════════════════════════════╗
║  ✅  Setup complete!                     ║
║                                          ║
║  Start:  npm run dev                     ║
║  → Frontend  http://localhost:3000       ║
║  → API       http://localhost:8000       ║
║  → Docs      http://localhost:8000/api/docs ║
╚══════════════════════════════════════════╝
`);
