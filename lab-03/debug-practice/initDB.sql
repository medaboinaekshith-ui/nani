-- Table definition and sample data for Lab 3
DROP TABLE IF EXISTS book;

CREATE TABLE book (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  title  TEXT NOT NULL,
  author TEXT NOT NULL,
  price  REAL NOT NULL CHECK (price >= 0),
  pages  INTEGER
);

INSERT INTO book (title, author, price, pages) VALUES
  ('Clean Code', 'Robert C. Martin', 3499, 464),
  ('The Pragmatic Programmer', 'Andrew Hunt', 3999, 352),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 2799, 472),
  ('You Don''t Know JS Yet', 'Kyle Simpson', 1999, 143),
  ('Node.js Design Patterns', 'Mario Casciaro', 4299, 660),
  ('Learning SQL', 'Alan Beaulieu', 2999, 388),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 4999, 616),
  ('JavaScript: The Good Parts', 'Douglas Crockford', 1799, 176),
  ('Introduction to Algorithms', 'Thomas H. Cormen', 5499, 1312),
  ('Refactoring', 'Martin Fowler', 4599, 448),
  ('Learning JavaScript Design Patterns', 'Addy Osmani', 2499, 254),
  ('SQL Cookbook', 'Anthony Molinaro', 3299, 572);
