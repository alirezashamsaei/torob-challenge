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
}: {
  summary: ResultsSummary;
  actions: readonly RefineAction[];
  renderAction: (action: RefineAction) => ReactNode;
  classNames: ResultsBodyClassNames;
}) {
  return (
    <section className={classNames.root} aria-labelledby="results-count">
      <h2 id="results-count" className={classNames.count}>
        {summary.headline}
      </h2>
      {summary.state === "none" ? (
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
      <div className={classNames.refine}>
        <h3 className={classNames.refineTitle}>شرایط را تغییر دهید</h3>
        {summary.state === "few" && summary.refineHint && (
          <p className={classNames.hint}>{summary.refineHint}</p>
        )}
        <div className={classNames.refineLinks}>{actions.map(renderAction)}</div>
      </div>
    </section>
  );
}
