import type { DefectAnswer, Journey, QuestionStep } from "./journey";
import { needsRequirement, stepPath } from "./journey";
import type { Offer, OfferDefect } from "./offers";
import { representativeOffers } from "./offers";
import { numberFormat } from "./labels";

export const maxResults = 5;

export type RefineAction = {
  step: QuestionStep;
  label: string;
  href: string;
};

/** How much choice the buyer has left: none, fewer than five, or a full list. */
export type ResultsState = "none" | "few" | "full";

export type ResultsSummary = {
  /** Every suitable offer, before the five-card display cap. */
  suitable: number;
  /** The offers the results screen displays, in representative order. */
  shown: readonly Offer[];
  state: ResultsState;
  headline: string;
  /** Set when fewer than five offers are suitable and the buyer can widen the search. */
  refineHint: string | null;
};

function toleratesDefect(answer: DefectAnswer | undefined, defect: OfferDefect): boolean {
  if (!answer) return false;
  if (answer.tolerance === "acceptable") return true;
  if (answer.tolerance === "unacceptable") return false;
  // "Depends on severity": the answer names the worst severity the buyer accepts.
  if (!defect.severity) return answer.severity === "major";
  return answer.severity === "major" || defect.severity === "minor";
}

/**
 * Applies the buyer's current constraints to offer data. ADR-0002 also requires
 * availability and technical minimum filters; those arrive with the eligibility
 * rules, so this selection is deliberately limited to what the screens need now.
 */
export function selectSuitableOffers(
  journey: Journey,
  offers: readonly Offer[] = representativeOffers,
): readonly Offer[] {
  return offers.filter((offer) => {
    if (!journey.useCase || !offer.useCases.includes(journey.useCase)) return false;
    if (journey.budget !== undefined && offer.priceToman > journey.budget) return false;
    return offer.defects.every((defect) => toleratesDefect(journey.defects[defect.id], defect));
  });
}

export function resultsHeadline(suitable: number): string {
  if (suitable === 0) return "۰ پیشنهاد با این شرایط پیدا نشد";
  if (suitable < maxResults) {
    return `فقط ${numberFormat.format(suitable)} پیشنهاد با شرایط شما جور است`;
  }
  return `${numberFormat.format(maxResults)} پیشنهاد از میان ${numberFormat.format(suitable)} پیشنهاد مناسب`;
}

function stateFor(suitable: number): ResultsState {
  if (suitable === 0) return "none";
  return suitable < maxResults ? "few" : "full";
}

function refineHintFor(state: ResultsState): string | null {
  if (state === "full") return null;
  if (state === "none") {
    return "با افزایش بودجه یا قابل قبول دانستن یکی از ایرادها دوباره جست‌وجو کنید.";
  }
  return "برای دیدن گزینه‌های بیشتر، بودجه یا ایرادهای قابل قبول را تغییر دهید.";
}

export function summarizeResults(
  journey: Journey,
  offers: readonly Offer[] = representativeOffers,
): ResultsSummary {
  const suitable = selectSuitableOffers(journey, offers);
  const state = stateFor(suitable.length);

  return {
    suitable: suitable.length,
    shown: suitable.slice(0, maxResults),
    state,
    headline: resultsHeadline(suitable.length),
    refineHint: refineHintFor(state),
  };
}

export function refineActions(journey: Journey): readonly RefineAction[] {
  const actions: RefineAction[] = [
    { step: "budget", label: "تغییر بودجه", href: stepPath("budget", journey) },
  ];

  if (needsRequirement(journey.useCase)) {
    actions.push({
      step: "requirement",
      label: journey.useCase === "graphics" ? "تغییر نرم‌افزار" : "تغییر بازی",
      href: stepPath("requirement", journey),
    });
  }

  actions.push(
    { step: "priority", label: "تغییر اولویت", href: stepPath("priority", journey) },
    {
      step: "defects",
      label: "تغییر ایرادهای قابل قبول",
      href: stepPath("defects", journey),
    },
  );

  return actions;
}
