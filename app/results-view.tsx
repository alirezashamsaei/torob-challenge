import Link from "next/link";
import styles from "./guide.module.css";
import { Assistant, SiteHeader } from "./chrome";
import { type Journey, defectParam, defects, journeyParams, priorities, questionStepsFor, severities, severityParam, tolerances } from "./journey";
import { answerText, defectLabels, priorityLabels, severityLabels, toleranceLabels } from "./labels";
import ResultsBody, { type ResultsBodyClassNames } from "./results-body";
import { refineActions, type ResultsSummary } from "./results";

const resultsClassNames: ResultsBodyClassNames = {
  root: styles.resultsBody,
  count: styles.resultsCount,
  hint: styles.resultsHint,
  list: styles.offerList,
  empty: styles.emptyResults,
  refine: styles.refine,
  refineTitle: styles.refineTitle,
  refineLinks: styles.refineLinks,
  artVariants: [styles.product0, styles.product1, styles.product2, styles.product3],
  card: {
    card: styles.offerCard,
    artBase: styles.product,
    head: styles.offerHead,
    rank: styles.offerRank,
    model: styles.offerModel,
    meta: styles.offerMeta,
    facts: styles.offerFacts,
    reason: styles.offerReason,
    tradeOff: styles.offerTradeOff,
    prices: styles.offerPrices,
    price: styles.offerPrice,
    shipping: styles.offerShipping,
    footer: styles.offerFooter,
    sellerLink: styles.offerLink,
    checked: styles.offerChecked,
  },
};

export default function ResultsView({ journey, summary }: { journey: Journey; summary: ResultsSummary }) {
  const actions = refineActions(journey);

  return (
    <div className={styles.guide}>
      <SiteHeader />
      <main className={styles.results}>
        <div className={styles.sectionTitle}>
          <div>
            <p>فهرست پیشنهادی</p>
            <h1>لپ‌تاپ استوک مناسب شما</h1>
          </div>
          <span className={styles.complete}>✓ مراحل کامل شد</span>
        </div>
        <Assistant>
          <p>
            برای هر پیشنهاد، دلیل انتخاب و هزینهٔ واقعی آن آمده است؛ قیمت دستگاه و هزینهٔ
            ارسال جدا نمایش داده می‌شوند.
          </p>
          <p className={styles.brief}>
            {questionStepsFor(journey.useCase)
              .map((step) => answerText(step, journey))
              .join(" / ")}
          </p>
          <p className={styles.brief}>
            اگر فروشنده مبلغ ارسال را اعلام نکرده باشد، «مبلغ اعلام نشده» می‌بینید و آن مبلغ در
            بودجهٔ دستگاه حساب نشده است.
          </p>
        </Assistant>
        <ResultsBody
          summary={summary}
          actions={actions}
          classNames={resultsClassNames}
          refineForm={
            <form action="/results" method="get" className={styles.refineForm}>
              {[...journeyParams(journey)].filter(([key]) =>
                key !== "budget" && key !== "priority" && !key.startsWith("defect.") && !key.startsWith("severity.")
              ).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
              <label>حداکثر بودجه (تومان)
                <input name="budget" type="number" min="1" max={Number.MAX_SAFE_INTEGER} step="1" required defaultValue={journey.budget} />
              </label>
              <label>اولویت
                <select name="priority" defaultValue={journey.priority}>
                  {priorities.map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}
                </select>
              </label>
              {defects.map((id) => (
                <div key={id} className={styles.refineDefect}>
                  <label>{defectLabels[id]}
                    <select name={defectParam(id)} defaultValue={journey.defects[id]?.tolerance}>
                      {tolerances.map((value) => <option key={value} value={value}>{toleranceLabels[value]}</option>)}
                    </select>
                  </label>
                  <label>حداکثر شدت قابل قبول (در صورت وابستگی به شدت)
                    <select name={severityParam(id)} defaultValue={journey.defects[id]?.severity ?? "minor"}>
                      {severities.map((value) => <option key={value} value={value}>{severityLabels[value]}</option>)}
                    </select>
                  </label>
                </div>
              ))}
              <button className={styles.button} type="submit">به‌روزرسانی پیشنهادها</button>
            </form>
          }
          renderAction={(action) => (
            <Link
              key={action.step}
              className={`${styles.button} ${styles.link}`}
              href={action.href}
            >
              {action.label}
            </Link>
          )}
        />
      </main>
    </div>
  );
}
