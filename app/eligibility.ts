import { findRequirement } from "./requirements";
import type { Journey } from "./journey";

/** Source fields are kept verbatim in SQLite; unknowns must not become facts. */
export type StoredOffer = {
  offer_url: string; seller: string; model: string; evidence_url: string;
  observed_on_tehran: string; price_toman_as_listed: number;
  primary_use_case: string; seller_condition_type: string; cosmetic_grade: string;
  battery_evidence: string; disclosed_defects: string; test_or_return_terms: string;
  availability_evidence: string; configuration_evidence: string; screening_status: string;
  observation_batch: string; notes: string; image_url: string;
  demo_chassis_scratch?: "none" | "minor" | "major";
  simulated_chassis_scratch?: "none" | "minor" | "major" | "seller_evidence" | null;
};

export type ExclusionReason =
  | "availability_unknown" | "unavailable" | "invalid_price" | "budget_unknown" | "over_budget"
  | "insufficient_evidence" | "technical_unknown" | "technical_minimum"
  | "defect_unknown" | "intolerable_defect";

function disclosed(value: string): boolean {
  return !!value?.trim() && !/\b(?:not disclosed|undisclosed|unknown|unconfirmed|not specified|unspecified)\b/i.test(value) && !/^(none|n\/?a)$/i.test(value.trim());
}

function hasConditionEvidence(offer: StoredOffer): boolean {
  const terms = offer.test_or_return_terms || "";
  const specificTerms = disclosed(terms) && /\b\d+\s*[- ]\s*(?:day|month|year)/i.test(terms) && /test|return|exchange|replacement/i.test(terms);
  return disclosed(offer.battery_evidence) || disclosed(offer.disclosed_defects) || specificTerms;
}

function availability(value: string): boolean | null {
  if (!value) return null;
  if (/out of stock|unavailable|sold out|not (?:currently |listed |shown as )?(?:available|in stock)/i.test(value)) return false;
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
  const ramMatch = (!/\b(?:VRAM|SSD|HDD|storage|NVMe)\b/i.test(ramField) ? ramField.match(/\b(\d+)\s*GB\b/i) : null) ?? text.match(/\b(\d+)\s*GB\s*(?:DDR\d\s*)?RAM\b/i);
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
  else if (Number.isSafeInteger(offer.price_toman_as_listed) && offer.price_toman_as_listed > journey.budget!) reasons.push("over_budget");

  if (offer.screening_status !== "Provisionally eligible" || !offer.offer_url?.trim() || offer.evidence_url !== offer.offer_url ||
      !hasConditionEvidence(offer)) {
    reasons.push("insufficient_evidence");
  }
  const technical = technicalFit(offer, journey);
  if (technical === null) reasons.push("technical_unknown");
  else if (!technical) reasons.push("technical_minimum");

  const answer = journey.defects.chassisScratch;
  if (!answer) reasons.push("defect_unknown");
  else if (answer.tolerance === "depends" && !answer.severity) reasons.push("defect_unknown");
  else if (answer.tolerance !== "acceptable") {
    const simulated = offer.demo_chassis_scratch;
    const condition = simulated === "none" ? "No chassis scratches" :
      simulated === "minor" ? "Small case scratches" :
      simulated === "major" ? "Deep chassis scratches" : offer.disclosed_defects || "";
    if (!disclosed(condition)) reasons.push("defect_unknown");
    else {
      const negatedChassis = /\bno (?:(?:chassis|case|body) scratches|scratches on (?:the )?(?:chassis|case|body))\b/ig;
      const noScratches = negatedChassis.test(condition);
      const remaining = condition
        .replace(negatedChassis, "")
        .replace(/\b(?:no )?(?:display scratches|scratches on (?:the )?display)\b/ig, "")
        .replace(/\bno scratches\b/ig, "");
      if (/scratch|breakage|deformation|impact damage|paint wear/i.test(remaining)) {
        // Only explicitly minor scratches can satisfy a minor-only tolerance.
        if (answer.tolerance === "unacceptable" || (answer.severity !== "major" && !/^small case scratches$/i.test(remaining.trim()))) reasons.push("intolerable_defect");
      } else if (!noScratches) {
        // An unrelated disclosed defect is not evidence that the chassis is sound.
        reasons.push("defect_unknown");
      }
    }
  }
  return reasons;
}
