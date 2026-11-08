// Creates bookstore.db from initDB.sql. Run with: npm run setup
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const setup = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'initDB.sql'), 'utf8');
  const db = await open({
    filename: path.join(__dirname, 'bookstore.db'),
    driver: sqlite3.Database,
  });
  await db.exec(sql);
  const { total } = await db.get('SELECT COUNT(*) AS total FROM book');
  console.log(`bookstore.db ready with ${total} books`);
  await db.close();
};

setup().catch((error) => {
  console.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
