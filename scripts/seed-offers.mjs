import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const columns = ["seller", "model", "offer_url", "evidence_url", "observed_on_tehran", "price_toman_as_listed", "primary_use_case", "seller_condition_type", "cosmetic_grade", "battery_evidence", "disclosed_defects", "test_or_return_terms", "availability_evidence", "configuration_evidence", "screening_status", "observation_batch", "notes", "image_url"];

// Preserve CSV evidence verbatim, including explicit “Not disclosed” values.
export function parseCsv(input) {
  const rows = [];
  let row = [], field = "", quoted = false, closed = false;
  input = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"' && field === "" && !closed) quoted = true;
    else if (c === ",") { row.push(field); field = ""; closed = false; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = ""; closed = false;
    } else if (closed || c === '"') throw new Error(`Invalid CSV at character ${i + 1}`);
    else field += c;
  }
  if (quoted) throw new Error("Unterminated quoted CSV field");
  if (row.length || field || closed) { row.push(field); rows.push(row); }
  return rows;
}

export function seedOffers(db, csv) {
  const rows = parseCsv(csv);
  const header = rows.shift();
  if (!header || header.length !== columns.length || columns.some((name, i) => header[i] !== name)) {
    throw new Error("Unexpected offer CSV header");
  }
  const seen = new Set();
  for (const [index, row] of rows.entries()) {
    if (row.length !== columns.length || !row[0].trim() || !row[1].trim() || !row[2].trim() || !row[3].trim() || !/^\d{4}-\d{2}-\d{2}$/.test(row[4]) || !/^[1-9]\d*$/.test(row[5]) || !Number.isSafeInteger(Number(row[5]))) {
      throw new Error(`Invalid offer CSV row ${index + 2}`);
    }
    if (seen.has(row[2])) throw new Error(`Duplicate offer URL in CSV row ${index + 2}`);
    seen.add(row[2]);
  }
  db.exec(`CREATE TABLE IF NOT EXISTS offers (
    offer_url TEXT PRIMARY KEY NOT NULL,
    seller TEXT NOT NULL, model TEXT NOT NULL, evidence_url TEXT NOT NULL,
    observed_on_tehran TEXT NOT NULL, price_toman_as_listed INTEGER NOT NULL,
    primary_use_case TEXT NOT NULL, seller_condition_type TEXT NOT NULL,
    cosmetic_grade TEXT NOT NULL, battery_evidence TEXT NOT NULL,
    disclosed_defects TEXT NOT NULL, test_or_return_terms TEXT NOT NULL,
    availability_evidence TEXT NOT NULL, configuration_evidence TEXT NOT NULL,
    screening_status TEXT NOT NULL, observation_batch TEXT NOT NULL,
    notes TEXT NOT NULL, image_url TEXT NOT NULL
  ) STRICT`);
  const insert = db.prepare(`INSERT INTO offers (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")}) ON CONFLICT(offer_url) DO NOTHING`);
  let inserted = 0;
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const row of rows) {
      const values = [...row];
      values[5] = Number(values[5]);
      inserted += Number(insert.run(...values).changes);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { inserted, skipped: rows.length - inserted };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const dbPath = resolve(process.env.OFFERS_DB_PATH || "data/offers.sqlite");
  const csvPath = resolve(process.argv[2] || "docs/stock-laptop-offer-sample.csv");
  const csv = readFileSync(csvPath, "utf8");
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  try {
    const result = seedOffers(db, csv);
    console.log(`Offers seeded: ${result.inserted} inserted, ${result.skipped} already present.`);
  } finally { db.close(); }
}
