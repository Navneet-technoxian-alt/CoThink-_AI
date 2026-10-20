# CoThink AI

> Don’t just use AI. Learn how to judge it.

Repository: https://github.com/Navneet-technoxian-alt/CoThink-_AI

CoThink AI is a local-first learning studio for building AI literacy. It combines curated multilingual lessons, a transparent adaptive quiz, source-attributed topic signals, and a user-authored TrustTrace research record.

## Technology stack

- React `19.3.1`
- Vite `8.3.4`
- JavaScript, HTML, and CSS
- Native browser `localStorage` for persistence
- Node.js built-in test runner
- ESLint `9.39.5`
- Multi-stage Docker image with Nginx for static production serving

There is no backend, database, external generative AI API, or required environment variable.

## Run locally

Prerequisites: Node.js `24.13.0` and npm `11.6.3`. Both are pinned in `.nvmrc`, `.node-version`, `package.json`, and the lockfile. The project uses npm and the committed lockfile must be installed with `npm ci`.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/` in a browser.

For a clean checkout, run the commands above from the repository root. No `.env` file is needed.

## Run with Docker

```bash
docker build -t cothink-ai .
docker run --rm -p 8080:80 cothink-ai
```

Open `http://127.0.0.1:8080/`.

The container serves the Vite bundle through Nginx on port `80`; the example maps it to host port `8080`.

Production checks:

```bash
npm test
npm run lint
npm run build
```

`npm test` runs the Node.js built-in test suite in `tests/`. `npm run lint` runs ESLint over the application source. `npm run build` creates the Vite production bundle in `dist/`; `dist/` is intentionally ignored and is not required in source control.

The single required automated test command is:

```bash
npm test
```

## Features

- Dashboard with progress metrics and recent activity.
- Curated lessons for machine learning, generative AI, cybersecurity, programming, and critical thinking.
- Beginner, Intermediate, and Advanced levels; English, Hindi, and Hinglish lesson copy.
- Multi-select explanation preferences, SVG diagrams, examples, takeaways, and honest unsupported-topic states.
- Three-question quiz rounds with explanations, mistake review, score history, and a simple heuristic next-level suggestion. This is not a trained AI model.
- Trending Topics attempts direct RSS retrieval and shows explicit offline reference content when retrieval fails. It never labels fallback material as live.
- TrustTrace captures a hypothesis, confidence, user-supplied sources and excerpts, evidence classifications, relevance, rationale, and append-only decision snapshots.
- Readable TXT and JSON AI Use Passport exports with provenance and limitations.
- Namespaced localStorage for preferences, lessons, quiz progress, activity, and research records.

## Architecture

Vite serves a small React 19 single-page application. `App.jsx` owns navigation, global preferences, and activity. `learning.js`, `research.js`, and `feeds.js` are pure data/logic boundaries; their companion components own interaction state. There is no backend and no external generative AI API.

## Trust boundaries and limitations

Lessons are authored offline. Quiz adaptation is a transparent heuristic, not model inference. RSS availability depends on browser CORS and network access; failed requests show explicitly labelled offline reference content rather than pretending it is live news. The automated tests use mocked feed responses and do not require network access. TrustTrace source URLs and excerpts are supplied by the user and are not independently authenticated. Local browser storage is not a backup; use the passport exports for portability.

## Troubleshooting

- **`npm ci` fails:** confirm Node.js is `24.13.0` and npm is `11.6.3`; remove only a stale local `node_modules/` directory and rerun `npm ci`.
- **Port `5173` is busy:** stop the process using that port or run Vite with an alternate port, for example `npm run dev -- --port 5174`.
- **The Signals page shows offline reference content:** the browser could not fetch the publisher RSS feed because of network availability, CORS, timeout, or an upstream response. This is an expected honest fallback state.
- **Docker is unavailable:** install Docker Engine or Docker Desktop, then run the documented `docker build` and `docker run` commands.
- **Progress is missing:** application data is stored in the current browser's localStorage. Research records can be preserved with the TXT or JSON passport export.

No `.env.example` is included because the application has no environment variables to configure. `.env`, `.env.*`, and local configuration files remain ignored as a safety measure.

## Verification

The repository includes pure logic tests in `tests/`, covering dashboard persistence, lesson and quiz logic, RSS parsing/fallback behavior, TrustTrace decision snapshots, and passport content. Browser visual verification and live feed availability depend on the local runtime/network.
