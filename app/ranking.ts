import type { Journey, Priority } from "./journey";
import type { Offer } from "./offers";

/** Rules baseline whose weights and evidence handling are documented in docs/ranking-baseline.md. */
export const rankingVersion = "rules-v1" as const;

export type OfferScore = {
  offer: Offer;
  score: number;
  price: number;
  performance: number;
  condition: number;
  evidence: number;
  explanation: string;
  tradeOff: string;
};

type Dimension = "price" | "performance" | "condition";
function weights(priority: Priority | undefined): Record<Dimension, number> {
  const main = priority ?? "price";
  return { price: main === "price" ? 0.6 : 0.2, performance: main === "performance" ? 0.6 : 0.2, condition: main === "condition" ? 0.6 : 0.2 };
}

function performanceScore(offer: Offer): number {
  const config = `${offer.configuration.cpu} ${offer.configuration.memory} ${offer.configuration.graphics ?? ""}`.toLowerCase();
  let score = 20;
  const cpuModel = config.match(/i[3579]-(\d{4,5})|ryzen\s*[3579]\s*(\d{4})/);
  if (cpuModel) {
    const digits = cpuModel[1] ?? cpuModel[2];
    const intelModel = cpuModel[1] !== undefined;
    const twoDigitGeneration = digits.length === 5 || (intelModel && Number(digits.slice(0, 2)) >= 10 && Number(digits.slice(0, 2)) <= 14);
    const generation = Number(digits.slice(0, twoDigitGeneration ? 2 : 1));
    score += Math.min(25, generation * 2);
  }
  const ram = config.match(/(?:ram\s*)?(\d+)\s*gb/);
  if (ram) score += Math.min(20, Number(ram[1]) * 1.25);
  const rtxTier = config.match(/rtx\s*(\d{3,4})/i);
  if (rtxTier) score += Number(rtxTier[1][0]) >= 4 ? 35 : Number(rtxTier[1][0]) === 3 ? 30 : 25;
  else if (/gtx|quadro|firepro|radeon|mx\d+|discrete/i.test(config)) score += 20;
  else if (/uhd|iris|integrated/i.test(config)) score += 8;
  return Math.min(100, score);
}

function conditionScore(offer: Offer): number {
  const disclosed = (offer.conditionDisclosure ?? "").trim();
  const positiveConditionEvidence = /\bno (?:known )?(?:\w+ )?(?:defects|damage|scratches|issues)\b|بدون (?:ایراد|خراش|آسیب)/i.test(disclosed);
  const disclosedDamage = /scratch|damage|breakage|خراش|شکستگی|آسیب/i.test(disclosed) && !positiveConditionEvidence;
  const defectPenalty = Math.min(45, (offer.defects.length + Number(disclosedDamage)) * 15);
  const testEvidence = offer.testTerms ? 10 : 0;
  return Math.max(0, 55 + (positiveConditionEvidence ? 25 : 0) + testEvidence - defectPenalty);
}

function evidenceScore(offer: Offer): number {
  const fields = [offer.configuration.cpu, offer.configuration.memory, offer.configuration.graphics, offer.conditionDisclosure, offer.testTerms];
  const known = fields.filter((field) => typeof field === "string" && field.trim() && !/^(not disclosed|unknown|اعلام نشده)$/i.test(field.trim())).length;
  const unknown = offer.undisclosedFeatures.length;
  return Math.round(100 * known / Math.max(1, known + unknown));
}

function priceScores(offers: readonly Offer[]): Map<string, number> {
  const prices = offers.map((offer) => offer.priceToman);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return new Map(offers.map((offer) => [offer.id, max === min ? 100 : Math.round(100 * (max - offer.priceToman) / (max - min))]));
}

function priorityLabel(priority: Priority | undefined): string {
  if (priority === "performance") return "توان فنی";
  if (priority === "condition") return "وضعیت دستگاه";
  return "قیمت";
}

/** Score offers already past mandatory eligibility. Scores are comparative, not measured performance claims. */
export function rankEligibleOffers(offers: readonly Offer[], journey: Journey): OfferScore[] {
  const price = priceScores(offers);
  const weight = weights(journey.priority);
  return offers.map((offer) => {
    const dimensions = { price: price.get(offer.id) ?? 0, performance: performanceScore(offer), condition: conditionScore(offer) };
    const evidence = evidenceScore(offer);
    const score = Math.round(dimensions.price * weight.price + dimensions.performance * weight.performance + dimensions.condition * weight.condition + evidence * 0.1);
    const configuration = [offer.configuration.cpu, offer.configuration.memory, offer.configuration.graphics].filter(Boolean).join("، ");
    const known = offer.undisclosedFeatures.length === 0 ? "اطلاعات ثبت‌شده کامل‌تر است" : `${offer.undisclosedFeatures.length} مورد همچنان اعلام نشده است`;
    const condition = offer.defects.length ? ` ${offer.defects.length} ایراد اعلام شده` : offer.testTerms ? ` شرایط آزمون ثبت‌شده: ${offer.testTerms}` : " وضعیت سلامت نامشخص است";
    const explanation = `رتبه‌بندی ${rankingVersion}: اولویت اصلی شما ${priorityLabel(journey.priority)} است؛ قیمت ${offer.priceToman.toLocaleString("fa-IR")} تومان، مشخصات ثبت‌شده ${configuration}؛${condition}؛ ${known}.`;
    const tradeOff = offer.undisclosedFeatures.length
      ? `وضعیت موارد اعلام‌نشده نامشخص است؛ این موارد سالم فرض نشده‌اند. ${offer.tradeOff}`
      : offer.tradeOff;
    return { offer, score, ...dimensions, evidence, explanation, tradeOff };
  }).sort((a, b) => b.score - a.score || a.offer.priceToman - b.offer.priceToman || a.offer.id.localeCompare(b.offer.id));
}
