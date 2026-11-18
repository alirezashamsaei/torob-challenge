# Torob for Used Laptops

[Try the live guide](https://torob.alirezashamsaei.ir/) · [Torob AI Product Engineer challenge](https://jobs.torob.com/ai-product-engineer)

A Persian buying guide that ranks specific used-laptop offers around what you need, what you can spend, and which defects you can live with.

## Why this market

As new electronics have become harder to afford for many buyers in Iran, I saw an opportunity in the growing second-hand market and chose laptops as a starting point. Once you decide to buy used, two problems stand out. The first is **trust**. Two listings for the same model can describe different physical units, with different wear, battery evidence, or seller test terms. The second is **choice overload**. Comparing dozens of listings across shops takes time, and even after that work it's hard to know whether you found the best trade-off for your needs.

## What I built

The guide applies Torob's cross-seller comparison model to used laptops. It starts with a database of audited offers and asks what you'll use the laptop for, your maximum device budget, what matters most, and whether you can live with chassis scratches. Gaming and graphics buyers also choose the game or application and their expected performance level.

The guide filters offers against those requirements, then ranks the matches using the buyer's priority: price, performance, or condition. A buyer can change their answers from the verdict and see how the shortlist changes. Each card shows the seller link, recorded price, observation date, and available evidence about defects and test terms.

## Try two cases

- **Office work, 150 million toman.** With chassis scratches acceptable, the tested snapshot returned 27 matches. Compare [price priority](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=office&budget=150000000&priority=price&defect.chassisScratch=acceptable), which puts the HP ZBook 14 G2 first, with [performance priority](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=office&budget=150000000&priority=performance&defect.chassisScratch=acceptable), which puts the Dell Latitude 5490 first.
- **Counter-Strike 2, balanced expectations, 100 million toman.** The [gaming verdict](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=gaming&requirement=cs2&expectation=balanced&budget=100000000&priority=performance&defect.chassisScratch=acceptable) returned zero matches and five separately labeled alternatives. Each explains that its device price exceeds the budget.

## Decisions and scope

- **Keep the listing as the unit of comparison.** Two offers for the same model can carry different evidence, so each retains its own seller, price, condition disclosures, and source link.
- **Ask what wear the buyer can accept.** The prototype focuses on chassis scratches, with a severity follow-up where relevant. Undisclosed condition stays visible as unknown.
- **Apply hard requirements before ranking.** The deterministic ranker weighs price, performance, condition, and the completeness of the available evidence. Hardware tiers are estimates of suitability. When matches run short, alternatives disclose which requirements they miss.
- **Use a reviewed snapshot.** The [source audit](torob-stock-laptop-source-audit.md) covers 120 listings, of which 42 passed provisional review across seven sellers. The demo reads that snapshot from SQLite. Automated refresh is future work. Prices and availability reflect the recorded observations and can change on seller pages.
- **Use AI as a development tool.** I used AI to prototype the flow and iterate on data review, implementation, and tests. The shipped ranking uses an inspectable [rules baseline](docs/ranking-baseline.md). The proposed SubQ comparison is documented in the [decision record](docs/adr/0002-evaluate-subq-ranking.md).

## Run locally

Use Node.js 22.13 or later.

```sh
npm ci
npm run seed:offers
npm run dev
```

Open [localhost:3000](http://localhost:3000). Run `npm test`, `npm run typecheck`, and `npm run build` to verify the project.

```sh
docker build -t torob-challenge .
docker run --rm -p 127.0.0.1:3000:3000 torob-challenge
```
