import "./setup-dom.ts";

import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";

import type { Offer } from "../app/offers.ts";
import { representativeOffers } from "../app/offers.ts";
import { readJourney } from "../app/journey.ts";
import { numberFormat } from "../app/labels.ts";
import type { ResultsBodyClassNames } from "../app/results-body.tsx";
import ResultsBody from "../app/results-body.tsx";
import { refineActions, summarizeResults } from "../app/results.ts";
import { makeOffer } from "./offer-fixture.ts";

afterEach(cleanup);

const classNames: ResultsBodyClassNames = {
  root: "root",
  count: "count",
  hint: "hint",
  list: "list",
  empty: "empty",
  refine: "refine",
  refineTitle: "refineTitle",
  refineLinks: "refineLinks",
  artVariants: ["sprite-0", "sprite-1", "sprite-2", "sprite-3"],
  card: {
    card: "card",
    artBase: "art",
    head: "head",
    rank: "rank",
    model: "model",
    meta: "meta",
    facts: "facts",
    reason: "reason",
    tradeOff: "tradeOff",
    prices: "prices",
    price: "price",
    shipping: "shipping",
    footer: "footer",
    sellerLink: "sellerLink",
    checked: "checked",
  },
};

function renderResults(query: string, offers: readonly Offer[] = representativeOffers) {
  const journey = readJourney(new URLSearchParams(query));
  const summary = summarizeResults(journey, offers);

  render(
    <ResultsBody
      summary={summary}
      actions={refineActions(journey)}
      renderAction={(action) => (
        <a key={action.step} href={action.href}>
          {action.label}
        </a>
      )}
      classNames={classNames}
    />,
  );

  return summary;
}

function offerWith(overrides: Partial<Offer>): Offer {
  return makeOffer(overrides);
}

test("a card shows the seller link, price, shipping, check time, defects, unknowns, trade-off and reason", () => {
  const stockland = representativeOffers.find((offer) => offer.id === "stockland-latitude-5410");
  assert.ok(stockland);

  renderResults(
    "usecase=office&budget=100000000&priority=price&defect.chassisScratch=acceptable",
    [stockland],
  );

  const [card] = screen.getAllByRole("listitem");

  const sellerLink = within(card).getByRole("link", { name: /Stockland/ });
  assert.equal(sellerLink.getAttribute("href"), stockland.url);
  assert.equal(sellerLink.getAttribute("target"), "_blank");
  assert.match(sellerLink.getAttribute("rel") ?? "", /noreferrer/);

  assert.ok(within(card).getByText(`${numberFormat.format(stockland.priceToman)} تومان`));
  assert.ok(within(card).getByText(/ارسال: مبلغ اعلام نشده/));
  assert.ok(within(card).getByText(/آخرین بررسی/));
  assert.equal(
    within(card).getByText(stockland.explanation).textContent,
    stockland.explanation,
  );
  assert.ok(within(card).getByText(stockland.tradeOff));
  assert.ok(within(card).getByText(/هیچ ایرادی اعلام نشده/));
  assert.ok(within(card).getByText(stockland.undisclosedFeatures.join("، ")));

  const checked = card.querySelector("time");
  assert.equal(checked?.getAttribute("dateTime"), stockland.lastCheckedAt);
  assert.match(checked?.textContent ?? "", /۱۴۰۵/);
});

test("a disclosed shipping amount stays separate from the device price", () => {
  renderResults(
    "usecase=everyday&budget=100000000&priority=price&defect.chassisScratch=acceptable",
    [makeOffer({ shippingToman: 250_000 })],
  );

  assert.ok(screen.getByText(`${numberFormat.format(10_000_000)} تومان`));
  assert.ok(screen.getByText("ارسال: ۲۵۰٬۰۰۰ تومان (جدا از قیمت دستگاه)"));
});

test("two offers for the same model render as two separate cards", () => {
  const sameModel = representativeOffers.filter((offer) => offer.model === "Dell Latitude 5480");

  renderResults(
    "usecase=everyday&budget=100000000&priority=condition&defect.chassisScratch=acceptable",
    sameModel,
  );

  assert.equal(screen.getAllByRole("listitem").length, 2);
  assert.ok(screen.getByRole("link", { name: /Stock Iran/ }));
  assert.ok(screen.getByRole("link", { name: /Radin Computer/ }));
  assert.equal(screen.getAllByRole("heading", { level: 3, name: "Dell Latitude 5480" }).length, 2);
});

test("zero results show the count and a way to change the constraints", () => {
  renderResults(
    "usecase=gaming&budget=40000000&priority=price&defect.chassisScratch=acceptable",
  );

  assert.ok(
    screen.getByRole("heading", { name: "۰ پیشنهاد با این شرایط پیدا نشد" }),
  );
  assert.equal(screen.queryAllByRole("listitem").length, 0);
  assert.ok(screen.getByText(/با افزایش بودجه یا قابل قبول دانستن یکی از ایرادها/));

  const links = screen.getAllByRole("link");
  assert.deepEqual(
    links.map((link) => link.textContent),
    ["تغییر بودجه", "تغییر بازی", "تغییر اولویت", "تغییر ایرادهای قابل قبول"],
  );
  for (const link of links) {
    assert.match(link.getAttribute("href") ?? "", /^\/guide\//);
  }
});

test("one to four results show the actual count and how to widen the search", () => {
  const summary = renderResults(
    "usecase=everyday&budget=40000000&priority=price&defect.chassisScratch=acceptable",
  );

  assert.equal(summary.suitable, 3);
  assert.ok(screen.getByRole("heading", { name: "فقط ۳ پیشنهاد با شرایط شما جور است" }));
  assert.equal(screen.getAllByRole("listitem").length, 3);
  assert.ok(screen.getByText(/برای دیدن گزینه‌های بیشتر، بودجه یا ایرادهای قابل قبول/));
  assert.ok(screen.getByRole("heading", { name: "شرایط را تغییر دهید" }));
});

test("a card lists the defects the seller disclosed", () => {
  const pavilion = representativeOffers.find((offer) => offer.id === "technolife-pavilion-17");
  assert.ok(pavilion);

  renderResults(
    "usecase=everyday&budget=100000000&priority=price&defect.chassisScratch=acceptable",
    [pavilion],
  );

  assert.ok(screen.getByText("خط‌وخش بدنه، پیکسل سوخته و هالهٔ نمایشگر"));
  assert.ok(screen.getByText(pavilion.tradeOff));
});

test("five cards can appear while the count reports every suitable offer", () => {
  renderResults(
    "usecase=everyday&budget=100000000&priority=price&defect.chassisScratch=acceptable",
  );

  assert.ok(screen.getByRole("heading", { name: "۵ پیشنهاد از میان ۷ پیشنهاد مناسب" }));
  assert.equal(screen.getAllByRole("listitem").length, 5);
});
