import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { seedOffers } from "../scripts/seed-offers.mjs";
import { evaluateStoredOffers, nearbyAlternatives, storedOfferForDisplay, withDemoScratch } from "../app/stored-offers.ts";
import { readJourney } from "../app/journey.ts";
import { gameCatalog, softwareCatalog } from "../app/requirements.ts";

test("at 60 million, reviewed offers that only need a chassis check come before other compromises", () => {
  const db = new DatabaseSync(":memory:");
  try {
    seedOffers(db, readFileSync("docs/stock-laptop-offer-sample.csv", "utf8"));
    const offers = db.prepare("SELECT * FROM offers").all() as Parameters<typeof evaluateStoredOffers>[0];
    for (const usecase of ["office", "everyday"]) {
      const journey = readJourney(new URLSearchParams(`usecase=${usecase}&budget=60000000&priority=price&defect.chassisScratch=unacceptable`));
      const decisions = evaluateStoredOffers(offers, journey);
      const alternatives = nearbyAlternatives(decisions, journey, 5);
      assert.deepEqual(alternatives.slice(0, 3).map((offer) => offer.priceToman), [54_500_000, 55_790_000, 57_970_000]);
      for (const offer of alternatives.slice(0, 3)) {
        assert.deepEqual(decisions.find((decision) => decision.offer.offer_url === offer.id)?.reasons, ["defect_unknown"]);
        assert.match(offer.tradeOff, /از فروشنده/);
      }
    }
  } finally { db.close(); }
});

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

test("demo fills every unknown scratch status without replacing seller evidence", () => {
  const db = new DatabaseSync(":memory:");
  try {
    seedOffers(db, readFileSync("docs/stock-laptop-offer-sample.csv", "utf8"));
    const offers = db.prepare("SELECT * FROM offers").all() as Parameters<typeof evaluateStoredOffers>[0];
    const journey = readJourney(new URLSearchParams("usecase=office&budget=60000000&priority=price&defect.chassisScratch=unacceptable"));
    const original = evaluateStoredOffers(offers, journey);
    const demo = evaluateStoredOffers(offers.map(withDemoScratch), journey);
    for (const [index, { offer, reasons }] of demo.entries()) {
      const before = original[index];
      assert.ok(!reasons.includes("defect_unknown"));
      assert.deepEqual(reasons.filter(r => r !== "intolerable_defect"), before.reasons.filter(r => r !== "defect_unknown" && r !== "intolerable_defect"));
      if (before.reasons.includes("defect_unknown")) {
        assert.equal(offer.disclosed_defects, before.offer.disclosed_defects);
        assert.equal(offer.demo_chassis_scratch, withDemoScratch(before.offer).demo_chassis_scratch);
        assert.match(storedOfferForDisplay(offer, journey).conditionDisclosure ?? "", /شبیه‌سازی دمو/);
      } else {
        assert.equal(offer, before.offer);
      }
    }
    assert.equal(demo.filter(({ reasons }) => !reasons.length).length, 3);
    assert.equal(original.filter(({ reasons }) => !reasons.length).length, 0);
  } finally { db.close(); }
});
