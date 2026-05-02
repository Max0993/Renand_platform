const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "dist");

const entriesToCopy = [
  "index.html",
  "check.html",
  "cross.html",
  "form.html",
  "getdata.html",
  "login.html",
  "register.html",
  "check.css",
  "cross.css",
  "form.css",
  "getdata.css",
  "getdata2.css",
  "index.css",
  "login.css",
  "main.css",
  "register.css",
  "form.js",
  "login.js",
  "register.js",
  "send.js",
  "data.json",
  "img",
  "js",
  "README.md"
];

function copyEntry(relativePath) {
  const source = path.join(rootDir, relativePath);
  const target = path.join(outDir, relativePath);

  if (!fs.existsSync(source)) {
    return;
  }

  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entriesToCopy) {
  copyEntry(entry);
}

fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

console.log(`GitHub Pages static site built at ${path.relative(rootDir, outDir)}`);
