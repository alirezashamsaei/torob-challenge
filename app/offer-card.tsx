import type { Offer } from "./offers";
import { lastCheckedLabel, numberFormat, tomanLabel } from "./labels";

export type OfferCardClassNames = {
  card: string;
  artBase: string;
  head: string;
  rank: string;
  model: string;
  meta: string;
  facts: string;
  reason: string;
  tradeOff: string;
  prices: string;
  price: string;
  shipping: string;
  footer: string;
  sellerLink: string;
  checked: string;
};

/** Shipping is money the buyer pays on top of the device price, or unknown. */
function shippingLabel(shippingToman: number | null): string {
  if (shippingToman === null) return "مبلغ اعلام نشده";
  if (shippingToman === 0) return "رایگان";
  return `${tomanLabel(shippingToman)} (جدا از قیمت دستگاه)`;
}

export default function OfferCard({
  offer,
  rank,
  classNames,
  artVariant,
}: {
  offer: Offer;
  rank: number;
  classNames: OfferCardClassNames;
  artVariant: string;
}) {
  const defects = offer.conditionDisclosure ?? (offer.defects.length
    ? offer.defects.map((defect) => defect.label).join("، ")
    : "هیچ ایرادی اعلام نشده");

  return (
    <li className={classNames.card}>
      <div className={`${classNames.artBase} ${artVariant}`} aria-hidden="true" />
      <div className={classNames.head}>
        <span className={classNames.rank} aria-hidden="true">
          {numberFormat.format(rank)}
        </span>
        <h3 className={classNames.model}>
          <bdi>{offer.model}</bdi>
        </h3>
      </div>
      <p className={classNames.meta}>
        <bdi>{offer.configuration.cpu}</bdi>
        <br />
        {offer.configuration.memory}
        {offer.configuration.graphics && (
          <>
            <br />
            <bdi>{offer.configuration.graphics}</bdi>
          </>
        )}
      </p>
      <p className={classNames.reason}>
        <strong>چرا این پیشنهاد</strong>
        <span>{offer.explanation}</span>
      </p>
      <p className={classNames.tradeOff}>
        <strong>در عوض</strong>
        <span>{offer.tradeOff}</span>
      </p>
      <dl className={classNames.facts}>
        <div>
          <dt>ایرادهای اعلام‌شده</dt>
          <dd>{defects}</dd>
        </div>
        <div>
          <dt>شرایط تست و مرجوعی</dt>
          <dd>{offer.testTerms ?? "نامشخص"}</dd>
        </div>
        {offer.undisclosedFeatures.length > 0 && (
          <div>
            <dt>اطلاعات نامشخص</dt>
            <dd>{offer.undisclosedFeatures.join("، ")}</dd>
          </div>
        )}
      </dl>
      <div className={classNames.prices}>
        <p className={classNames.price}>
          <span>قیمت دستگاه</span>
          <strong>{tomanLabel(offer.priceToman)}</strong>
        </p>
        <p className={classNames.shipping}>
          ارسال: {shippingLabel(offer.shippingToman)}
        </p>
      </div>
      <div className={classNames.footer}>
        <a
          className={classNames.sellerLink}
          href={offer.url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`صفحهٔ فروشنده: ${offer.seller} (در پنجرهٔ جدید باز می‌شود)`}
        >
          صفحهٔ فروشنده: {offer.seller} <span aria-hidden="true">↗</span>
        </a>
        <p className={classNames.checked}>
          آخرین بررسی:{" "}
          <time dateTime={offer.lastCheckedAt}>{lastCheckedLabel(offer.lastCheckedAt)}</time>
        </p>
      </div>
    </li>
  );
}
