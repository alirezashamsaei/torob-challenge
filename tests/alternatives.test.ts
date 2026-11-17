import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { seedOffers } from "../scripts/seed-offers.mjs";
import { evaluateStoredOffers, nearbyAlternatives } from "../app/stored-offers.ts";
import { readJourney } from "../app/journey.ts";
import { gameCatalog, softwareCatalog } from "../app/requirements.ts";

test("alternatives disclose compromises and never include unverified offers", () => {
  const db = new DatabaseSync(":memory:");
  try {
    seedOffers(db, readFileSync("docs/stock-laptop-offer-sample.csv", "utf8"));
    const offers = db.prepare("SELECT * FROM offers").all() as Parameters<typeof evaluateStoredOffers>[0];
    for (const usecase of ["everyday", "office", "gaming", "graphics"]) {
      const requirement = usecase === "gaming" ? "&requirement=cs2&expectation=basic" : usecase === "graphics" ? "&requirement=photoshop&expectation=basic" : "";
      const journey = readJourney(new URLSearchParams(`usecase=${usecase}${requirement}&budget=1&defect.chassisScratch=unacceptable`));
      const decisions = evaluateStoredOffers(offers, journey);
      const alternatives = nearbyAlternatives(decisions, journey, 5);
      assert.equal(alternatives.length, 5, usecase);
      for (const alternative of alternatives) {
        const reasons = decisions.find(({ offer }) => offer.offer_url === alternative.id)!.reasons;
        assert.ok(reasons.every((reason) => ["over_budget", "defect_unknown", "intolerable_defect", "technical_minimum"].includes(reason)));
        assert.match(alternative.tradeOff, /بودجه/);
      }
    }
    for (const [usecase, catalog] of [["gaming", gameCatalog], ["graphics", softwareCatalog]] as const) {
      for (const requirement of catalog) for (const expectation of ["basic", "balanced", "high"]) {
        const journey = readJourney(new URLSearchParams(`usecase=${usecase}&requirement=${requirement.id}&expectation=${expectation}&budget=1&defect.chassisScratch=unacceptable`));
        const alternatives = nearbyAlternatives(evaluateStoredOffers(offers, journey), journey, 5);
        assert.equal(alternatives.length, 5, `${usecase}/${requirement.id}/${expectation}`);
      }
    }
  } finally { db.close(); }
});
