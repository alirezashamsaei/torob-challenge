import { test } from "node:test";
import assert from "node:assert/strict";

import {
  catalogFor,
  findRequirement,
  gameCatalog,
  searchRequirements,
  softwareCatalog,
} from "../app/requirements.ts";

const ids = (catalog: readonly { id: string }[]) => catalog.map((item) => item.id);

test("gaming searches games and graphics searches software", () => {
  assert.equal(catalogFor("gaming"), gameCatalog);
  assert.equal(catalogFor("graphics"), softwareCatalog);
  assert.equal(catalogFor("office"), undefined);
  assert.equal(catalogFor(undefined), undefined);
});

test("a requirement only resolves inside its own use case", () => {
  assert.equal(findRequirement("gaming", "cs2")?.id, "cs2");
  assert.equal(findRequirement("graphics", "cs2"), undefined);
  assert.equal(findRequirement("graphics", "photoshop")?.id, "photoshop");
  assert.equal(findRequirement("office", "photoshop"), undefined);
});

test("search matches the Persian name, the Latin name and the id", () => {
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "فتوشاپ")), ["photoshop"]);
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "PHOTOSHOP")), ["photoshop"]);
  assert.deepEqual(ids(searchRequirements(gameCatalog, "Counter-Strike")), ["cs2"]);
  assert.deepEqual(ids(searchRequirements(gameCatalog, "cyberpunk")), ["cyberpunk"]);
});

test("search ignores case, Arabic letter variants and zero-width joiners", () => {
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "كورل")), ["coreldraw"]);
  assert.deepEqual(ids(searchRequirements(gameCatalog, "جی تی ای")), ["gta5"]);
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "تری دی اس")), ["3dsmax"]);
});

test("every search token must match, so extra words narrow the list", () => {
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "adobe photo")), ["photoshop"]);
  assert.deepEqual(ids(searchRequirements(softwareCatalog, "adobe")), ["photoshop", "illustrator", "premiere", "aftereffects", "lightroom", "indesign"]);
});

test("a blank search keeps the full catalog and an unknown search finds nothing", () => {
  assert.equal(searchRequirements(gameCatalog, "").length, gameCatalog.length);
  assert.equal(searchRequirements(gameCatalog, "   ").length, gameCatalog.length);
  assert.deepEqual(searchRequirements(gameCatalog, "nothing like this"), []);
});

test("the representative catalogs hold unique, labelled entries", () => {
  for (const catalog of [gameCatalog, softwareCatalog]) {
    assert.ok(catalog.length >= 15);
    assert.equal(new Set(ids(catalog)).size, catalog.length);
    for (const item of catalog) {
      assert.ok(item.label.length > 0);
      assert.ok(item.latin.length > 0);
    }
  }
});
