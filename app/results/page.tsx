import { redirect } from "next/navigation";
import { firstIncompleteStep, readJourney, stepPath } from "../journey";
import ResultsView from "../results-view";
import { toSearchParams } from "../search-params";
import { evaluateStoredOffers, readStoredOffers, storedOfferForDisplay } from "../stored-offers";
import { summarizeEligibleOffers } from "../results";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResultsPage({ searchParams }: PageProps) {
  const journey = readJourney(toSearchParams(await searchParams));
  const incomplete = firstIncompleteStep(journey);

  if (incomplete !== "review") {
    redirect(stepPath(incomplete, journey));
  }

  const decisions = evaluateStoredOffers(readStoredOffers(), journey);
  const offers = decisions.filter((decision) => decision.reasons.length === 0)
    .map((decision) => storedOfferForDisplay(decision.offer, journey));
  return <ResultsView journey={journey} summary={summarizeEligibleOffers(offers)} />;
}
