import { DatabaseSync } from "node:sqlite";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Apply only to an unchanged source snapshot, preserving subsequent manual reviews.
export function applyOfferReview(db, corrections) {
  const read = db.prepare("SELECT * FROM offers WHERE offer_url = ?");
  const update = db.prepare("UPDATE offers SET screening_status = ?, configuration_evidence = ?, notes = ? WHERE offer_url = ?");
  const result = { updated: 0, alreadyApplied: 0, missing: 0, conflicts: [] };

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const { previous, alsoAcceptPrevious, changes } of corrections) {
      const current = read.get(previous.offer_url);
      if (!current) {
        result.missing++;
        continue;
      }
      const reviewed = { ...previous, ...changes };
      const matches = (expected) => Object.entries(expected).every(([key, value]) => current[key] === value);
      if (matches(reviewed)) {
        result.alreadyApplied++;
      } else if (matches(previous) || (alsoAcceptPrevious && matches(alsoAcceptPrevious))) {
        update.run(reviewed.screening_status, reviewed.configuration_evidence, reviewed.notes, reviewed.offer_url);
        result.updated++;
      } else {
        result.conflicts.push(previous.offer_url);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const corrections = JSON.parse(readFileSync(new URL("../docs/offer-review-corrections.json", import.meta.url), "utf8"));
  const path = resolve(process.env.OFFERS_DB_PATH || "data/offers.sqlite");
  if (!existsSync(path)) throw new Error(`Offer store does not exist: ${path}`);
  const db = new DatabaseSync(path);
  try {
    const result = applyOfferReview(db, corrections);
    console.log(JSON.stringify(result, null, 2));
    if ((result.conflicts.length || result.missing) && !process.argv.includes("--allow-conflicts")) process.exitCode = 1;
  } finally {
    db.close();
  }
}
