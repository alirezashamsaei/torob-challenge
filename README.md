# Torob Stock Laptop Guide

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. A request to `GET /api/health` returns HTTP 200 and `{"status":"ok"}` when the application server responds.

To run the production build locally, use `npm run build` followed by `npm start`.

## Runtime configuration

The server defaults to port 3000. Use `npm run dev -- --port 3001` to choose another local port, or set `PORT` in the process environment before starting the server.

The app currently requires zero credentials. For local development, put any future credentials in `.env.local` and read them from `process.env` in server-side code. Git ignores local environment files. Reserve the `NEXT_PUBLIC_` prefix for values intended to be included in browser bundles.
