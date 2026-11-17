import type { Offer } from "../app/offers.ts";

/** A minimal offer for tests that need shapes the representative data does not carry. */
export function makeOffer(overrides: Partial<Offer>): Offer {
  return {
    id: "synthetic",
    model: "Synthetic Laptop",
    seller: "Seller",
    url: "https://example.com/offer",
    lastCheckedAt: "2026-11-17T12:00:00+03:30",
    priceToman: 10_000_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: { cpu: "CPU", memory: "RAM" },
    defects: [],
    undisclosedFeatures: ["وضعیت باتری"],
    explanation: "دلیل پیشنهاد",
    tradeOff: "هزینهٔ انتخاب",
    ...overrides,
  };
}
