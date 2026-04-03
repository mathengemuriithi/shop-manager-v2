const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");
const backupDir = path.join(__dirname, "../backups");

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Create timestamped backup
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `data-backup-${timestamp}.json`);

fs.copyFileSync(dataPath, backupPath);
console.log(`Backup created: ${backupPath}`);

// Keep only last 10 backups
const backups = fs
  .readdirSync(backupDir)
  .filter((f) => f.startsWith("data-backup-"));
if (backups.length > 10) {
  const oldest = backups.sort()[0];
  fs.unlinkSync(path.join(backupDir, oldest));
}
