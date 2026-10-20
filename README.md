# CoThink AI

> Don’t just use AI. Learn how to judge it.

CoThink AI is a local-first learning studio for building AI literacy. It combines curated multilingual lessons, a transparent adaptive quiz, source-attributed topic signals, and a user-authored TrustTrace research record.

## Run locally

Runtime: Node.js `24.13.0` (see `.nvmrc`). The lockfile is committed so installs can use `npm ci`.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/` in a browser.

## Run with Docker

```bash
docker build -t cothink-ai .
docker run --rm -p 8080:80 cothink-ai
```

Open `http://127.0.0.1:8080/`.

Production checks:

```bash
npm test
npm run lint
npm run build
```

`npm test` runs the Node.js built-in test suite in `tests/`. `npm run lint` runs ESLint over the application source. `npm run build` creates the Vite production bundle in `dist/`; `dist/` is intentionally ignored and is not required in source control.

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

Lessons are authored offline. Quiz adaptation is a transparent heuristic, not model inference. RSS availability depends on browser CORS and network access. TrustTrace source URLs and excerpts are supplied by the user and are not independently authenticated. Local browser storage is not a backup; use the passport exports for portability.

## Verification

The repository includes pure logic tests in `tests/`, covering dashboard persistence, lesson and quiz logic, RSS parsing/fallback behavior, TrustTrace decision snapshots, and passport content. Browser visual verification and live feed availability depend on the local runtime/network.
