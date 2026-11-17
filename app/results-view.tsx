import Link from "next/link";
import styles from "./guide.module.css";
import { Assistant, SiteHeader } from "./chrome";
import { type Journey, questionStepsFor } from "./journey";
import { answerText } from "./labels";
import ResultsBody, { type ResultsBodyClassNames } from "./results-body";
import { refineActions, summarizeResults } from "./results";

const resultsClassNames: ResultsBodyClassNames = {
  root: styles.resultsBody,
  count: styles.resultsCount,
  hint: styles.resultsHint,
  list: styles.offerList,
  empty: styles.emptyResults,
  refine: styles.refine,
  refineTitle: styles.refineTitle,
  refineLinks: styles.refineLinks,
  art: [styles.product0, styles.product1, styles.product2, styles.product3],
  card: {
    card: styles.offerCard,
    art: styles.product,
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

export default function ResultsView({ journey }: { journey: Journey }) {
  const summary = summarizeResults(journey);
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
