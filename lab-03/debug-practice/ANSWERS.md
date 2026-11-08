# Answers (no peeking until you tried)

| # | Error you see | Where | Fix |
|---|---|---|---|
| 1 | `Cannot find module './queryBuilders'` | top of `index.js` | File is `queryBuilder.js`: `require('./queryBuilder')` |
| 2 | `EADDRINUSE: address already in use :::3000` | end of `initializeDBAndServer` | `app.listen` is called twice on the same port: delete the second call (or set `PORT`) |
| 3 | `SQLITE_ERROR: no such table: books` when calling `GET /books/1` (the server may crash with an unhandled rejection) | `GET /books/:id` | The table is `book`: `FROM book` |
| 4 | After fixing 3, `GET /books/1` returns `200` with `{}` instead of the book | `GET /books/:id` | `db.get(...)` returns a Promise: `const book = await db.get(...)` |

Tip: run `diff index.js ../index.js` to see exactly what was changed.
