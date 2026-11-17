import { redirect } from "next/navigation";
import GuideView from "../../guide-view";
import { canVisitStep, firstIncompleteStep, readJourney, stepFromSegment, stepPath } from "../../journey";
import { toSearchParams } from "../../search-params";
import { defectCandidates, readStoredOffers } from "../../stored-offers";

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
  return <GuideView step={step} journey={journey} defectCandidateCount={candidates.length} />;
}
