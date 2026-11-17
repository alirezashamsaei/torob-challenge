import { redirect } from "next/navigation";
import { firstIncompleteStep, readJourney, resultsPath, stepPath } from "../journey";
import { toSearchParams } from "../search-params";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ResultsPage({ searchParams }: PageProps) {
  const journey = readJourney(toSearchParams(await searchParams));
  const incomplete = firstIncompleteStep(journey);
  redirect(incomplete === "review" ? resultsPath(journey) : stepPath(incomplete, journey));
}
