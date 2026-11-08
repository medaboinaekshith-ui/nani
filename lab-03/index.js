// Lab 3: REST API with query parameters, validation and consistent responses
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { parseListQuery, validateBook, isValidId } = require('./queryBuilder');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let db = null;

const sendError = (res, status, message) => res.status(status).json({ message });

// GET /books -> search, sort, filter and paginate
app.get('/books', async (req, res) => {
  const q = parseListQuery(req.query);
  if (q.error) return sendError(res, 400, q.error);

  try {
    const { total } = await db.get(`SELECT COUNT(*) AS total FROM book ${q.where}`, q.params);
    const books = await db.all(
      `SELECT id, title, author, price, pages FROM book ${q.where}
       ORDER BY ${q.orderBy} ${q.order} LIMIT ? OFFSET ?`,
      [...q.params, q.limit, q.offset]
    );
    res.status(200).json({ total, count: books.length, limit: q.limit, offset: q.offset, books });
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

// GET /books/:id -> one book
app.get('/books/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return sendError(res, 400, 'id must be a positive whole number');
  try {
    const book = await db.get('SELECT * FROM book WHERE id = ?', [req.params.id]);
    if (!book) return sendError(res, 404, 'Book not found');
    res.status(200).json(book);
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

// POST /books -> create
app.post('/books', async (req, res) => {
  const problem = validateBook(req.body);
  if (problem) return sendError(res, 400, problem);
  const { title, author, price, pages = null } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
      [title.trim(), author.trim(), price, pages]
    );
    res.status(201).json({ message: 'Book added successfully', id: result.lastID });
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

// PUT /books/:id -> replace
app.put('/books/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return sendError(res, 400, 'id must be a positive whole number');
  const problem = validateBook(req.body);
  if (problem) return sendError(res, 400, problem);
  const { title, author, price, pages = null } = req.body;
  try {
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?',
      [title.trim(), author.trim(), price, pages, req.params.id]
    );
    if (result.changes === 0) return sendError(res, 404, 'Book not found');
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

// DELETE /books/:id -> remove
app.delete('/books/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return sendError(res, 400, 'id must be a positive whole number');
  try {
    const result = await db.run('DELETE FROM book WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return sendError(res, 404, 'Book not found');
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
});

// Broken JSON body -> 400, anything else -> 500 (same { message } shape)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return sendError(res, 400, 'Request body is not valid JSON');
  sendError(res, 500, 'Internal server error');
});

// Unknown route -> 404
app.use((req, res) => sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`));

// Open the database first, then listen
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: path.join(__dirname, 'bookstore.db'), driver: sqlite3.Database });
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/books`));
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
