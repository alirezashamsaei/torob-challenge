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

/** Budget choices reflect currently eligible hardware, before condition preferences are known. */
export function suggestedBudgets(offers: readonly StoredOffer[], journey: Journey): number[] {
  const exploratoryJourney: Journey = {
    ...journey, budget: Number.MAX_SAFE_INTEGER,
    defects: { ...journey.defects, chassisScratch: { tolerance: "acceptable" } },
  };
  const prices = evaluateStoredOffers(offers, exploratoryJourney)
    .filter(({ reasons }) => reasons.length === 0)
    .map(({ offer }) => offer.price_toman_as_listed)
    .sort((a, b) => a - b);
  if (!prices.length) return [];
  const indexes = [0, Math.floor((prices.length - 1) / 2), prices.length - 1];
  return [...new Set(indexes.map((index) => Math.ceil(prices[index] / 5_000_000) * 5_000_000))];
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

/** Suggest reviewed, available offers with explicit, limited compromises. */
export function nearbyAlternatives(decisions: readonly EligibilityDecision[], journey: Journey, limit: number): Offer[] {
  const allowed = new Set<ExclusionReason>(["over_budget", "defect_unknown", "intolerable_defect", "technical_minimum"]);
  return decisions
    .filter(({ reasons }) => reasons.length > 0 && reasons.every((reason) => allowed.has(reason)))
    .sort((a, b) => {
      const difference = Number(needsChassisCheck(b)) - Number(needsChassisCheck(a)) ||
        Number(a.reasons.includes("technical_minimum")) - Number(b.reasons.includes("technical_minimum")) || a.reasons.length - b.reasons.length;
      if (difference) return difference;
      return a.offer.price_toman_as_listed - b.offer.price_toman_as_listed;
    })
    .slice(0, Math.max(0, limit))
    .map(({ offer, reasons }) => {
      if (needsChassisCheck({ offer, reasons })) {
        return { ...storedOfferForDisplay(offer, journey),
          explanation: "قیمت و مشخصات ثبت‌شده با نیاز شما جور است.",
          tradeOff: "وضعیت خط‌وخش بدنه نامشخص است؛ پیش از خرید از فروشنده عکس بدنه بگیرید و وضعیت خط‌وخش را تأیید کنید." };
      }
      const compromises: string[] = [];
      if (reasons.includes("over_budget")) compromises.push("قیمت بالاتر از بودجهٔ شماست");
      if (reasons.includes("defect_unknown")) compromises.push("وضعیت خط‌وخش بدنه مشخص نیست");
      if (reasons.includes("intolerable_defect")) compromises.push("ایراد بدنه با انتخاب شما سازگار نیست");
      if (reasons.includes("technical_minimum")) compromises.push("سخت‌افزار حداقل سطح انتخابی شما را ندارد");
      return { ...storedOfferForDisplay(offer, journey),
        explanation: "این گزینه با همهٔ شرایط شما سازگار نیست؛ جزئیات زیر را بررسی کنید.",
        tradeOff: compromises.join("? ") + "." };
    });
}

function needsChassisCheck({ reasons }: EligibilityDecision): boolean {
  return reasons.length === 1 && reasons[0] === "defect_unknown";
}
