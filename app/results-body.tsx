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
  art: readonly string[];
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
      {summary.suitable === 0 ? (
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
              artClassName={classNames.art[index % classNames.art.length]}
              classNames={classNames.card}
            />
          ))}
        </ol>
      )}
      <div className={classNames.refine}>
        <h3 className={classNames.refineTitle}>شرایط را تغییر دهید</h3>
        {summary.suitable > 0 && summary.refineHint && (
          <p className={classNames.hint}>{summary.refineHint}</p>
        )}
        <div className={classNames.refineLinks}>{actions.map(renderAction)}</div>
      </div>
    </section>
  );
}
