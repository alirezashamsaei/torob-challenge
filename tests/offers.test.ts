import { test } from "node:test";
import assert from "node:assert/strict";

import { representativeOffers } from "../app/offers.ts";
import { useCases } from "../app/journey.ts";

test("representative offers cover every use case", () => {
  for (const useCase of useCases) {
    assert.ok(
      representativeOffers.some((offer) => offer.useCases.includes(useCase)),
      `missing representative offers for ${useCase}`,
    );
  }
});

test("every offer carries a unique id, seller source and observation time", () => {
  const ids = new Set<string>();

  for (const offer of representativeOffers) {
    assert.equal(ids.has(offer.id), false, `duplicate offer id ${offer.id}`);
    ids.add(offer.id);
    assert.match(offer.url, /^https:\/\//, offer.id);
    assert.ok(offer.seller.length > 0, offer.id);
    assert.equal(Number.isNaN(Date.parse(offer.observedAt)), false, offer.id);
    assert.ok(Number.isSafeInteger(offer.priceToman) && offer.priceToman > 0, offer.id);
    assert.ok(
      offer.shippingToman === null ||
        (Number.isSafeInteger(offer.shippingToman) && offer.shippingToman >= 0),
      offer.id,
    );
  }
});

test("offers keep unknown shipping and condition explicit", () => {
  assert.ok(representativeOffers.some((offer) => offer.shippingToman === null));

  for (const offer of representativeOffers) {
    assert.ok(offer.undisclosed.length > 0, offer.id);
    assert.ok(offer.explanation.length > 0, offer.id);
    assert.ok(offer.tradeOff.length > 0, offer.id);
  }
});

test("two distinct offers can list the same laptop model", () => {
  const latitudEs = representativeOffers.filter((offer) => offer.model === "Dell Latitude 5480");

  assert.equal(latitudEs.length, 2);
  assert.notEqual(latitudEs[0].id, latitudEs[1].id);
  assert.notEqual(latitudEs[0].seller, latitudEs[1].seller);
  assert.notEqual(latitudEs[0].priceToman, latitudEs[1].priceToman);
});
