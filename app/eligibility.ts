import { findRequirement } from "./requirements";
import type { Journey, UseCase } from "./journey";

/** Source fields are kept verbatim in SQLite; unknowns must not become facts. */
export type StoredOffer = {
  offer_url: string; seller: string; model: string; evidence_url: string;
  observed_on_tehran: string; price_toman_as_listed: number;
  primary_use_case: string; seller_condition_type: string; cosmetic_grade: string;
  battery_evidence: string; disclosed_defects: string; test_or_return_terms: string;
  availability_evidence: string; configuration_evidence: string; screening_status: string;
  observation_batch: string; notes: string; image_url: string;
};

export type ExclusionReason =
  | "availability_unknown" | "unavailable" | "invalid_price" | "budget_unknown" | "over_budget"
  | "insufficient_evidence" | "use_case_mismatch" | "technical_unknown" | "technical_minimum"
  | "defect_unknown" | "intolerable_defect";

const useCaseNames: Record<UseCase, string> = {
  everyday: "Everyday use and study", office: "Office work", gaming: "Gaming", graphics: "Graphics work",
};

function disclosed(value: string): boolean {
  return !!value?.trim() && !/^(not disclosed|unknown|unconfirmed|none|n\/?a)$/i.test(value.trim());
}

function availability(value: string): boolean | null {
  if (!value) return null;
  if (/out of stock|unavailable|sold out/i.test(value)) return false;
  if (/unconfirmed|preorder|contact seller|phone quote|older|catalog|category/i.test(value)) return null;
  if (/active purchase option|listed available|listed in stock|\b\d+ in stock\b|one in stock|seller displays in stock/i.test(value)) return true;
  return null;
}

/** Deliberately coarse, conservative hardware floors; they do not predict FPS or render times. */
function technicalFit(offer: StoredOffer, journey: Journey): boolean | null {
  if (!journey.useCase) return null;
  const text = offer.configuration_evidence || "";
  // The audit uses CPU / RAM / storage; the first GB after the CPU is RAM.
  const ramField = text.split("/")[1] ?? "";
  const ramMatch = ramField.match(/\b(\d+)\s*GB\b/i) ?? text.match(/\b(\d+)\s*GB\s*(?:DDR\d\s*)?RAM\b/i);
  if (!ramMatch) return null;
  const ram = Number(ramMatch[1]);
  const minimumRam = journey.useCase === "everyday" ? 4 : 8;
  if (ram < minimumRam) return false;
  if (journey.useCase === "everyday" || journey.useCase === "office") return true;
  if (!journey.requirement || !findRequirement(journey.useCase, journey.requirement) || !journey.expectation) return null;
  const rtx = text.match(/\bRTX\s*(3050|3060|3070|3080|4050|4060|4070|4080|4090)\b/i);
  const gpuTier: Record<string, number> = { "3050": 1, "3060": 2, "3070": 2, "3080": 3, "4050": 2, "4060": 3, "4070": 3, "4080": 4, "4090": 4 };
  const workstation = text.match(/\bRTX\s*(A1000|1000 Ada|3000 Ada|3500 Ada)\b/i);
  const workstationTier: Record<string, number> = { "A1000": 2, "1000 ADA": 2, "3000 ADA": 3, "3500 ADA": 3 };
  const tier = rtx ? gpuTier[rtx[1]] : workstation ? workstationTier[workstation[1].toUpperCase()] :
    journey.useCase === "graphics" && /Intel (?:Iris|UHD)|integrated (?:Intel|Radeon)|M1 8-core GPU/i.test(text) ? 1 : null;
  if (tier === null) return null;
  const demanding = journey.useCase === "gaming"
    ? ["cyberpunk", "hogwarts", "rdr2", "battlefield", "cod", "eldenring"].includes(journey.requirement)
    : ["premiere", "aftereffects", "blender", "3dsmax", "maya", "davinci", "solidworks", "revit", "unity", "unreal", "zbrush", "cinema4d"].includes(journey.requirement);
  const needed = 1 + Number(demanding) + (journey.expectation === "high" ? 2 : journey.expectation === "balanced" ? 1 : 0);
  if (tier < needed) return false;
  if (journey.expectation !== "basic" && ram < 16) return false;
  return true;
}

export function evaluateStoredOffer(offer: StoredOffer, journey: Journey): ExclusionReason[] {
  const reasons: ExclusionReason[] = [];
  const available = availability(offer.availability_evidence);
  if (available === null) reasons.push("availability_unknown");
  else if (!available) reasons.push("unavailable");
  if (!Number.isSafeInteger(offer.price_toman_as_listed) || offer.price_toman_as_listed <= 0) reasons.push("invalid_price");
  if (!Number.isSafeInteger(journey.budget) || (journey.budget ?? 0) <= 0) reasons.push("budget_unknown");
  else if (offer.price_toman_as_listed > journey.budget!) reasons.push("over_budget");

  if (offer.screening_status !== "Provisionally eligible" || offer.evidence_url !== offer.offer_url ||
      ![offer.battery_evidence, offer.disclosed_defects, offer.test_or_return_terms].some(disclosed)) {
    reasons.push("insufficient_evidence");
  }
  if (!journey.useCase || offer.primary_use_case !== useCaseNames[journey.useCase]) reasons.push("use_case_mismatch");
  const technical = technicalFit(offer, journey);
  if (technical === null) reasons.push("technical_unknown");
  else if (!technical) reasons.push("technical_minimum");

  const answer = journey.defects.chassisScratch;
  if (!answer) reasons.push("defect_unknown");
  else if (answer.tolerance === "depends" && !answer.severity) reasons.push("defect_unknown");
  else if (answer.tolerance !== "acceptable") {
    const condition = offer.disclosed_defects || "";
    if (!disclosed(condition)) reasons.push("defect_unknown");
    else if (/scratch|breakage|deformation|impact damage|paint wear/i.test(condition)) {
      // Only explicitly minor scratches can satisfy a minor-only tolerance.
      if (answer.tolerance === "unacceptable" || (answer.severity !== "major" && !/^small case scratches$/i.test(condition.trim()))) reasons.push("intolerable_defect");
    } else {
      // An unrelated disclosed defect is not evidence that the chassis is sound.
      reasons.push("defect_unknown");
    }
  }
  return reasons;
}
