// Plain Node.js server using the built-in http module (Task 3)
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello');
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});
