// One-time seeder: creates the book table and inserts sample rows.
// Run with: npm run seed
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbPath = path.join(__dirname, 'bookstore.db');

const books = [
  ['Clean Code', 'Robert C. Martin', 3499, 464],
  ['The Pragmatic Programmer', 'Andrew Hunt', 3999, 352],
  ['Eloquent JavaScript', 'Marijn Haverbeke', 2799, 472],
  ['You Don\'t Know JS Yet', 'Kyle Simpson', 1999, 143],
  ['Node.js Design Patterns', 'Mario Casciaro', 4299, 660],
  ['Learning SQL', 'Alan Beaulieu', 2999, 388],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', 4999, 616],
  ['JavaScript: The Good Parts', 'Douglas Crockford', 1799, 176],
  ['Introduction to Algorithms', 'Thomas H. Cormen', 5499, 1312],
  ['Refactoring', 'Martin Fowler', 4599, 448],
];

const seed = async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  await db.exec(`
    DROP TABLE IF EXISTS book;
    CREATE TABLE book (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      title  TEXT    NOT NULL,
      author TEXT    NOT NULL,
      price  INTEGER NOT NULL CHECK (price >= 0),
      pages  INTEGER NOT NULL CHECK (pages > 0)
    );
  `);

  for (const book of books) {
    // Parameterised insert: values are never joined into the SQL string
    await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
      book
    );
  }

  console.log(`Seeded ${books.length} books into ${dbPath}`);
  await db.close();
};

seed().catch((error) => {
  console.error(`Seeding failed: ${error.message}`);
  process.exit(1);
});
