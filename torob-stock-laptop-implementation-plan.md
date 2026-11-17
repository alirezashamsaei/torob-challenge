# Torob Stock Laptop Guide — Prototype Implementation Plan

This plan turns the [implementation specification](torob-stock-laptop-spec.md) into deliverable tasks. Seller data and thresholds that still need checking remain provisional.

## 1. Audit and select sources

1. Start with the [initial source list](torob-stock-laptop-source-audit.md) and review several additional shops. Sample the listing and several offer pages for each shop. Check price, availability, specifications, the specific device's condition, test-period terms, and whether data can be collected reliably.
2. For each source, record the number of potential offers, the percentage of pages with condition evidence or specific test terms, and the use cases the offers can cover.
3. Select at least three sources that can collectively support the target of 40 eligible offers. If the target is out of reach, record the reasons and the actual count, then revisit the demo scope using the available data.

**Deliverable** — A table of selected sources, sample pages, and criteria for including or excluding each source.

## 2. Collect and normalize offers

1. Collect each offer from its own page and record the source URL and observation time. Keep price, availability, technical specifications, device condition, defects, and test terms in separate fields.
2. Normalize equivalent names while retaining the original text and evidence for each value. Mark absent data as “Not disclosed.” Keep cosmetic grades separate from technical condition.
3. For each offer, verify price and availability, confirm that the user can reach the seller, and check for minimum condition or test evidence. Record rejected offers and the reasons for rejection.
4. Measure coverage across all four use cases and several budget ranges using eligible offers.

**Deliverable** — An offer dataset with a unique ID for each offer, source evidence, observation timestamps, and a report on coverage and exclusions.

## 3. Extract seller text and evaluate SubQ

1. Sample real Persian seller descriptions. Label defect type, stated severity, component condition, and undisclosed fields by hand.
2. Build a simple extraction baseline and evaluate SubQ Snap on the same samples. Compare false positives, missed defects, cost, and operational reliability.
3. Use SubQ in the main demo flow only if it measurably improves on the baseline without introducing unsupported claims or missing important defects. Record the outcome even if it is negative.

**Deliverable** — A labeled dataset, comparison report, and documented choice of extraction tool. This plan originally calculated final offer scores independently of the decision model.

## 4. Define eligibility and ranking rules

1. Define simple technical minimums for all four use cases using fields that actually exist. For gaming and graphics work, provide selectable games or applications and expected performance levels. Make numerical performance claims only when reliable evidence supports them.
2. Apply mandatory filters first. Exclude unavailable offers, device prices above the cap, offers with insufficient evidence, intolerable defects, and offers with unknown values for mandatory features.
3. Score eligible offers on performance, condition, confidence in the data, and price. Each of the three main priorities should produce a clear change in weights. Make scoring and exclusion reasons visible.
4. Review the top five results by hand for several real scenarios. Check whether the order is defensible, whether the results disclose important defects, and whether switching the priority changes the outcome where genuine trade-offs exist. Record the reasons for tuning weights.

**Deliverable** — Versioned rules and weights, ranking examples for each use case, and a list of issues fixed.

## 5. Build the wizard and results page

1. Build structured controls for use case, budget, main priority, and defect tolerance. Show the severity question only when the user selects Depends on severity. For gaming and graphics work, use a searchable game or software list and fixed choices for expected performance.
2. Show a summary and let the user edit their answers before displaying results.
3. Show up to five offer cards with the reason for selection, a drawback, explicitly disclosed defects, undisclosed data, device price, separate shipping cost, seller, source link, and last-checked time.
4. Update the ranking in place when the user changes their budget, priority, or defect tolerance from the results page. For zero to four results, show the actual count and let the user change a requirement.

**Deliverable** — A complete demonstrable flow for all four use cases, including one scenario with too few results and one where the ranking changes.

## 6. Evaluate and record the application demo

1. Check the [specification's acceptance criteria](torob-stock-laptop-spec.md#acceptance-criteria) with real offers. Pay particular attention to the budget cap, intolerable defects, undisclosed condition, and link accuracy.
2. Recheck price and availability for the five offers in the recording scenario immediately before recording. Record the time of the check.
3. Make a video of no more than five minutes. Show the buyer's problem, wizard choices, five results and the reasons for their order, a real trade-off, the collection method, and the data limitations. Include only ranking and performance claims supported by evidence.

**Deliverable** — A usable prototype, a short evaluation report, the demo data, and the video.
