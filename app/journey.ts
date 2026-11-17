export const useCases = ["everyday", "office", "gaming", "graphics"] as const;
export type UseCase = (typeof useCases)[number];

export const priorities = ["price", "performance", "condition"] as const;
export type Priority = (typeof priorities)[number];

export const tolerances = ["acceptable", "unacceptable", "depends"] as const;
export type Tolerance = (typeof tolerances)[number];

export const severities = ["minor", "major"] as const;
export type Severity = (typeof severities)[number];

export const defects = ["chassisScratch"] as const;
export type DefectId = (typeof defects)[number];

export type DefectAnswer = {
  tolerance: Tolerance;
  severity?: Severity;
};

export type Journey = {
  useCase?: UseCase;
  budget?: number;
  priority?: Priority;
  defects: Partial<Record<DefectId, DefectAnswer>>;
};

export type QuestionStep = "usecase" | "budget" | "priority" | "defects";
export type Step = QuestionStep | "review";

export const questionSteps: readonly QuestionStep[] = ["usecase", "budget", "priority", "defects"];
export const steps: readonly Step[] = [...questionSteps, "review"];

const budgetParam = "budget";
const useCaseParam = "usecase";
const priorityParam = "priority";
export const defectParam = (id: DefectId) => `defect.${id}`;
export const severityParam = (id: DefectId) => `severity.${id}`;

export function emptyJourney(): Journey {
  return { defects: {} };
}

function includes<T extends string>(values: readonly T[], value: string | null): value is T {
  return value !== null && (values as readonly string[]).includes(value);
}

function readBudget(value: string | null): number | undefined {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const budget = Number(value);
  return Number.isSafeInteger(budget) && budget > 0 ? budget : undefined;
}

export function readJourney(params: URLSearchParams): Journey {
  const journey = emptyJourney();
  const useCase = params.get(useCaseParam);
  if (includes(useCases, useCase)) journey.useCase = useCase;

  const budget = readBudget(params.get(budgetParam));
  if (budget !== undefined) journey.budget = budget;

  const priority = params.get(priorityParam);
  if (includes(priorities, priority)) journey.priority = priority;

  for (const id of defects) {
    const tolerance = params.get(defectParam(id));
    if (!includes(tolerances, tolerance)) continue;
    const severity = params.get(severityParam(id));
    journey.defects[id] =
      tolerance === "depends" && includes(severities, severity)
        ? { tolerance, severity }
        : { tolerance };
  }

  return journey;
}

export function journeyParams(journey: Journey): URLSearchParams {
  const params = new URLSearchParams();
  if (journey.useCase) params.set(useCaseParam, journey.useCase);
  if (journey.budget !== undefined) params.set(budgetParam, String(journey.budget));
  if (journey.priority) params.set(priorityParam, journey.priority);
  for (const id of defects) {
    const answer = journey.defects[id];
    if (!answer) continue;
    params.set(defectParam(id), answer.tolerance);
    if (answer.tolerance === "depends" && answer.severity) {
      params.set(severityParam(id), answer.severity);
    }
  }
  return params;
}

export function firstIncompleteStep(journey: Journey): Step {
  if (!journey.useCase) return "usecase";
  if (journey.budget === undefined) return "budget";
  if (!journey.priority) return "priority";
  if (
    defects.some((id) => {
      const answer = journey.defects[id];
      return !answer || (answer.tolerance === "depends" && !answer.severity);
    })
  ) {
    return "defects";
  }
  return "review";
}

export function previousStep(step: Step): Step | null {
  const index = steps.indexOf(step);
  return index > 0 ? steps[index - 1] : null;
}

export function stepFromSegment(segment: string): Step | undefined {
  return steps.find((step) => step === segment);
}

function pathWithQuery(path: string, journey: Journey): string {
  const query = journeyParams(journey).toString();
  return query ? `${path}?${query}` : path;
}

export function stepPath(step: Step, journey: Journey): string {
  return pathWithQuery(`/guide/${step}`, journey);
}

export function resultsPath(journey: Journey): string {
  return pathWithQuery("/results", journey);
}

export function withoutDefectAnswer(journey: Journey, id: DefectId): Journey {
  const params = journeyParams(journey);
  params.delete(defectParam(id));
  params.delete(severityParam(id));
  return readJourney(params);
}
