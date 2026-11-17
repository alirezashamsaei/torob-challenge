# Torob Stock Laptop Guide

## Run locally

Use Node.js 22.13 or newer and npm.

```sh
npm ci
npm run seed:offers
npm run dev
```

Open http://localhost:3000. A request to `GET /api/health` returns HTTP 200 and `{"status":"ok"}` when the application server responds.

To run the production build locally, use `npm run build` followed by `npm start`.

## Buyer journey routes

- `/` — start screen.
- `/guide/usecase`, `/guide/budget`, `/guide/priority`, `/guide/defects`, `/guide/review` — wizard steps.
- `/guide/requirement`, `/guide/expectation` — extra questions asked only for the gaming and graphics use cases: a searchable game or application and the expected performance level.
- `/results` — up to five eligible stored offers for the completed journey, with the actual match count and links to change the constraints.

Answers travel in the query string, for example `/results?usecase=office&budget=18000000&priority=price&defect.chassisScratch=acceptable` or `/guide/review?usecase=gaming&requirement=cs2&expectation=balanced&budget=25000000&priority=performance&defect.chassisScratch=acceptable`. That keeps the browser's back and forward buttons working and lets the step routes restore earlier choices. A step route redirects to the first unanswered question when its prerequisites are missing, `/results` redirects to the first unanswered question while the journey is incomplete, and values that fail validation are dropped. The game or application must belong to the selected use case, so switching to a use case without these questions drops both answers. The rules live in `app/journey.ts`; the searchable catalogs and search rules live in `app/requirements.ts`.

## Results screen

`/results` reads the SQLite store and uses `app/eligibility.ts` to apply hard filters before showing offers. `evaluateStoredOffers` in `app/stored-offers.ts` returns a decision with all exclusion reason codes for every stored row. Decisions are specific to the journey and are not written over the source evidence. The screen shows the actual count, up to five cards, and links back to the questions. Each card shows the seller's page link, device price, shipping separately, date observed, disclosed defects and unknown fields.

The order is database insertion order, not priority-weighted ranking. The audit recorded no shipping amounts; shipping is unknown and is never added to the device budget. Two offers of the same model remain separate. Priority weighting and richer explanations remain future work.

The eligibility rules are deliberately conservative. Availability must be affirmative and not a catalog-only, old, unconfirmed or preorder observation; price must be a positive safe integer at or below the budget. A row must be provisionally reviewed, have offer-page evidence and specific-device condition evidence or applicable test/return terms. A cosmetic grade alone is insufficient. Everyday and office require at least 4 GB and 8 GB RAM respectively. Gaming and graphics require a recognized GPU and 8 GB RAM (16 GB above basic), with explicit GPU tiers in `app/eligibility.ts`; the selected game or application and expected level determine the tier. These are provisional screening floors, not FPS or render-time promises. Unrecognized configurations are excluded, not guessed. If chassis condition or severity is required by the buyer's answer, undisclosed information is excluded. Inspect the source before purchase.

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

## Offer storage

Run `npm run seed:offers` to create `data/offers.sqlite` and insert the audited CSV rows. Set `OFFERS_DB_PATH` to choose a persistent database path; pass another CSV path after `--` to use the same column format. The offer URL identifies an offer. Seeding inserts new URLs only and never updates existing records, so reviewed changes survive repeat deployments. All source columns, including evidence URLs, observation dates, explicit unknowns and empty values, are retained as recorded. The results page reads this store; a missing or unreadable database is an error, not an empty result set.

For stores seeded before the issue #9 review, run `node scripts/apply-offer-review.mjs` with the same `OFFERS_DB_PATH`. The script applies corrections only when the complete stored row matches the original snapshot, reports missing or changed rows, and leaves manual edits intact. It is safe to repeat. Newly seeded stores already contain the reviewed values.

The Docker image seeds and applies matching review corrections on startup. Conflicts are reported in the startup log and left untouched. Mount durable storage at `/app/data` (or set `OFFERS_DB_PATH` to a path on a writable persistent volume); without a volume, container replacement loses the database and any reviews. For example: `docker run --rm -p 127.0.0.1:3000:3000 -v torob-data:/app/data torob-challenge`. Ensure the volume is writable by the image's `node` user. Back up the SQLite database before replacing or migrating the volume.
