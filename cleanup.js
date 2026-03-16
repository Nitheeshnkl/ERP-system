const fs = require("fs");
const path = require("path");

// Files and folders to delete
const deletePaths = [
  ".DS_Store",
  "DATABASE_STRUCTURE 2.md",
  "DEPLOYMENT_CHECKLIST 2.md",
  "ERP_EVALUATION_REPORT 2.json",
  "docker-compose 2.yml",
  "deploy_summary.json",
  "reports/* 2.json",
  "backend/app 2.js",
  "backend/package 2.json",
  "backend/package-lock 2.json",
  "backend/.env 2.example",
  "frontend/index 2.html",
  "frontend/vite.config 2.ts",
  "frontend/package 2.json",
  "frontend/package-lock 2.json",
  "frontend/.env 2.example"
];

const deleteFolders = [
  "backend/node_modules",
  "frontend/node_modules"
];

// Renames
const renameMap = {
  "CHANGELOG 2.md": "CHANGELOG.md",
  "FINAL_PROJECT_REPORT 2.md": "FINAL_PROJECT_REPORT.md"
};

// Cleanup .gitignore entries
const gitignorePaths = [
  "node_modules/",
  ".env",
  ".DS_Store",
  "dist/",
  "build/",
  "reports/",
  "deploy_summary.json",
  "*.log"
];

function deleteFileOrFolder(targetPath) {
  const fullPath = path.join(__dirname, targetPath);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`🗑 Deleted: ${targetPath}`);
  }
}

function renameFile(oldName, newName) {
  const oldPath = path.join(__dirname, oldName);
  const newPath = path.join(__dirname, newName);
  if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✏️ Renamed: ${oldName} → ${newName}`);
  }
}

function updateGitignore() {
  const gitignore = path.join(__dirname, ".gitignore");
  if (!fs.existsSync(gitignore)) return;

  let content = fs.readFileSync(gitignore, "utf8").split("\n");
  gitignorePaths.forEach(p => {
    if (!content.includes(p)) {
      content.push(p);
      console.log(`➕ Added .gitignore entry: ${p}`);
    }
  });

  fs.writeFileSync(gitignore, content.join("\n"));
}

// Run cleanup
deletePaths.forEach(deleteFileOrFolder);
deleteFolders.forEach(deleteFileOrFolder);

Object.entries(renameMap).forEach(
  ([oldName, newName]) => renameFile(oldName, newName)
);

updateGitignore();

console.log("\n✨ Cleanup complete! Review logs above before committing.");