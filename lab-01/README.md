# Lab 1: Node.js and Express server

**Name:** M. Ekshith · **Registration number:** 252U1R9096 · **Section:** 111, CSE-GEN(AI)

**Live link:** Not deployed. *(Replace with your Render / Railway / Cloud IDE URL, or keep this line and rely on the Postman screenshots below.)*

## Objective

Set up a Node.js project and build a small web server, first with the built-in `http` module and then with Express.

## How to run

Requires Node.js 18+. No environment variables are needed (optional: `PORT`, default `3000`).

```bash
cd lab-01
npm install            # installs express into node_modules/
npm start              # Express server  (node server.js)
npm run start:http     # plain http server (node server-http.js)
```

Open <http://localhost:3000>. Stop with `Ctrl + C`.

## Project files

| File | Purpose |
|---|---|
| `server-http.js` | Plain server using `http.createServer`, replies "Hello" on port 3000 |
| `server.js` | Express server with `/`, `/about`, `/time` and a 404 handler |
| `package.json` | Project metadata, scripts and dependencies |
| `.gitignore` | Keeps `node_modules/` and `.env` out of Git |

## Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| GET | `/` | Welcome text | 200 OK |
| GET | `/about` | JSON with name and section | 200 OK |
| GET | `/time` | Current date and time (`new Date()`) | 200 OK |
| any | any other path | "404 Not Found" message | 404 Not Found |

## Screenshots

![HTTP server replying Hello](screenshots/http-hello.png)
![GET /](screenshots/root.png)
![GET /about](screenshots/about.png)
![GET /time](screenshots/time.png)
![Unknown route returns 404](screenshots/not-found.png)

## package.json fields (Task 1)

- `name`: project name (lowercase, no spaces).
- `version`: project version (`major.minor.patch`).
- `description`: short summary of the project.
- `main`: entry file when the package is imported.
- `scripts`: named commands run with `npm run <name>` (`npm start`).
- `keywords`: search terms for the npm registry.
- `author`: who wrote it.
- `license`: usage terms (ISC by default).
- `dependencies`: packages needed at run time (`express`).

## Viva notes

- **package.json vs node_modules:** `package.json` is the small file that *describes* the project and lists its dependencies; `node_modules/` is the folder where the installed packages are actually stored. It can be recreated with `npm install`, so it is not committed.
- **`app.listen`:** binds the Express app to a port and starts accepting HTTP requests; the callback runs once the server is ready.
- **Request and response:** `req` represents the incoming HTTP request (method, URL, headers); `res` is what we build and send back (status, headers, body).

## Notes: problems faced and how I solved them

- *(Add your own here, e.g. "Port 3000 already in use" → stopped the old process / changed `PORT`.)*
- The 404 handler must be registered **after** all routes, otherwise it would catch valid paths.

## Git

`node_modules/` and `.env` are listed in `.gitignore`.
