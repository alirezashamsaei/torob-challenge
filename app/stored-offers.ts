import { DatabaseSync } from "node:sqlite";
import { evaluateStoredOffer, type ExclusionReason, type StoredOffer } from "./eligibility";
import type { Journey } from "./journey";
import type { Offer } from "./offers";

export type EligibilityDecision = { offer: StoredOffer; reasons: ExclusionReason[] };

/** Offers worth asking about before condition tolerance is known. */
export function defectCandidates(offers: readonly StoredOffer[], journey: Journey): StoredOffer[] {
  if (!journey.useCase || journey.budget === undefined) return [];
  const useCaseWords: Record<NonNullable<Journey["useCase"]>, string[]> = {
    everyday: ["everyday", "study"],
    office: ["office"],
    gaming: ["gaming"],
    graphics: ["graphics"],
  };
  return offers.filter((offer) =>
    useCaseWords[journey.useCase!].some((word) => offer.primary_use_case.toLowerCase().includes(word)) &&
    Number.isSafeInteger(offer.price_toman_as_listed) && offer.price_toman_as_listed <= journey.budget! &&
    /scratch|scratches|خراش/i.test(offer.disclosed_defects || ""),
  );
}

/** Retain a decision for every input row, including all applicable exclusion reasons. */
export function evaluateStoredOffers(offers: readonly StoredOffer[], journey: Journey): EligibilityDecision[] {
  return offers.map((offer) => ({ offer, reasons: evaluateStoredOffer(offer, journey) }));
}

/** Open the configured staging store read-only; missing or broken stores are errors. */
export function readStoredOffers(path = process.env.OFFERS_DB_PATH || "data/offers.sqlite"): StoredOffer[] {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    return db.prepare("SELECT * FROM offers ORDER BY rowid").all() as StoredOffer[];
  } finally {
    db.close();
  }
}

/** Map reviewed source fields for display without inventing device condition or shipping. */
export function storedOfferForDisplay(row: StoredOffer, journey: Journey): Offer {
  const parts = row.configuration_evidence.split("/").map((part) => part.trim());
  const hasDefects = row.disclosed_defects && !/^not disclosed$/i.test(row.disclosed_defects.trim());
  const hasTerms = row.test_or_return_terms && !/^not disclosed$/i.test(row.test_or_return_terms.trim());
  const unknown = ["وضعیت نمایشگر", "وضعیت صفحه‌کلید و درگاه‌ها"];
  if (!row.battery_evidence || /^not disclosed$/i.test(row.battery_evidence.trim())) unknown.push("وضعیت باتری");
  if (!hasDefects) unknown.push("ایرادهای دستگاه");
  return {
    id: row.offer_url, model: row.model, seller: row.seller, url: row.offer_url,
    lastCheckedAt: row.observed_on_tehran, priceToman: row.price_toman_as_listed,
    shippingToman: null, useCases: journey.useCase ? [journey.useCase] : [],
    configuration: { cpu: parts[0] || "نامشخص", memory: parts.slice(1).join(" / ") || "نامشخص" },
    defects: [], conditionDisclosure: hasDefects ? row.disclosed_defects : "اعلام نشده",
    undisclosedFeatures: unknown,
    testTerms: hasTerms ? row.test_or_return_terms : undefined,
    explanation: "قیمت دستگاه در محدودهٔ بودجه است و اطلاعات ثبت‌شده حداقل شرایط انتخاب را دارد.",
    tradeOff: "برای جزئیات وضعیت و شرایط، اطلاعات فروشنده را بررسی کنید.",
  };
}
