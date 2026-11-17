import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedOffers } from "../scripts/seed-offers.mjs";
import { readStoredOffers, evaluateStoredOffers, storedOfferForDisplay } from "../app/stored-offers.ts";
import { readJourney } from "../app/journey.ts";

test("reads the seeded store and retains a decision for every offer", () => {
  const dir = mkdtempSync(join(tmpdir(), "eligibility-"));
  try {
    const path = join(dir, "offers.sqlite");
    const db = new DatabaseSync(path);
    try { seedOffers(db, readFileSync("docs/stock-laptop-offer-sample.csv", "utf8")); } finally { db.close(); }
    const offers = readStoredOffers(path);
    const journey = readJourney(new URLSearchParams("usecase=office&budget=1000000000&defect.chassisScratch=acceptable"));
    const decisions = evaluateStoredOffers(offers, journey);
    assert.equal(decisions.length, 120);
    const eligible = decisions.find((decision) => decision.reasons.length === 0);
    const excluded = decisions.find((decision) => decision.reasons.length > 0);
    assert.ok(eligible);
    assert.ok(excluded);
    const card = storedOfferForDisplay(eligible.offer, journey);
    assert.equal(card.url, eligible.offer.offer_url);
    assert.equal(card.shippingToman, null);
    assert.equal(card.lastCheckedAt, eligible.offer.observed_on_tehran);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
