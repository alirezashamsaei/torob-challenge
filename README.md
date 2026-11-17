# Torob Stock Laptop Guide

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. A request to `GET /api/health` returns HTTP 200 and `{"status":"ok"}` when the application server responds.

To run the production build locally, use `npm run build` followed by `npm start`.

## Buyer journey routes

- `/` — start screen.
- `/guide/usecase`, `/guide/budget`, `/guide/priority`, `/guide/defects`, `/guide/review` — wizard steps.
- `/results` — sample ranked offers for the completed journey.

Answers travel in the query string, for example `/results?usecase=office&budget=18000000&priority=price&defect.chassisScratch=acceptable`. That keeps the browser's back and forward buttons working and lets the step routes restore earlier choices. A step route redirects to the first unanswered question when its prerequisites are missing, `/results` redirects to the first unanswered question while the journey is incomplete, and values that fail validation are dropped. The rules live in `app/journey.ts`.

## Tests

```sh
npm test
npm run typecheck
```

`app/journey.ts` holds the journey model and its route helpers; `tests/journey.test.ts` covers parsing, validation, step order and route building.

## Runtime configuration

The server defaults to port 3000. Use `npm run dev -- --port 3001` to choose another local port, or set `PORT` in the process environment before starting the server.

The app currently requires zero credentials. For local development, put any future credentials in `.env.local` and read them from `process.env` in server-side code. Git ignores local environment files. Reserve the `NEXT_PUBLIC_` prefix for values intended to be included in browser bundles.

## Run with Docker

```sh
docker build -t torob-challenge .
docker run --rm -p 127.0.0.1:3000:3000 torob-challenge
```

The container listens on port 3000 and checks `/api/health`. If port 3000 is already in use on the host, publish a different host port, such as `-p 127.0.0.1:3001:3000`.

Set any server-side credentials in the hosting platform's runtime environment. For local containers, use `docker run --env-file .env.local` with the other run options.
