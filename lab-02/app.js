// Lab 2: SQLite database and CRUD routes with Express
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'bookstore.db');
const PORT = process.env.PORT || 3000;

let db = null;

// Connect to the database first, then start listening for requests
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        title  TEXT    NOT NULL,
        author TEXT    NOT NULL,
        price  INTEGER NOT NULL CHECK (price >= 0),
        pages  INTEGER NOT NULL CHECK (pages > 0)
      )
    `);
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/books/`);
    });
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

// Returns an error message if the body is not a valid book, otherwise null
const validateBook = (body) => {
  const { title, author, price, pages } = body || {};
  if (typeof title !== 'string' || title.trim() === '') return 'title is required';
  if (typeof author !== 'string' || author.trim() === '') return 'author is required';
  if (!Number.isInteger(price) || price < 0) return 'price must be a non-negative integer';
  if (!Number.isInteger(pages) || pages <= 0) return 'pages must be a positive integer';
  return null;
};

// A valid id is a positive whole number
const isValidId = (value) => /^[1-9][0-9]*$/.test(value);

// GET /books/ -> all books
app.get('/books/', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM book ORDER BY id');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /books/:bookId/ -> one book
app.get('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ error: 'bookId must be a positive integer' });
  try {
    const book = await db.get('SELECT * FROM book WHERE id = ?', [bookId]);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /books/ -> add a book
app.post('/books/', async (req, res) => {
  const problem = validateBook(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const { title, author, price, pages } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
      [title.trim(), author.trim(), price, pages]
    );
    res.status(201).json({ message: 'Book added successfully', bookId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /books/:bookId/ -> replace all fields of a book
app.put('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ error: 'bookId must be a positive integer' });
  const problem = validateBook(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const { title, author, price, pages } = req.body;
  try {
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?',
      [title.trim(), author.trim(), price, pages, bookId]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /books/:bookId/ -> remove a book
app.delete('/books/:bookId/', async (req, res) => {
  const { bookId } = req.params;
  if (!isValidId(bookId)) return res.status(400).json({ error: 'bookId must be a positive integer' });
  try {
    const result = await db.run('DELETE FROM book WHERE id = ?', [bookId]);
    if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invalid JSON body (express.json error) -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Unknown path -> 404
app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.originalUrl} does not exist` });
});

initializeDBAndServer();
