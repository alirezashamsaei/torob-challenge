import { redirect } from "next/navigation";
import { firstIncompleteStep, readJourney, stepPath } from "../journey";
import ResultsView from "../results-view";
import { toSearchParams } from "../search-params";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResultsPage({ searchParams }: PageProps) {
  const journey = readJourney(toSearchParams(await searchParams));
  const incomplete = firstIncompleteStep(journey);

  if (incomplete !== "review") {
    redirect(stepPath(incomplete, journey));
  }

  return <ResultsView journey={journey} />;
}
