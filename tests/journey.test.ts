import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canVisitStep,
  emptyJourney,
  firstIncompleteStep,
  journeyParams,
  previousStep,
  questionStepsFor,
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
    requirement: "cs2",
    expectation: "balanced" as const,
    budget: 25_000_000,
    priority: "performance" as const,
    defects: { chassisScratch: { tolerance: "acceptable" as const } },
  };

  assert.deepEqual(readJourney(journeyParams(journey)), journey);
  assert.equal(firstIncompleteStep(journey), "review");
});

test("gaming and graphics ask for a game or application and an expectation level", () => {
  const base = readJourney(
    new URLSearchParams(
      "usecase=gaming&budget=25000000&priority=performance&defect.chassisScratch=acceptable",
    ),
  );

  assert.equal(firstIncompleteStep(base), "requirement");

  const withGame = readJourney(new URLSearchParams(`${journeyParams(base)}&requirement=cs2`));
  assert.equal(firstIncompleteStep(withGame), "expectation");

  const withExpectation = readJourney(new URLSearchParams(`${journeyParams(withGame)}&expectation=balanced`));
  assert.equal(firstIncompleteStep(withExpectation), "review");
});

test("everyday and office journeys skip the game or application question", () => {
  for (const useCase of ["everyday", "office"] as const) {
    const journey = readJourney(
      new URLSearchParams(
        `usecase=${useCase}&budget=18000000&priority=price&defect.chassisScratch=acceptable`,
      ),
    );

    assert.equal(firstIncompleteStep(journey), "review");
    assert.equal(questionStepsFor(useCase).includes("requirement"), false);
  }
});

test("a game or application must belong to the selected use case", () => {
  const gamingPhotoshop = readJourney(
    new URLSearchParams("usecase=gaming&requirement=photoshop&expectation=balanced"),
  );
  assert.equal(gamingPhotoshop.requirement, undefined);
  assert.equal(gamingPhotoshop.expectation, undefined);

  const graphicsPhotoshop = readJourney(
    new URLSearchParams("usecase=graphics&requirement=photoshop&expectation=balanced"),
  );
  assert.equal(graphicsPhotoshop.requirement, "photoshop");
  assert.equal(graphicsPhotoshop.expectation, "balanced");
});

test("an expectation level alone is dropped", () => {
  const journey = readJourney(new URLSearchParams("usecase=gaming&expectation=balanced"));

  assert.equal(journey.expectation, undefined);
});

test("changing the use case drops a game or application that no longer fits", () => {
  const fromGaming = readJourney(
    new URLSearchParams("usecase=gaming&requirement=cs2&expectation=balanced&budget=25000000"),
  );

  const switchedParams = journeyParams(fromGaming);
  switchedParams.set("usecase", "office");
  const switched = readJourney(switchedParams);

  assert.equal(switched.useCase, "office");
  assert.equal(switched.requirement, undefined);
  assert.equal(switched.expectation, undefined);
  assert.equal(switched.budget, 25_000_000);
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

test("the previous step follows the answers the buyer actually gave", () => {
  const office = readJourney(new URLSearchParams("usecase=office"));
  const gaming = readJourney(new URLSearchParams("usecase=gaming"));

  assert.equal(previousStep("usecase", office), null);
  assert.equal(previousStep("budget", office), "usecase");
  assert.equal(previousStep("review", office), "defects");
  assert.equal(previousStep("expectation", gaming), "requirement");
  assert.equal(previousStep("budget", gaming), "expectation");
});

test("a step only opens once its prerequisites are answered", () => {
  const gaming = readJourney(
    new URLSearchParams("usecase=gaming&budget=25000000&priority=performance"),
  );
  const office = readJourney(
    new URLSearchParams("usecase=office&budget=18000000&priority=price&defect.chassisScratch=acceptable"),
  );

  assert.equal(canVisitStep("usecase", gaming), true);
  assert.equal(canVisitStep("requirement", gaming), true);
  assert.equal(canVisitStep("expectation", gaming), false);
  assert.equal(canVisitStep("review", gaming), false);
  assert.equal(canVisitStep("requirement", office), false);
  assert.equal(canVisitStep("review", office), true);
});

test("every step has a route that carries the answers collected so far", () => {
  const journey = readJourney(new URLSearchParams("usecase=office&budget=18000000"));
  const gaming = readJourney(new URLSearchParams("usecase=gaming&requirement=cs2&expectation=balanced"));

  assert.equal(stepPath("priority", journey), "/guide/priority?usecase=office&budget=18000000");
  assert.equal(stepPath("review", journey), "/guide/review?usecase=office&budget=18000000");
  assert.equal(resultsPath(journey), "/results?usecase=office&budget=18000000");
  assert.equal(
    stepPath("expectation", gaming),
    "/guide/expectation?usecase=gaming&requirement=cs2&expectation=balanced",
  );
});

test("only the wizard steps are valid route segments", () => {
  assert.equal(stepFromSegment("usecase"), "usecase");
  assert.equal(stepFromSegment("requirement"), "requirement");
  assert.equal(stepFromSegment("expectation"), "expectation");
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
