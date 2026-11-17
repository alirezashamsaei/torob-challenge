import { test } from "node:test";
import assert from "node:assert/strict";

import type { Offer } from "../app/offers.ts";
import { representativeOffers } from "../app/offers.ts";
import { readJourney } from "../app/journey.ts";
import {
  maxResults,
  refineActions,
  resultsHeadline,
  selectSuitableOffers,
  summarizeResults,
} from "../app/results.ts";

function journeyFor(query: string) {
  return readJourney(new URLSearchParams(query));
}

function offer(overrides: Partial<Offer>): Offer {
  return {
    id: "synthetic",
    model: "Synthetic Laptop",
    seller: "Seller",
    url: "https://example.com/offer",
    observedAt: "2026-11-17T12:00:00+03:30",
    priceToman: 10_000_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: { cpu: "CPU", memory: "RAM" },
    defects: [],
    undisclosed: ["وضعیت باتری"],
    explanation: "دلیل",
    tradeOff: "هزینه",
    ...overrides,
  };
}

test("results only contain offers for the chosen use case", () => {
  const office = journeyFor(
    "usecase=office&budget=100000000&priority=price&defect.chassisScratch=acceptable",
  );

  const offers = selectSuitableOffers(office);
  assert.ok(offers.length > 0);
  assert.ok(offers.every((item) => item.useCases.includes("office")));
  assert.equal(offers.some((item) => item.useCases.includes("gaming")), false);
});

test("the budget cap is inclusive and above-cap offers are excluded", () => {
  const atCap = offer({ id: "at-cap", priceToman: 50_000_000 });
  const aboveCap = offer({ id: "above-cap", priceToman: 50_000_001 });
  const journey = journeyFor(
    "usecase=everyday&budget=50000000&priority=price&defect.chassisScratch=acceptable",
  );

  const offers = selectSuitableOffers(journey, [atCap, aboveCap]);
  assert.deepEqual(
    offers.map((item) => item.id),
    ["at-cap"],
  );
});

test("an unacceptable defect removes the offer that discloses it", () => {
  const everyday = "usecase=everyday&budget=100000000&priority=price";
  const accepted = selectSuitableOffers(
    journeyFor(`${everyday}&defect.chassisScratch=acceptable`),
  );
  const rejected = selectSuitableOffers(
    journeyFor(`${everyday}&defect.chassisScratch=unacceptable`),
  );

  assert.ok(accepted.some((item) => item.id === "technolife-thinkpad-e14"));
  assert.equal(rejected.some((item) => item.id === "technolife-thinkpad-e14"), false);
});

test("a defect without a disclosed severity only survives an accepted major severity", () => {
  const everyday = "usecase=everyday&budget=100000000&priority=price&defect.chassisScratch=depends";

  const minorOnly = selectSuitableOffers(journeyFor(`${everyday}&severity.chassisScratch=minor`));
  const majorToo = selectSuitableOffers(journeyFor(`${everyday}&severity.chassisScratch=major`));

  assert.equal(minorOnly.some((item) => item.id === "technolife-thinkpad-e14"), false);
  assert.ok(majorToo.some((item) => item.id === "technolife-thinkpad-e14"));
});

test("two offers for the same model stay separate results", () => {
  const journey = journeyFor(
    "usecase=everyday&budget=100000000&priority=condition&defect.chassisScratch=acceptable",
  );

  const sameModel = selectSuitableOffers(journey).filter(
    (item) => item.model === "Dell Latitude 5480",
  );

  assert.equal(sameModel.length, 2);
  assert.notEqual(sameModel[0].id, sameModel[1].id);
});

test("the representative order is kept and display stops at five offers", () => {
  const listed = Array.from({ length: maxResults + 2 }, (_, index) =>
    offer({ id: `offer-${index}`, priceToman: 10_000_000 + index }),
  );
  const journey = journeyFor(
    "usecase=everyday&budget=100000000&priority=price&defect.chassisScratch=acceptable",
  );

  const summary = summarizeResults(journey, listed);

  assert.equal(summary.suitable, maxResults + 2);
  assert.deepEqual(
    summary.shown.map((item) => item.id),
    ["offer-0", "offer-1", "offer-2", "offer-3", "offer-4"],
  );
  assert.equal(summary.headline, resultsHeadline(maxResults + 2));
});

test("the headline counts the actual number of results", () => {
  assert.equal(resultsHeadline(0), "هیچ پیشنهادی با این شرایط پیدا نشد");
  assert.equal(resultsHeadline(1), "فقط ۱ پیشنهاد با شرایط شما جور است");
  assert.equal(resultsHeadline(3), "فقط ۳ پیشنهاد با شرایط شما جور است");
  assert.equal(resultsHeadline(5), "۵ پیشنهاد برتر از میان ۵ پیشنهاد مناسب");
  assert.equal(resultsHeadline(9), "۵ پیشنهاد برتر از میان ۹ پیشنهاد مناسب");
});

test("a scenario with too few offers counts what it has", () => {
  const summary = summarizeResults(
    journeyFor("usecase=everyday&budget=40000000&priority=price&defect.chassisScratch=acceptable"),
  );

  assert.equal(summary.suitable, 3);
  assert.equal(summary.shown.length, 3);
  assert.equal(summary.headline, "فقط ۳ پیشنهاد با شرایط شما جور است");
  assert.ok(summary.refineHint);
});

test("no offer under the budget produces the empty results state", () => {
  const summary = summarizeResults(
    journeyFor("usecase=gaming&budget=40000000&priority=price&defect.chassisScratch=acceptable"),
  );

  assert.equal(summary.suitable, 0);
  assert.deepEqual(summary.shown, []);
  assert.equal(summary.headline, "هیچ پیشنهادی با این شرایط پیدا نشد");
  assert.ok(summary.refineHint);
});

test("an offer exactly at the budget is a result", () => {
  const journey = journeyFor(
    "usecase=everyday&budget=20000000&priority=price&defect.chassisScratch=acceptable",
  );

  const summary = summarizeResults(journey, [
    offer({ id: "exact", priceToman: 20_000_000 }),
  ]);

  assert.equal(summary.suitable, 1);
});

test("refine links lead back to the questions they change and keep the journey", () => {
  const office = refineActions(
    journeyFor("usecase=office&budget=100000000&priority=price&defect.chassisScratch=acceptable"),
  );
  const labels = office.map((action) => action.label);

  assert.deepEqual(labels, ["تغییر بودجه", "تغییر اولویت", "تغییر ایرادهای قابل قبول"]);
  for (const action of office) {
    assert.match(action.href, /^\/guide\/(budget|priority|defects)\?/);
    assert.match(action.href, /usecase=office/);
    assert.match(action.href, /budget=100000000/);
  }
});

test("gaming and graphics refine links add the game or software question", () => {
  const gaming = refineActions(
    journeyFor(
      "usecase=gaming&requirement=cs2&expectation=balanced&budget=250000000&priority=performance&defect.chassisScratch=acceptable",
    ),
  );
  const graphics = refineActions(
    journeyFor(
      "usecase=graphics&requirement=photoshop&expectation=balanced&budget=100000000&priority=condition&defect.chassisScratch=acceptable",
    ),
  );

  const gamingRequirement = gaming.find((action) => action.step === "requirement");
  const graphicsRequirement = graphics.find((action) => action.step === "requirement");

  assert.equal(gamingRequirement?.label, "تغییر بازی");
  assert.match(gamingRequirement?.href ?? "", /^\/guide\/requirement\?/);
  assert.equal(graphicsRequirement?.label, "تغییر نرم‌افزار");
});
