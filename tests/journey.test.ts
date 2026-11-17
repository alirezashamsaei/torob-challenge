import { test } from "node:test";
import assert from "node:assert/strict";

import {
  emptyJourney,
  firstIncompleteStep,
  journeyParams,
  previousStep,
  readJourney,
  resultsPath,
  stepFromSegment,
  stepPath,
  withoutDefectAnswer,
} from "../app/journey.ts";

test("an empty journey starts at the use case step", () => {
  assert.equal(firstIncompleteStep(emptyJourney()), "usecase");
});

test("a full journey survives the trip through the URL", () => {
  const journey = {
    useCase: "gaming" as const,
    budget: 25_000_000,
    priority: "performance" as const,
    defects: { chassisScratch: { tolerance: "acceptable" as const } },
  };

  assert.deepEqual(readJourney(journeyParams(journey)), journey);
  assert.equal(firstIncompleteStep(journey), "review");
});

test("unknown values are ignored, so the first missing question asks again", () => {
  const journey = readJourney(new URLSearchParams("usecase=spaceship&budget=abc&priority=taste"));

  assert.deepEqual(journey, emptyJourney());
  assert.equal(firstIncompleteStep(journey), "usecase");
});

test("a budget is a positive whole number of tomans", () => {
  for (const value of ["0", "-5000000", "12.5", "", "۱۲"]) {
    assert.equal(firstIncompleteStep(readJourney(new URLSearchParams(`usecase=office&budget=${value}`))), "budget");
  }

  const journey = readJourney(new URLSearchParams("usecase=office&budget=18000000"));
  assert.equal(journey.budget, 18_000_000);
  assert.equal(firstIncompleteStep(journey), "priority");
});

test("choosing 'depends' needs a severity before the journey is complete", () => {
  const answered = "usecase=office&budget=18000000&priority=price";
  const withoutSeverity = readJourney(new URLSearchParams(`${answered}&defect.chassisScratch=depends`));
  const withSeverity = readJourney(
    new URLSearchParams(`${answered}&defect.chassisScratch=depends&severity.chassisScratch=major`),
  );

  assert.equal(firstIncompleteStep(withoutSeverity), "defects");
  assert.equal(firstIncompleteStep(withSeverity), "review");
});

test("a severity is dropped when the tolerance does not depend on it", () => {
  const journey = readJourney(
    new URLSearchParams("defect.chassisScratch=acceptable&severity.chassisScratch=major"),
  );

  assert.deepEqual(journey.defects, { chassisScratch: { tolerance: "acceptable" } });
});

test("the previous step walks the wizard back to the intro", () => {
  assert.equal(previousStep("usecase"), null);
  assert.equal(previousStep("budget"), "usecase");
  assert.equal(previousStep("review"), "defects");
});

test("every step has a route that carries the answers collected so far", () => {
  const journey = readJourney(new URLSearchParams("usecase=office&budget=18000000"));

  assert.equal(stepPath("priority", journey), "/guide/priority?usecase=office&budget=18000000");
  assert.equal(stepPath("review", journey), "/guide/review?usecase=office&budget=18000000");
  assert.equal(resultsPath(journey), "/results?usecase=office&budget=18000000");
});

test("only the wizard steps are valid route segments", () => {
  assert.equal(stepFromSegment("usecase"), "usecase");
  assert.equal(stepFromSegment("review"), "review");
  assert.equal(stepFromSegment("results"), undefined);
  assert.equal(stepFromSegment("..%2Fetc"), undefined);
});

test("dropping a defect answer asks the defect question again", () => {
  const answered = readJourney(
    new URLSearchParams(
      "usecase=office&budget=18000000&priority=price&defect.chassisScratch=depends&severity.chassisScratch=major",
    ),
  );

  const cleared = withoutDefectAnswer(answered, "chassisScratch");

  assert.deepEqual(cleared.defects, {});
  assert.equal(cleared.useCase, "office");
  assert.equal(cleared.budget, 18_000_000);
  assert.equal(firstIncompleteStep(cleared), "defects");
});

