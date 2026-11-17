import Link from "next/link";
import styles from "./guide.module.css";
import { Assistant, SiteHeader } from "./chrome";
import { type Journey, questionSteps, stepPath } from "./journey";
import { answerText, numberFormat } from "./labels";

const groups = [
  {
    title: "عملکرد بهتر با همان بودجه",
    description: "مناسب کار هم‌زمان با چند برنامه. در عوض، بدنه معمولاً سنگین‌تر است.",
    offers: [
      { model: "Lenovo ThinkPad T14 Gen 2", cpu: "Ryzen 5 PRO 5650U", memory: "رم ۱۶ گیگابایت، SSD ۵۱۲ گیگابایت", benefit: "پردازندهٔ شش‌هسته‌ای و صفحه‌کلید مناسب تایپ طولانی", drawback: "وزن بیشتر و نیاز به بررسی سلامت باتری", price: 25900000 },
      { model: "Dell Latitude 5420", cpu: "Core i5-1145G7", memory: "رم ۱۶ گیگابایت، SSD ۵۱۲ گیگابایت", benefit: "رم قابل ارتقا و درگاه‌های متنوع", drawback: "کیفیت نمایشگر بسته به پیکربندی فرق می‌کند", price: 23400000 },
    ],
  },
  {
    title: "وزن کمتر برای جابه‌جایی",
    description: "حمل آسان‌تر برای کلاس و رفت‌وآمد. ارتقای سخت‌افزار محدودتر است.",
    offers: [
      { model: "Apple MacBook Air M1", cpu: "Apple M1", memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت", benefit: "بدنهٔ سبک با طراحی بی‌صدا و بدون فن", drawback: "رم ثابت و فقط دو درگاه USB-C", price: 27900000 },
      { model: "HP EliteBook 835 G8", cpu: "Ryzen 5 PRO 5650U", memory: "رم ۱۶ گیگابایت، SSD ۲۵۶ گیگابایت", benefit: "بدنهٔ جمع‌وجور با رم ۱۶ گیگابایتی", drawback: "صفحهٔ کوچک‌تر برای کار با چند پنجره", price: 24900000 },
    ],
  },
];

export default function ResultsView({ journey }: { journey: Journey }) {
  return (
    <div className={styles.guide}>
      <SiteHeader />
      <main className={styles.results}>
        <div className={styles.sectionTitle}>
          <div><p>فهرست پیشنهادی</p><h1>دو راه برای پیدا کردن لپ‌تاپ مناسب</h1></div>
          <span className={styles.complete}>✓ مراحل کامل شد</span>
        </div>
        <Assistant>
          <p>اگر عملکرد برایتان مهم‌تر است، از گروه اول شروع کنید. برای رفت‌وآمد، مدل‌های سبک‌تر گروه دوم را بررسی کنید.</p>
          <p className={styles.brief}>{questionSteps.map((step) => answerText(step, journey)).join(" / ")}</p>
        </Assistant>
        <p className={styles.caption}>۴ مدل نمونه · ۲ گروه · قیمت‌ها و تصاویر تقریبی‌اند</p>
        <div className={styles.groups}>
          {groups.map((group, groupIndex) => (
            <section key={group.title} className={styles.group}>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <ul className={styles.cards}>
                {group.offers.map((offer, index) => (
                  <li key={offer.model} className={styles.card}>
                    <div className={`${styles.product} ${styles[`product${groupIndex * 2 + index}`]}`} aria-hidden="true" />
                    <h3><bdi>{offer.model}</bdi></h3>
                    <p><bdi>{offer.cpu}</bdi><br />{offer.memory}</p>
                    <p className={styles.benefit}>+ {offer.benefit}</p>
                    <p className={styles.drawback}>− {offer.drawback}</p>
                    <p className={styles.price}><strong>{numberFormat.format(offer.price)}</strong> تومان</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className={styles.pick}>
          <strong><bdi>ThinkPad T14 Gen 2</bdi></strong>
          <span>پیشنهاد نمونه برای کار اداری. پیش از خرید، سلامت باتری و شرایط مرجوعی را بررسی کنید.</span>
        </aside>
        <div className={styles.resultsActions}>
          <Link className={`${styles.button} ${styles.link}`} href={stepPath("review", journey)}>بازبینی انتخاب‌ها</Link>
        </div>
      </main>
    </div>
  );
}
