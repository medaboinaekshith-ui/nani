# Lab 2: SQLite database and CRUD routes

**Name:** M. Ekshith · **Registration number:** 252U1R9096 · **Section:** 111, CSE-GEN(AI)

**Live link:** Not deployed. *(Add your URL here, or rely on the Postman screenshots below.)*

## Objective

Store data in a SQLite database and build a REST API with Express that can Create, Read, Update and Delete (CRUD) books.

## How to run

Requires Node.js 18+. No environment variables are needed (optional: `PORT`, default `3000`). No `.env` file is used.

```bash
cd lab-02
npm install        # express, sqlite, sqlite3 (+ nodemon for dev)
npm run seed       # creates bookstore.db with the book table and 10 sample books
npm start          # node app.js
npm run dev        # nodemon app.js (auto-restart on code changes)
```

The API runs at <http://localhost:3000/books/>.

## Database

Table `book` in `bookstore.db` (created by `seed.js`, and by `app.js` if missing):

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | primary key, auto-increment |
| `title` | TEXT | required |
| `author` | TEXT | required |
| `price` | INTEGER | required, 0 or more |
| `pages` | INTEGER | required, more than 0 |

## Endpoints

| Method | Path | Description | Status codes |
|---|---|---|---|
| GET | `/books/` | List all books ordered by id | 200 |
| GET | `/books/:bookId/` | Get one book | 200, 400, 404 |
| POST | `/books/` | Add a book from a JSON body | 201, 400 |
| PUT | `/books/:bookId/` | Replace all fields of a book | 200, 400, 404 |
| DELETE | `/books/:bookId/` | Delete a book | 200, 400, 404 |
| any | any other path | Unknown route | 404 |

`400` = invalid id or invalid/missing body fields, `404` = no such book, `500` = unexpected server error.

### Examples

`POST /books/` with body
```json
{ "title": "Refactoring 2nd Ed", "author": "Martin Fowler", "price": 4799, "pages": 448 }
```
returns `201`
```json
{ "message": "Book added successfully", "bookId": 11 }
```

`PUT /books/11/` (same body shape) returns `200` `{ "message": "Book updated successfully" }`.
`DELETE /books/11/` returns `200` `{ "message": "Book deleted successfully" }`.
`GET /books/999/` returns `404` `{ "error": "Book not found" }`.

## Screenshots

Postman screenshots of every endpoint and error case:

![GET all books](screenshots/get-all.png)
![GET one book](screenshots/get-one.png)
![GET missing book returns 404](screenshots/get-404.png)
![POST add book returns 201](screenshots/post-201.png)
![POST invalid body returns 400](screenshots/post-400.png)
![PUT update book](screenshots/put-200.png)
![DELETE book](screenshots/delete-200.png)
![Database view in SQLite](screenshots/db-view.png)

## Notes: problems faced and how I solved them

- **Nodemon restarting on every database write.** `npm run dev` restarted the server each time `bookstore.db` changed, even mid-request. Fixed with `nodemon.json` that ignores `*.db` and `*.db-journal`.
- **SQL injection risk.** User input is never joined into SQL strings. Every query uses `?` placeholders, e.g. `db.get('SELECT * FROM book WHERE id = ?', [bookId])`.
- **Requests arriving before the database is open.** The connection is opened with `await` inside `initializeDBAndServer()`, and `app.listen` is called only after it succeeds.
- **Missing rows returning the wrong status.** `UPDATE` and `DELETE` do not fail on a missing id, so I check `result.changes === 0` and return `404`.
- *(Add anything extra you faced yourself.)*

## Viva notes

- **Why `await` the database call?** Database calls are asynchronous and return Promises. Without `await` the handler would respond before the data arrives (with a pending Promise instead of rows). `await` pauses the handler until the result or error is ready.
- **SQL injection and placeholders:** SQL injection is when input such as `' OR '1'='1` is concatenated into a query and runs as SQL. With `?` placeholders the SQL is compiled first and the values are passed separately as plain data, so they can never change the query.
- **PUT vs POST:** POST creates a new resource, and repeating it creates more rows (not idempotent). PUT replaces the resource at a known id, and repeating it with the same data leaves the same result (idempotent).
- **`db.get` vs `db.all` vs `db.run`:** `get` returns one row, `all` returns every row, `run` executes INSERT/UPDATE/DELETE and reports `lastID` and `changes`.

## Git

`node_modules/`, `.env` and the `*.db` database files are in `.gitignore`. Run `npm run seed` after cloning to create the database.
