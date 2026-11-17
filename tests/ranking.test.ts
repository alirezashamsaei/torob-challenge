import { test } from "node:test";
import assert from "node:assert/strict";
import { rankEligibleOffers, rankingVersion } from "../app/ranking.ts";
import { makeOffer } from "./offer-fixture.ts";
import { readJourney } from "../app/journey.ts";

const journey = (priority: "price" | "performance" | "condition") => readJourney(new URLSearchParams(`usecase=everyday&budget=100000000&priority=${priority}&defect.chassisScratch=acceptable`));

test("rules-v1 changes ordering with the selected priority across real trade-offs", () => {
  const budget = makeOffer({ id: "budget", priceToman: 20_000_000, configuration: { cpu: "Core i3-6100U", memory: "4 GB RAM" }, undisclosedFeatures: ["battery", "display", "chassis"], testTerms: undefined });
  const balanced = makeOffer({ id: "balanced", priceToman: 60_000_000, configuration: { cpu: "Core i5-1235U", memory: "16 GB RAM", graphics: "RTX 3050" }, undisclosedFeatures: ["battery"], conditionDisclosure: "No chassis scratches", testTerms: "7-day test" });
  const options = [budget, balanced];

  assert.equal(rankingVersion, "rules-v1");
  assert.equal(rankEligibleOffers(options, journey("price"))[0].offer.id, "budget");
  assert.equal(rankEligibleOffers(options, journey("performance"))[0].offer.id, "balanced");
  assert.equal(rankEligibleOffers(options, journey("condition"))[0].offer.id, "balanced");
});

test("unknown features lower evidence score and are described as unknown", () => {
  const known = makeOffer({ id: "known", undisclosedFeatures: [], conditionDisclosure: "No chassis scratches", testTerms: "7-day test" });
  const unknown = makeOffer({ id: "unknown", undisclosedFeatures: ["battery", "display", "chassis"], conditionDisclosure: undefined, testTerms: undefined });
  const ranked = rankEligibleOffers([known, unknown], journey("condition"));
  const unknownResult = ranked.find((item) => item.offer.id === "unknown")!;

  assert.ok(unknownResult.evidence < ranked[0].evidence);
  assert.match(unknownResult.tradeOff, /نامشخص/);
  assert.match(unknownResult.explanation, /اعلام نشده/);
});

test("a disclosed defect never raises condition score as positive health evidence", () => {
  const undisclosed = makeOffer({ id: "unknown-condition", conditionDisclosure: undefined, testTerms: undefined });
  const defect = makeOffer({ id: "defect", conditionDisclosure: "Chassis scratches disclosed", testTerms: undefined });
  const scores = rankEligibleOffers([undisclosed, defect], journey("condition"));
  assert.ok(scores.find((item) => item.offer.id === "defect")!.condition < scores.find((item) => item.offer.id === "unknown-condition")!.condition);
});

test("four-digit Intel model numbers preserve 10th-plus generation prefixes", () => {
  const newer = makeOffer({ id: "newer", configuration: { cpu: "Core i5-1235U", memory: "8 GB RAM" } });
  const older = makeOffer({ id: "older", configuration: { cpu: "Core i5-8250U", memory: "8 GB RAM" } });
  const score = (offer: typeof newer) => rankEligibleOffers([offer], journey("performance"))[0].performance;
  assert.ok(score(newer) > score(older));
});

test("equal scores have a stable price and id tie break", () => {
  const offers = [makeOffer({ id: "z" }), makeOffer({ id: "a" })];
  assert.deepEqual(rankEligibleOffers(offers, journey("price")).map((item) => item.offer.id), ["a", "z"]);
});
