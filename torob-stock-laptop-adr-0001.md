# Final ranking with inspectable rules

Used-laptop offers are ranked by budget, use case, defect tolerance, and the user's main priority. We decided to evaluate AI for extracting information from inconsistent seller text and use documented rules to filter incompatible offers and calculate the final ranking. This boundary lets us explain each exclusion and rank using source evidence. Using a decision model directly for final ranking would make the outcome more dependent on model behavior and ongoing testing. SubQ could help identify features and defects after evaluation on real Persian seller text.

Update: The final-ranking decision is amended by [ADR 0002](docs/adr/0002-evaluate-subq-ranking.md). Mandatory filters remain deterministic.
