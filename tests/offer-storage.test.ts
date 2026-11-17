import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { seedOffers, parseCsv } from "../scripts/seed-offers.mjs";

test("seed retains source evidence and never overwrites existing offers", () => {
  const db = new DatabaseSync(":memory:");
  try {
    const csv = readFileSync("docs/stock-laptop-offer-sample.csv", "utf8");
    assert.deepEqual(seedOffers(db, csv), { inserted: 120, skipped: 0 });
    const original = db.prepare("SELECT * FROM offers ORDER BY rowid LIMIT 1").get()!;
    assert.equal(original.evidence_url, "https://itjonoob.com/product-category/laptop/");
    assert.equal(original.observed_on_tehran, "2026-11-17");
    assert.equal(original.test_or_return_terms, "Not disclosed");
    assert.equal(original.image_url, "");
    db.prepare("UPDATE offers SET notes = ? WHERE offer_url = ?").run("reviewed", original.offer_url!);
    assert.deepEqual(seedOffers(db, csv), { inserted: 0, skipped: 120 });
    assert.equal(db.prepare("SELECT notes FROM offers WHERE offer_url = ?").get(original.offer_url!)!.notes, "reviewed");
  } finally { db.close(); }
});

test("CSV parsing supports quoted commas, quotes and newlines and rejects malformed fields", () => {
  assert.deepEqual(parseCsv('a,b\r\n"hello,\nworld","say ""hi"""\r\n'), [["a", "b"], ["hello,\nworld", 'say "hi"']]);
  assert.throws(() => parseCsv('a,"unfinished'));
  assert.throws(() => parseCsv('a,"bad"tail'));
});

test("invalid and duplicate rows do not partially seed a database", () => {
  const db = new DatabaseSync(":memory:");
  try {
    const csv = readFileSync("docs/stock-laptop-offer-sample.csv", "utf8");
    const lines = csv.trimEnd().split(/\r?\n/);
    assert.throws(() => seedOffers(db, `${lines[0]}\n${lines[1]}\n${lines[1]}\n`), /Duplicate/);
    assert.throws(() => seedOffers(db, `${lines[0]}\n${lines[1]}\ninvalid\n`), /Invalid/);
    assert.equal(db.prepare("SELECT count(*) AS count FROM sqlite_master WHERE name = 'offers'").get()!.count, 0);
  } finally { db.close(); }
});
