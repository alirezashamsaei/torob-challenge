import { findRequirement } from "./requirements";

export const useCases = ["everyday", "office", "gaming", "graphics"] as const;
export type UseCase = (typeof useCases)[number];

export const priorities = ["price", "performance", "condition"] as const;
export type Priority = (typeof priorities)[number];

export const tolerances = ["acceptable", "unacceptable", "depends"] as const;
export type Tolerance = (typeof tolerances)[number];

export const severities = ["minor", "major"] as const;
export type Severity = (typeof severities)[number];

export const expectations = ["basic", "balanced", "high"] as const;
export type Expectation = (typeof expectations)[number];

export const defects = ["chassisScratch"] as const;
export type DefectId = (typeof defects)[number];

export type DefectAnswer = {
  tolerance: Tolerance;
  severity?: Severity;
};

export type Journey = {
  useCase?: UseCase;
  requirement?: string;
  expectation?: Expectation;
  budget?: number;
  priority?: Priority;
  defects: Partial<Record<DefectId, DefectAnswer>>;
};

export type QuestionStep = "usecase" | "requirement" | "expectation" | "budget" | "priority" | "defects";
export type Step = QuestionStep | "review";

const baseQuestionSteps: readonly QuestionStep[] = ["usecase", "budget", "priority", "defects"];
const requirementQuestionSteps: readonly QuestionStep[] = ["requirement", "expectation"];

/** Every step a route can serve; whether a given journey may open it is separate. */
const allSteps: readonly Step[] = [
  "usecase",
  "requirement",
  "expectation",
  "budget",
  "priority",
  "defects",
  "review",
];

const budgetParam = "budget";
const useCaseParam = "usecase";
const priorityParam = "priority";
const requirementParam = "requirement";
const expectationParam = "expectation";
export const defectParam = (id: DefectId) => `defect.${id}`;
export const severityParam = (id: DefectId) => `severity.${id}`;

export function emptyJourney(): Journey {
  return { defects: {} };
}

export function needsRequirement(useCase: UseCase | undefined): boolean {
  return useCase === "gaming" || useCase === "graphics";
}

export function questionStepsFor(useCase: UseCase | undefined): readonly QuestionStep[] {
  if (!needsRequirement(useCase)) return baseQuestionSteps;
  return ["usecase", ...requirementQuestionSteps, "budget", "priority", "defects"];
}

export function stepsFor(useCase: UseCase | undefined): readonly Step[] {
  return [...questionStepsFor(useCase), "review"];
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

  const requirement = params.get(requirementParam);
  if (requirement !== null) {
    const item = findRequirement(journey.useCase, requirement);
    const expectation = params.get(expectationParam);
    if (item) {
      journey.requirement = item.id;
      if (includes(expectations, expectation)) journey.expectation = expectation;
    }
  }

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
  if (journey.requirement && findRequirement(journey.useCase, journey.requirement)) {
    params.set(requirementParam, journey.requirement);
    if (journey.expectation) params.set(expectationParam, journey.expectation);
  }
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

function isAnswered(journey: Journey, step: QuestionStep): boolean {
  switch (step) {
    case "usecase":
      return journey.useCase !== undefined;
    case "requirement":
      return journey.requirement !== undefined;
    case "expectation":
      return journey.expectation !== undefined;
    case "budget":
      return journey.budget !== undefined;
    case "priority":
      return journey.priority !== undefined;
    case "defects":
      return defects.every((id) => {
        const answer = journey.defects[id];
        return answer !== undefined && (answer.tolerance !== "depends" || answer.severity !== undefined);
      });
  }
}

export function firstIncompleteStep(journey: Journey): Step {
  for (const step of questionStepsFor(journey.useCase)) {
    if (!isAnswered(journey, step)) return step;
  }
  return "review";
}

export function canVisitStep(step: Step, journey: Journey): boolean {
  const order = stepsFor(journey.useCase);
  const index = order.indexOf(step);
  if (index < 0) return false;
  return index <= order.indexOf(firstIncompleteStep(journey));
}

export function previousStep(step: Step, journey: Journey): Step | null {
  const order = stepsFor(journey.useCase);
  const index = order.indexOf(step);
  return index > 0 ? order[index - 1] : null;
}

export function stepFromSegment(segment: string): Step | undefined {
  return allSteps.find((step) => step === segment);
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

export function withRequirement(journey: Journey, requirement: string): Journey {
  if (journey.requirement === requirement) return journey;
  const params = journeyParams(journey);
  params.set(requirementParam, requirement);
  params.delete(expectationParam);
  return readJourney(params);
}
