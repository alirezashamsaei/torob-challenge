import { redirect } from "next/navigation";
import GuideView from "../../guide-view";
import { firstIncompleteStep, readJourney, stepFromSegment, stepPath, steps } from "../../journey";
import { toSearchParams } from "../../search-params";

type PageProps = {
  params: Promise<{ step: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuideStepPage({ params, searchParams }: PageProps) {
  const [segment, search] = await Promise.all([params, searchParams]);
  const journey = readJourney(toSearchParams(search));
  const incomplete = firstIncompleteStep(journey);
  const step = stepFromSegment(segment.step);

  if (!step || steps.indexOf(step) > steps.indexOf(incomplete)) {
    redirect(stepPath(incomplete, journey));
  }

  return <GuideView step={step} journey={journey} />;
}
