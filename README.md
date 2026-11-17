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
- `/guide/requirement`, `/guide/expectation` — extra questions asked only for the gaming and graphics use cases: a searchable game or application and the expected performance level.
- `/results` — up to five representative offer cards for the completed journey, with the actual match count and links to change the constraints.

Answers travel in the query string, for example `/results?usecase=office&budget=18000000&priority=price&defect.chassisScratch=acceptable` or `/guide/review?usecase=gaming&requirement=cs2&expectation=balanced&budget=25000000&priority=performance&defect.chassisScratch=acceptable`. That keeps the browser's back and forward buttons working and lets the step routes restore earlier choices. A step route redirects to the first unanswered question when its prerequisites are missing, `/results` redirects to the first unanswered question while the journey is incomplete, and values that fail validation are dropped. The game or application must belong to the selected use case, so switching to a use case without these questions drops both answers. The rules live in `app/journey.ts`; the searchable catalogs and search rules live in `app/requirements.ts`.

## Results screen

`app/results.ts` selects the offers shown on `/results` from the representative offers in `app/offers.ts`: the offer must serve the chosen use case, sit at or below the budget cap, and not disclose a defect the buyer rejected. The screen shows the actual count, up to five cards, and links back to the budget, priority, defect or game/software questions so a buyer with too few results can change them. Each card shows the seller's page link, the device price, shipping separately (or `مبلغ اعلام نشده` when the seller stated none), the last-checked time, disclosed defects, unknown fields, the trade-off and a grounded reason.

Representative offers are copied from the audited rows in `docs/stock-laptop-offer-sample.csv`; the order is representative, not the final priority-weighted ranking, and two offers of the same model stay separate cards. Stored offers, eligibility rules and ranking explanations replace this fixture path in later work.

## Tests

```sh
npm test
npm run typecheck
```

`app/journey.ts` holds the journey model and its route helpers; `tests/journey.test.ts` covers parsing, validation, step order and route building. `tests/requirements.test.ts` covers the game/application catalogs and Persian-aware search, `tests/labels.test.ts` covers the review summary, and `tests/software-picker.test.tsx` renders the searchable picker in jsdom with Testing Library. `tests/offers.test.ts` checks the representative offer data, `tests/results.test.ts` covers selection, counts and refine links, and `tests/results-view.test.tsx` renders the cards and too-few/zero states. The test command loads `tsx` for the TSX tests and `tests/setup-dom.ts` installs the jsdom globals.

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
