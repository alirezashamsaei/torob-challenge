import { redirect } from "next/navigation";
import GuideView from "../../guide-view";
import { canVisitStep, firstIncompleteStep, readJourney, stepFromSegment, stepPath } from "../../journey";
import { toSearchParams } from "../../search-params";
import { defectCandidates, evaluateStoredOffers, nearbyAlternatives, readStoredOffers, storedOfferForDisplay, suggestedBudgets } from "../../stored-offers";

import { maxResults, summarizeEligibleOffers } from "../../results";

type PageProps = {
  params: Promise<{ step: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuideStepPage({ params, searchParams }: PageProps) {
  const [segment, search] = await Promise.all([params, searchParams]);
  const journey = readJourney(toSearchParams(search));
  const incomplete = firstIncompleteStep(journey);
  const step = stepFromSegment(segment.step);

  if (!step || !canVisitStep(step, journey)) {
    redirect(stepPath(incomplete, journey));
  }

  const candidates = step === "defects" ? defectCandidates(readStoredOffers(), journey) : [];
  const budgetPresets = step === "budget" ? suggestedBudgets(readStoredOffers(), journey) : [];
  const verdict = step === "review" && search.verdict === "1";
  let summary;
  if (verdict) {
    const decisions = evaluateStoredOffers(readStoredOffers(), journey);
    const eligible = decisions.filter((decision) => decision.reasons.length === 0)
      .map((decision) => storedOfferForDisplay(decision.offer, journey));
    summary = { ...summarizeEligibleOffers(eligible, journey),
      alternatives: nearbyAlternatives(decisions, journey, maxResults - eligible.length) };
  }
  return <GuideView step={step} journey={journey} defectCandidateCount={candidates.length} budgetPresets={budgetPresets} summary={summary} />;
}
