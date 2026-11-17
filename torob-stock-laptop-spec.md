# Torob Stock Laptop Guide — First-Version Specification

## Product goal

A used-laptop buyer with a fixed budget should be able to find a laptop that fits their use case and defect tolerance across offers from several shops. The guide adds three things to a price list: questions about acceptable defects, comparisons of the specific devices' condition, and explanations of the result order.

## First-version scope

- Support four main use cases: everyday use and study, office work, gaming, and graphics work. The user chooses one per search.
- Collect data from at least three shops. The initial target is 40 eligible offers covering all four use cases and several budget ranges.
- Each result is a specific offer with a link to the seller. The buyer completes the purchase through the seller.
- Stock and used laptops are in scope. Record a laptop as open-box or refurbished only when the seller explicitly identifies it as such.
- The first version uses a wizard with structured controls. Free-form chat is outside its scope.

## User flow

1. Select one of the four use cases. For gaming or graphics work, ask which game or application the user primarily uses and what performance they expect.
2. Set the maximum device budget.
3. Choose the main priority among price, performance, and device condition.
4. For each relevant defect, choose Acceptable, Unacceptable, or Depends on severity. For the last option, ask a short follow-up about acceptable severity.
5. Review and edit the choice summary.
6. View up to five ranked offers. Each card shows the reason for the recommendation, a drawback, disclosed defects, undisclosed features, price, seller, source link, and last-checked time.
7. Change the budget, priority, or defect tolerance on the results page and see the updated order.

If fewer than five offers are suitable, display the actual number and ask which requirement the user wants to change.

## Offer data contract

| Group | Required fields |
| --- | --- |
| Source | Seller name, offer page URL, time observed |
| Sale | Device price, listed availability, shipping cost when disclosed |
| Device identity | Brand, model, extractable configuration, stock or used status |
| Performance | CPU model, RAM capacity, storage type and capacity, GPU model, display specifications when disclosed |
| Condition | Disclosed defects. Battery, display, chassis, keyboard, and port condition, test period, and return terms when disclosed |
| Evidence | Source text or section for extracted claims. Mark fields without evidence as “Not disclosed” |

A model title and its general specifications provide no evidence of the specific device's condition. An overall grade indicates the advertised cosmetic condition only. Eligibility requires evidence about the specific device's condition or clearly stated test and return terms.

## Eligibility and ranking

1. Exclude unavailable offers, offers without a valid price, offers above the budget cap, and offers without minimum evidence.
2. Exclude an offer if it has a defect the user marked Unacceptable. Also exclude it if a feature the user requires is undisclosed.
3. Apply simple technical minimums for a use case only when sufficient data and an inspectable rule exist. For gaming and graphics work, the game or application helps establish the requirements. Publish numerical FPS or render-time claims only with reliable test results.
4. Rank remaining offers on performance fit, device condition, completeness of evidence, and price. Use rules or SubQ after a comparative evaluation. Give the user's main priority greater weight. Tune weights and thresholds on real data and record them.
5. Show the five top offers. Multiple offers for the same model can appear because seller and device condition can differ.
6. Explain each rank using the recorded data and the rules actually applied.

## AI and SubQ evaluation

Use AI to extract information from inconsistent seller text. Record source evidence alongside extracted values and leave undisclosed conditions unknown. Mandatory filters and final ranking use inspectable rules under the original approach.

Test SubQ Snap on a sample of real Persian product descriptions to identify defects and features. Label the samples by hand and compare errors with the baseline. Use SubQ in the main demo flow only if it shows a measurable improvement and can run reliably.

## Acceptance criteria

- All four use-case flows work from the first step through the results page.
- Every displayed offer includes its source page and last-checked time.
- Suitable results exclude offers above budget, out of stock, or with an explicitly intolerable defect.
- Undisclosed features never appear as healthy or defect-free.
- When offers involve real trade-offs among price, performance, and condition, changing the main priority changes the order or the corresponding rank explanation.
- When too few offers qualify, show the actual number and a way to change a requirement.
- Recheck price and availability for the five offers in the recording scenario before recording the demo.
- The video lasts no more than five minutes and shows the problem, user flow, one real trade-off between price and device condition, the collection and ranking methods, and the data limitations.

## Questions for the source audit

- Final shop names and eligible offer counts for each shop
- Minimum performance rules for all four use cases and defensible numerical thresholds
- Ranking weights and evaluation examples
- Results of the SubQ test on Persian text

## Background sources

- [Torob challenge](https://jobs.torob.com/ai-product-engineer#role)
- [How Torob collects and merges offers](https://torob.com/pages/about-us/)
- [Torob safe shopping guide](https://torob.com/pages/safe-shopping-guide/)

## Demo data collection decision

Collect and save offers from selected shops in a batch crawl before the demo. The buyer flow uses stored offers and displays when they were last observed. Rerun the crawl before recording and recheck price and availability for offers in the demo scenario. Final shop selection depends on crawlability and data coverage.

Evaluate candidate shops for usable offer details and stable crawling. Aim to select at least three shops. If fewer qualify, report the gap and revisit scope with the product owner.

If a shop crawl fails, retain its last successfully collected offers with their original observation times and report the error. Show stale offers in the demo only after rechecking their price and availability before recording.

The demo has no fixed 24-hour freshness cutoff. Preserve observation times and recheck price and availability in the recording scenario before recording. Crawled data may be manually reviewed and corrected against the source page. Retain the evidence and source for each value.

## Demo architecture and design

- Build the interface and server in a single Next.js application with TypeScript. Store offers in SQLite. The application should run locally and be publicly deployable. Data persistence must work with the chosen public hosting setup.
- Run batch crawling and data review before the buyer uses the guide. The server uses stored offers to apply filters, rank results, and generate explanations. Keep external service credentials server-side.
- Build a clean, familiar, right-to-left Persian interface inspired by Torob, with its own product identity. Support the four use cases equally and make the interface usable on mobile and desktop.
- Focus defect questions on relevant differences between offers. Undisclosed features lower ranking confidence and remain unknown. After the user selects a main priority, keep the other two in balance.
- For gaming and graphics work, provide a searchable game or software list and selectable performance expectations. Explicitly label shipping cost as unknown when the seller provides no amount.

## Deployment and ranking decision (supersedes any rules-only ranking wording above)

- Deploy publicly on Runflare with persistent SQLite storage. Seed the database from a CSV at deployment without unintentionally overwriting reviewed data on subsequent deployments.
- Apply mandatory filters deterministically before ranking. Compare SubQ ranking against the rules baseline on representative scenarios for all four use cases, documenting criteria and results. Use SubQ only if it performs better; otherwise, or if unavailable, use the rules baseline. Explanations must be grounded in offer evidence.
