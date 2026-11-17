import { test } from "node:test";
import assert from "node:assert/strict";

import { readJourney } from "../app/journey.ts";
import { answerText, expectationHints, expectationLabels, reviewRows } from "../app/labels.ts";

const gaming = () =>
  readJourney(
    new URLSearchParams(
      "usecase=gaming&requirement=cs2&expectation=balanced&budget=25000000&priority=performance&defect.chassisScratch=acceptable",
    ),
  );

test("the review spells out the game and the expectation level", () => {
  const journey = gaming();

  assert.equal(answerText("requirement", journey), "کانتر استریک ۲");
  assert.equal(answerText("expectation", journey), expectationLabels.balanced);
});

test("expectation hints fit games and graphics work equally", () => {
  for (const hint of Object.values(expectationHints)) {
    assert.equal(/گرافیک|بازی/.test(hint), false);
  }
});

test("review rows follow the questions the buyer actually answered", () => {
  const rows = reviewRows(gaming());

  assert.deepEqual(
    rows.map((row) => row.step),
    ["usecase", "requirement", "expectation", "budget", "priority", "defects"],
  );
  assert.equal(rows[1].name, "بازی یا نرم‌افزار");
  assert.equal(rows[1].answer, "کانتر استریک ۲");
  assert.match(rows[1].href, /^\/guide\/requirement\?/);
  assert.match(rows[1].href, /requirement=cs2/);
});

test("office review rows skip the game and expectation questions", () => {
  const rows = reviewRows(
    readJourney(
      new URLSearchParams(
        "usecase=office&budget=18000000&priority=price&defect.chassisScratch=acceptable",
      ),
    ),
  );

  assert.deepEqual(
    rows.map((row) => row.step),
    ["usecase", "budget", "priority", "defects"],
  );
});
