# Evaluate SubQ for ranking eligible offers

## Status

Accepted; amends ADR 0001.

## Context

A rules-based ranking is inspectable, while a decision model might better compare trade-offs among real offers. Its superiority cannot be assumed before evaluation.

## Decision

Apply mandatory filters, including budget, availability, and intolerable defects, deterministically before ranking. Compare SubQ ranking against a rules-based baseline using representative scenarios for all four use cases, and record criteria and results. Use SubQ only if it performs better; otherwise, or if unavailable, use the rules baseline. Explanations must be grounded in offer data and evidence.

## Consequences

The demo needs comparative evaluation and a fallback. The evaluation may conclude that SubQ should not be used.
