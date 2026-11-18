# Torob for Used Laptops

[Try the live guide](https://torob.alirezashamsaei.ir/) · [Torob AI Product Engineer challenge](https://jobs.torob.com/ai-product-engineer) · [نسخهٔ فارسی](README.fa.md)

A Persian buying guide that ranks specific used-laptop offers around what you need, what you can spend, and which defects you can live with.

## 1. A real buyer problem

As new electronics have become harder to afford for many buyers in Iran, I saw an opportunity in the growing second-hand market and chose laptops as a starting point. Once you decide to buy used, two problems stand out. The first is **trust**. Two listings for the same model can describe different physical units, with different wear, battery evidence, or seller test terms. The second is **choice overload**. Comparing dozens of listings across shops takes time, and even after that work it's hard to know whether you found the best trade-off for your needs.

The seller audit documents both specific defects and gaps in condition evidence. Buyer interviews and usability testing are the next step for validating how people make these trade-offs. [Source audit](torob-stock-laptop-source-audit.md)

## 2. The original idea

The guide applies Torob's cross-seller comparison model to used laptops. It starts with a database of audited offers and asks what you'll use the laptop for, your maximum device budget, what matters most, and whether you can live with chassis scratches. Gaming and graphics buyers also choose the game or application and their expected performance level.

The buyer can make acceptable wear part of the search and revise it directly from the verdict. The first version focuses on chassis scratches, with a severity follow-up where relevant. Each seller listing keeps its own condition evidence, so different units of the same model can appear side by side.

## 3. Data and ranking by buyer intent

The audit covers 120 listings. Of those, 42 passed provisional review across seven sellers. The app reads the reviewed snapshot from SQLite. Prices and availability reflect the recorded observations. Automated refresh is future work. [Source audit](torob-stock-laptop-source-audit.md)

The guide filters by budget, evidence, hardware requirements, and defect tolerance before ranking. The rules give the buyer's priority the largest weight and also account for evidence completeness. Hardware tiers estimate suitability. [Ranking baseline](docs/ranking-baseline.md)

Two cases verified on the deployed app:

- **Office work, 150 million toman.** With chassis scratches acceptable, the tested snapshot returned 27 matches. Compare [price priority](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=office&budget=150000000&priority=price&defect.chassisScratch=acceptable), which puts the HP ZBook 14 G2 first, with [performance priority](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=office&budget=150000000&priority=performance&defect.chassisScratch=acceptable), which puts the Dell Latitude 5490 first.
- **Counter-Strike 2, balanced expectations, 100 million toman.** The [gaming verdict](https://torob.alirezashamsaei.ir/guide/review?verdict=1&usecase=gaming&requirement=cs2&expectation=balanced&budget=100000000&priority=performance&defect.chassisScratch=acceptable) returned zero matches and five separately labeled alternatives. Each explains that its device price exceeds the budget.

## 4. Explanations and product judgment

Each card shows the ranking rationale, seller link, device price, observation date, defects, and available test terms. Mandatory condition details need evidence. Other unknowns stay visible, and alternatives state which constraint they miss. The current explanations describe each offer individually. A direct explanation of why the first offer outranks the second is the next improvement.

## 5. Full-stack delivery and UX

The deployed Next.js app has a Persian right-to-left chat-style guide, server-side filtering and ranking, SQLite storage, and a Docker build. Buyers can revise budget, priority, and defect tolerance from the verdict. The release review passed 77 automated tests, TypeScript checks, and the production build.

## 6. Practical use of AI

I used AI to prototype the flow, review source data, and iterate on code and tests. During the offer review, I checked conflicting or incomplete claims against seller pages and policies and held listings where the evidence remained inconclusive. The shipped ranker uses deterministic rules. The planned SubQ comparison remains unevaluated. [Offer review](torob-stock-laptop-source-audit.md#review-corrections-and-coverage) · [SubQ decision record](docs/adr/0002-evaluate-subq-ranking.md)

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
