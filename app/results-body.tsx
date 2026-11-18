import type { ReactNode } from "react";
import type { OfferCardClassNames } from "./offer-card";
import OfferCard from "./offer-card";
import type { RefineAction, ResultsSummary } from "./results";

export type ResultsBodyClassNames = {
  root: string;
  count: string;
  hint: string;
  list: string;
  empty: string;
  refine: string;
  refineTitle: string;
  refineLinks: string;
  /** Decorative laptop art, one class per card position. */
  artVariants: readonly string[];
  card: OfferCardClassNames;
};

export default function ResultsBody({
  summary,
  actions,
  renderAction,
  classNames,
  refineForm,
}: {
  summary: ResultsSummary;
  actions: readonly RefineAction[];
  renderAction: (action: RefineAction) => ReactNode;
  classNames: ResultsBodyClassNames;
  refineForm?: ReactNode;
}) {
  return (
    <section className={classNames.root} aria-labelledby="results-count">
      <h2 id="results-count" className={classNames.count}>
        {summary.state === "none" && summary.alternatives?.length
          ? "پیشنهاد مطابق همهٔ شرایط پیدا نشد؛ این گزینه‌ها را بررسی کنید"
          : summary.headline}
      </h2>
      {summary.state === "none" ? !summary.alternatives?.length && (
        <div className={classNames.empty}>
          {summary.refineHint && <p className={classNames.hint}>{summary.refineHint}</p>}
        </div>
      ) : (
        <ol className={classNames.list}>
          {summary.shown.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              rank={index + 1}
              artVariant={classNames.artVariants[index % classNames.artVariants.length]}
              classNames={classNames.card}
            />
          ))}
        </ol>
      )}
      {!!summary.alternatives?.length && (
        <section aria-labelledby="alternatives-title">
          <h3 id="alternatives-title">گزینه‌های جایگزین با شرایط متفاوت</h3>
          <p className={classNames.hint}>این گزینه‌ها همهٔ شرایط شما را ندارند؛ تفاوت هر گزینه در بخش «در عوض» آمده است.</p>
          <ol className={classNames.list}>
            {summary.alternatives.map((offer, index) => (
              <OfferCard key={offer.id} offer={offer} rank={index + 1}
                artVariant={classNames.artVariants[index % classNames.artVariants.length]} classNames={classNames.card} />
            ))}
          </ol>
        </section>
      )}
      <div className={classNames.refine}>
        <h3 className={classNames.refineTitle}>شرایط را تغییر دهید</h3>
        {summary.state === "few" && summary.refineHint && (
          <p className={classNames.hint}>{summary.refineHint}</p>
        )}
        {refineForm}
        <div className={classNames.refineLinks}>{actions.map(renderAction)}</div>
      </div>
    </section>
  );
}
