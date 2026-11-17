# Torob Stock Laptop Guide — Initial Product Brief

## Problem

Used-laptop buyers must choose among devices that can differ physically and technically even when they share a model name. A price alone provides too little information to compare them. The guide should turn a buyer's needs and budget into options they can evaluate.

## Experience agreed so far

1. The user selects a use case and maximum budget through a wizard with structured controls. The first version covers everyday use and study, office work, gaming, and graphics work.
2. The guide asks which matters most to the user: price, performance, or device condition.
3. The guide asks, “Which defects can you live with?” and clarifies important ambiguities as needed. If the user says it depends on severity, a short follow-up asks what severity they can accept.
4. The guide displays five specific offers from sellers in ranked order, explaining the order and one drawback for each offer. Two devices of the same model in different condition are separate offers and can both appear in the top five.
5. The user follows the selected offer to the seller's page or purchase flow and buys from the seller.
6. From the results page, the user can change the budget, main priority, and defect tolerance and see the updated order.

## Data

Offer data comes from several websites that sell stock laptops. Each offer's price, availability, specifications, and condition must be traceable to its source page. The shops, collection method, and update schedule were still open at the time of this brief.

The initial scope covers used and stock laptops from specialist sellers. A device is marked refurbished or open-box only when the seller explicitly says so. The stock label alone leaves the device's condition undetermined.

## Agreed matching rules

- The maximum budget is a hard limit. Offers above it are excluded from suitable results.
- For each relevant defect, the user can select Acceptable, Unacceptable, or Depends on severity. Examples include chassis scratches, small dents, a weakened battery, a defective pixel, and a broken port.
- Defect questions focus on differences among relevant offers.
- An undisclosed feature is displayed as “Not disclosed” and lowers the offer's rank. If the feature is mandatory for the user, an offer with insufficient information is ineligible.
- If fewer than five suitable offers are available, show the actual number and ask which requirement the user would consider changing.
- Define simple, inspectable technical minimums for each use case as long as they keep the first version manageable. Exclude offers that fail a hard minimum and account for higher performance in ranking.
- After applying mandatory filters, rank by fit for the use case, device condition, confidence in the seller's information, and price. The user's main priority influences the order.
- The user chooses one main priority among price, performance, and condition. The ranking keeps the other two in balance.
- Break device condition down into the battery, display, chassis, keyboard, ports, and test-period terms. A clean exterior provides evidence about cosmetic condition only.
- A page giving only the model, general specifications, and price qualifies for the top five only if it also provides information about the specific device's condition or clearly states applicable test and return terms.
- Display when each offer was last checked. Recheck the price and availability of the five selected offers before recording the demo.
- For ambiguous gaming or graphics requests, ask for the game or software and the expected level of performance. Make numerical performance claims, such as FPS, only with reliable test data.
- A seller's overall grade describes the advertised cosmetic condition only. The battery, display, and other components remain “Not disclosed” without evidence for the specific offer.
- Apply the budget cap to the device price. Show shipping separately and mark it unknown when the seller provides no amount.
- Collect user answers through the wizard. Evaluate AI for extracting information from seller text. Filter incompatible offers and calculate rank using inspectable rules.
- The user chooses one primary use case per search.
- An explicitly disclosed functional defect can appear in the results if the user accepts it. Show the defect clearly on the result card.
- The demo target is at least 40 eligible offers from at least three shops, with several options across budget ranges for each of the four use cases. Revisit the target after the source audit if needed.

## Relationship to the Torob challenge

The result should feel like a search and comparison experience inspired by Torob, with its own product direction. The application demo must present the user problem, the product, and its key decisions in a video of no more than five minutes. The example technical workflow on the challenge page covers gathering offers, normalizing inconsistent data, ranking against user needs, and explaining the best choice.

## Questions to resolve with real data

- Select the final shops and count eligible offers from each.
- Set defect severity thresholds based on sellers' wording and real examples.
- Define simple technical minimums for the four use cases and check whether real data supports them.
- Tune ranking weights and evaluate them on real scenarios.

## First-version interface

The first version uses a wizard with structured controls for use case, budget, main priority, and defect tolerance. A natural-language chat field is outside this version's scope. The severity question appears only after the user selects Depends on severity. Users can review and edit a summary before seeing results. Budget, priority, and defect tolerance also remain editable on the results page.

## Evaluating the SubQ decision model

SubQ Snap 1.2 returns structured yes/no decisions, selections, and scores. The initial evaluation uses real seller descriptions to test detection of defects and features. SubQ enters the main demo flow only if it measurably improves on the baseline. Under the original decision recorded in this brief, budget, other mandatory requirements, and final ranking all use inspectable rules.

[SubQ Decisions API documentation](https://docs.subq.ai/endpoints/decisions-api/)

## Sources

- [Torob AI Product Engineer challenge](https://jobs.torob.com/ai-product-engineer#role)
- [About Torob](https://torob.com/pages/about-us/)
- [Torob safe shopping guide](https://torob.com/pages/safe-shopping-guide/)
