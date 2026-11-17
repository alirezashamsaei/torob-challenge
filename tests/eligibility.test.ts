import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateStoredOffer } from "../app/eligibility.ts";
import { readJourney } from "../app/journey.ts";

const journey = readJourney(new URLSearchParams("usecase=office&budget=50000000&priority=price&defect.chassisScratch=acceptable"));
const offer = {
  offer_url: "https://example.com/1", seller: "Shop", model: "Laptop", evidence_url: "https://example.com/1", observed_on_tehran: "2026-11-17", price_toman_as_listed: 50000000,
  primary_use_case: "Office work", seller_condition_type: "used / stock", cosmetic_grade: "A", battery_evidence: "Not disclosed", disclosed_defects: "Not disclosed", test_or_return_terms: "7-day returns", availability_evidence: "Active purchase option", configuration_evidence: "i5-8250U / 8 GB / 256 GB SSD / Intel UHD 620", screening_status: "Provisionally eligible", observation_batch: "review", notes: "", image_url: ""
};

test("stored offer at device budget qualifies despite unknown shipping", () => {
  assert.deepEqual(evaluateStoredOffer(offer, journey), []);
});

test("records all independent exclusions and never assumes unknown mandatory facts", () => {
  assert.deepEqual(evaluateStoredOffer({ ...offer, availability_evidence: "Unconfirmed", price_toman_as_listed: 50000001, cosmetic_grade: "Not disclosed", test_or_return_terms: "Not disclosed", configuration_evidence: "See source page" }, journey), ["availability_unknown", "over_budget", "insufficient_evidence", "technical_unknown"]);
});

test("unavailable, invalid-price, unknown defect and hardware decisions fail closed", () => {
  assert.deepEqual(evaluateStoredOffer({ ...offer, availability_evidence: "Out of stock", price_toman_as_listed: 0, configuration_evidence: "i5-8250U / 4 GB / 256 GB SSD" }, { ...journey, defects: { chassisScratch: { tolerance: "unacceptable" } } }), ["unavailable", "invalid_price", "technical_minimum", "defect_unknown"]);
  assert.ok(evaluateStoredOffer({ ...offer, disclosed_defects: "Surface and deep scratches" }, { ...journey, defects: { chassisScratch: { tolerance: "unacceptable" } } }).includes("intolerable_defect"));
});

test("selected game and expected performance affect the technical floor", () => {
  const game = { ...offer, primary_use_case: "Gaming", configuration_evidence: "i5-12500H / 16 GB / 512 GB SSD / RTX 3050" };
  const basic = readJourney(new URLSearchParams("usecase=gaming&requirement=valorant&expectation=basic&budget=50000000&defect.chassisScratch=acceptable"));
  assert.deepEqual(evaluateStoredOffer(game, basic), []);
  assert.ok(evaluateStoredOffer(game, { ...basic, requirement: "cyberpunk", expectation: "high" }).includes("technical_minimum"));
  assert.ok(evaluateStoredOffer({ ...game, configuration_evidence: "i5-12500H / 16 GB / 512 GB SSD / unknown GPU" }, basic).includes("technical_unknown"));
});

test("game choice matters even at the same expectation", () => {
  const game = { ...offer, primary_use_case: "Gaming", configuration_evidence: "i5-12500H / 16 GB / 512 GB SSD / RTX 3050" };
  const basic = readJourney(new URLSearchParams("usecase=gaming&requirement=valorant&expectation=basic&budget=50000000&defect.chassisScratch=acceptable"));
  assert.deepEqual(evaluateStoredOffer(game, basic), []);
  assert.ok(evaluateStoredOffer(game, { ...basic, requirement: "cyberpunk" }).includes("technical_minimum"));
});

test("review status, seller evidence and severity are mandatory", () => {
  assert.ok(evaluateStoredOffer({ ...offer, screening_status: "Needs offer-page verification" }, journey).includes("insufficient_evidence"));
  assert.ok(evaluateStoredOffer({ ...offer, evidence_url: "https://example.com/category" }, journey).includes("insufficient_evidence"));
  const minorOnly = { ...journey, defects: { chassisScratch: { tolerance: "depends" as const, severity: "minor" as const } } };
  assert.deepEqual(evaluateStoredOffer({ ...offer, disclosed_defects: "Small case scratches" }, minorOnly), []);
  assert.ok(evaluateStoredOffer({ ...offer, disclosed_defects: "Surface scratches; paint wear" }, minorOnly).includes("intolerable_defect"));
});

test("graphics checks explicitly disclosed workstation GPUs and light application needs", () => {
  const graphics = readJourney(new URLSearchParams("usecase=graphics&requirement=blender&expectation=basic&budget=50000000&defect.chassisScratch=acceptable"));
  const workstation = { ...offer, primary_use_case: "Graphics work", configuration_evidence: "i7-12800H / 16 GB / 512 GB SSD / RTX A1000" };
  assert.deepEqual(evaluateStoredOffer(workstation, graphics), []);
  const integrated = { ...workstation, configuration_evidence: "i5-1145G7 / 8 GB / 256 GB SSD / Intel Iris Xe" };
  assert.deepEqual(evaluateStoredOffer(integrated, { ...graphics, requirement: "figma" }), []);
  assert.ok(evaluateStoredOffer(integrated, graphics).includes("technical_minimum"));
});
