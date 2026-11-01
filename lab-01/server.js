// Express server (Tasks 4-6)
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Student details shown by /about (fill in your own section)
const STUDENT = { name: 'M. Ekshith', section: '111, CSE-GEN(AI)' };

// GET / -> welcome text
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Backend Development Fundamentals Lab 01 server!');
});

// GET /about -> JSON with name and section
app.get('/about', (req, res) => {
  res.status(200).json(STUDENT);
});

// GET /time -> current date and time
app.get('/time', (req, res) => {
  res.status(200).send(`Current date and time: ${new Date()}`);
});

// Any other path -> 404 (must be last)
app.use((req, res) => {
  res.status(404).send(`404 Not Found: ${req.method} ${req.originalUrl} does not exist`);
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
