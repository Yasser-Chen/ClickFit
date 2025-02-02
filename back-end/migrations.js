const fs = require("fs");
const path = require("path");
const db = require("./connection");

const sqlDir = path.join(__dirname, "sql");
const sqlFiles = fs.readdirSync(sqlDir).filter((file) => file.endsWith(".sql"));
let completed = 0;

sqlFiles.forEach((file) => {
  const filePath = path.join(sqlDir, file);
  const migrationSql = fs.readFileSync(filePath, "utf8");
  db.query(migrationSql, (err) => {
    if (err) {
      console.error("Error running migration:", err.message);
      process.exit(1);
    }
    console.log("Migrated:", file);
    completed++;
    if (completed === sqlFiles.length) {
      console.log("All migrations completed successfully.");
      process.exit(0);
    }
  });
});
