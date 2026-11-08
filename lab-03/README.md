# Lab 3: REST API, query parameters, validation, debugging

**Name:** M. Ekshith · **Registration number:** 252U1R9096 · **Section:** 111, CSE-GEN(AI)

**Live link:** Not deployed. *(Add your URL here, or rely on the Postman screenshots below.)*

## Objective

Turn the Lab 2 routes into a clean REST API with search, sorting, pagination, a price filter, input validation, correct status codes and one consistent JSON format, and practise debugging common errors.

## How to run

Requires Node.js 18+. No environment variables are needed (optional: `PORT`, default `3000`). No `.env` file is used.

```bash
cd lab-03
npm install
npm run setup        # creates bookstore.db from initDB.sql (12 sample books)
npm start            # http://localhost:3000/books
npm run test:unit    # unit tests for the validation/query logic (no server needed)
npm run test:routes  # checks every route and status code (server must be running)
```

## Endpoints

Paths are nouns (`/books`); the HTTP method shows the action.

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/books` | List books with search, sort, price filter and pagination | 200 |
| GET | `/books/:id` | Get one book | 200 |
| POST | `/books` | Create a book | 201 |
| PUT | `/books/:id` | Replace a book | 200 |
| DELETE | `/books/:id` | Delete a book | 200 |

### Query parameters for `GET /books`

| Parameter | Default | Meaning |
|---|---|---|
| `search_q` | (none) | Partial title match using `LIKE` |
| `order_by` | `id` | One of `id`, `title`, `author`, `price` |
| `order` | `ASC` | `ASC` or `DESC` |
| `limit` | `10` | Whole number from 1 to 100 |
| `offset` | `0` | Whole number, 0 or more |
| `min_price` | (none) | Lowest price; with `max_price` it becomes `BETWEEN ? AND ?` |
| `max_price` | (none) | Highest price |

Example: `GET /books?search_q=java&order_by=price&order=DESC&limit=5&min_price=1000`

### Validation (POST and PUT)

- `title` and `author`: required, non-empty text
- `price`: required, a number (not text), not negative
- `pages`: optional, a positive whole number

### Response formats

- Errors always look like `{ "message": "..." }`, e.g. `{ "message": "price is required and must be a number" }`.
- List response: `{ "total": 12, "count": 10, "limit": 10, "offset": 0, "books": [ ... ] }`.
- Create response: `{ "message": "Book added successfully", "id": 13 }`.

### Status codes

| Code | When |
|---|---|
| 200 | Read, update or delete succeeded |
| 201 | Book created |
| 400 | Bad input: invalid query parameter, invalid id, invalid body or broken JSON |
| 404 | Valid id but no such book, or unknown route |
| 500 | Unexpected server error |

## Postman test list

Import `postman_collection.json` (each request checks its status code). Run S8 before S9 and S10, because S8 saves the new id.

| # | Request | Expected |
|---|---|---|
| S1 | GET `/books` | 200 |
| S2 | GET `/books?search_q=java` | 200 |
| S3 | GET `/books?order_by=price&order=DESC` | 200 |
| S4 | GET `/books?limit=3&offset=3` | 200 |
| S5 | GET `/books?min_price=2000&max_price=4000` | 200 |
| S6 | Combined search, sort, limit and price | 200 |
| S7 | GET `/books/1` | 200 |
| S8 | POST valid book | 201 |
| S9 | PUT the new book | 200 |
| S10 | DELETE the new book | 200 |
| F1–F5 | Bad `order_by`, `order`, `limit`, `min_price`; `min_price` > `max_price` | 400 |
| F6 | GET `/books/abc` | 400 |
| F7 | GET `/books/99999` | 404 |
| F8–F11 | POST missing title, missing author, text price, negative price | 400 |
| F12 | POST broken JSON | 400 |
| F13 | PUT empty title | 400 |
| F14, F15 | PUT / DELETE `/books/99999` | 404 |
| F16 | GET `/authors` (unknown route) | 404 |

## Screenshots

![Search and sort result](screenshots/get-search-sort.png)
![Price range result](screenshots/get-price-range.png)
![Create returns 201](screenshots/post-201.png)
![Validation error returns 400](screenshots/post-400.png)
![Missing book returns 404](screenshots/get-404.png)
![Postman collection run, all tests passing](screenshots/postman-run.png)

## Debugging exercise (Task 7)

| Error | What it looks like | Fix |
|---|---|---|
| Port conflict | `EADDRINUSE: address already in use :::3000` | Stop the process using port 3000, or start with another port: `PORT=3001 npm start` |
| Wrong import path | `Cannot find module './queryBuilders'` | Match the real file name exactly: `require('./queryBuilder')` |
| Table name typo | `SQLITE_ERROR: no such table: books` | Use the table name from `initDB.sql`, which is `book` |
| Missing `await` | Response is `{}` or a pending Promise | Put `await` before `db.get`, `db.all` and `db.run`, and make the handler `async` |

## Notes: problems faced and how I solved them

- **`order_by` and `order` cannot be `?` placeholders**, because placeholders only stand for values, not column names or keywords. They are checked against a fixed allowlist, and only then written into the SQL. Everything else uses `?`.
- **LIKE wildcards in the search text.** Searching for `%` would match every title, so `%`, `_` and `\` typed by the user are escaped and the query uses `ESCAPE '\'`.
- **Repeated query parameters.** `?limit=1&limit=2` arrives as an array, so each value is checked to be a single string before use.
- **Pagination needs a total.** The list response also runs a `COUNT(*)` with the same filters so clients know how many books match overall.
- *(Add anything extra you faced yourself.)*

## Viva notes

- **Query parameter vs path parameter:** a path parameter identifies one resource (`/books/5`); query parameters refine a collection (`/books?search_q=java&limit=5`) and are usually optional.
- **Stateless:** each request carries everything the server needs; the server keeps no memory of earlier requests from the same client. Any state lives in the database (or is sent by the client, e.g. a token).
- **Bad input vs missing record:** bad input (invalid body, bad id or query value) is `400 Bad Request`; a well-formed request for a record that does not exist is `404 Not Found`.

## Files

```
lab-03/
├── index.js                  Express server and routes
├── queryBuilder.js           Input checks and SQL building (no dependencies)
├── setupDb.js                Creates bookstore.db from initDB.sql
├── initDB.sql                Table definition and sample data
├── test_queryBuilder.js      Unit tests for queryBuilder.js
├── test_routes.js            Checks every route against a running server
├── postman_collection.json   Postman tests (success and failure)
├── package.json
├── .gitignore                Excludes node_modules/, .env and *.db
└── screenshots/
```
