# Eligible offer ranking baseline

## Version

`rules-v1` is an inspectable, deterministic fallback. Mandatory offer eligibility is evaluated first; this ranker only sorts offers that passed those checks. Scores are comparative heuristics, not benchmark results or predictions of frame rates or render times.

## Scoring

Price is normalized within the eligible set (cheapest = 100, most expensive = 0). Performance is a coarse disclosed-specification proxy: CPU family/generation, listed RAM and graphics class. Condition starts neutral, rises only for explicit positive condition statements and disclosed test terms, and falls for disclosed defects. An unspecified condition stays neutral. Evidence completeness is the share of the five listed configuration/condition/test fields that are known relative to those fields plus undisclosed features.

The selected priority receives 60% of the weighted price, performance and condition score; the other two each receive 20%. Evidence completeness adds 10% to the total. Equal totals sort by lower device price, then offer ID. Shipping is excluded because source amounts are not available in the current sample.

## Representative scenario coverage

| Use case | Representative comparison | Expected rules behavior |
| --- | --- | --- |
| Everyday and study | Budget older CPU / 4 GB RAM vs. newer CPU / 16 GB RAM with test terms | Price priority can favor the cheaper device; performance and condition priorities favor stronger disclosed specifications and evidence. |
| Office work | Lower-priced Core i5-8250U / 8 GB vs. Core i7-10610U / 8 GB at a higher price | Price favors the lower price; performance favors the newer disclosed CPU. No office speed claim is made. |
| Gaming | RTX 2050 / 16 GB vs. RTX 3050 / 16 GB at a higher price | Performance favors the offer with the stronger disclosed GPU class; price favors the cheaper one. No FPS claims are made. |
| Graphics work | Radeon R9 M360 vs. Quadro T1000 with 16 GB RAM at a higher price | Performance favors the higher disclosed graphics class; condition priority still reflects evidence and disclosed condition, not the GPU. No render-time claim is made. |

These are rule walkthroughs from representative data, not a measured comparison against SubQ. SubQ was not used because no evaluated result establishing superiority is available. Eligibility rules remain the authority for mandatory filters.

## Limits

The proxy does not model exact CPU/GPU benchmarks, thermals, battery health, workload-specific requirements or seller reliability. Unknown fields reduce evidence confidence and remain explicitly unknown; they do not count as healthy. Review and tune the rules against labeled offers before presenting them as validated recommendations.
