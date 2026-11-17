"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./buyer-guide.module.css";

const number = new Intl.NumberFormat("fa-IR");
const budgets = [18000000, 25000000, 40000000];

const steps = [
  { name: "کاربری", title: "لپ‌تاپ را بیشتر برای چه کاری می‌خواهید؟", options: ["روزمره و تحصیل", "کار اداری", "بازی", "کار گرافیکی"] },
  { name: "بودجه", title: "چه بودجه‌ای برای لپ‌تاپ در نظر دارید؟", options: budgets.map((value) => `${number.format(value)} تومان`) },
  { name: "اولویت", title: "کدام ویژگی برای شما مهم‌تر است؟", options: ["قیمت کمتر", "عملکرد بهتر", "وضعیت بهتر دستگاه"] },
  { name: "ایرادها", title: "خط‌وخش روی بدنه برای شما قابل قبول است؟", options: ["قابل قبول", "غیرقابل قبول", "بستگی به شدت دارد"] },
];

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

function Mark() {
  return <span className={styles.mark} aria-hidden="true">t</span>;
}

function Assistant({ children }: { children: ReactNode }) {
  return (
    <div className={styles.assistant}>
      <Mark />
      <div className={styles.message}>
        <span className={styles.speaker}>دستیار ترب</span>
        <div className={styles.bubble}>{children}</div>
      </div>
    </div>
  );
}

export default function BuyerGuide() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const review = steps.length;
  const results = review + 1;
  const question = steps[step];
  const phase = Math.min(step, 2);
  const completed = answers.length === steps.length;

  useEffect(() => {
    if (step >= 0) heading.current?.focus();
  }, [step]);

  function goTo(nextStep: number) {
    setDraft("");
    setError("");
    setStep(nextStep);
  }

  function sendAnswer(answer: string) {
    setAnswers((previous) => {
      const updated = [...previous];
      updated[step] = answer;
      return updated;
    });
    goTo(editing ? review : step + 1);
    setEditing(false);
  }

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim();
    if (question?.options.includes(value)) {
      sendAnswer(value);
      return;
    }

    if (step === 1) {
      const digits = value.replace(/[۰-۹٠-٩]/g, (digit) =>
        String(digit.charCodeAt(0) - (digit >= "۰" ? 0x06f0 : 0x0660)),
      ).replace(/[\s,٬]/g, "").replace(/تومان$/, "");
      const budget = Number(digits);
      if (/^\d+$/.test(digits) && Number.isSafeInteger(budget) && budget > 0) {
        sendAnswer(`${number.format(budget)} تومان`);
        return;
      }
      setError("بودجه را به‌صورت عدد کامل به تومان وارد کنید.");
      return;
    }

    setError("یکی از گزینه‌های نمایش‌داده‌شده را انتخاب کنید.");
  }

  function restart() {
    setAnswers([]);
    setEditing(false);
    goTo(0);
    heading.current?.focus();
  }

  if (step < 0) {
    return (
      <main className={`${styles.guide} ${styles.intro}`}>
        <span className={styles.introMark} aria-hidden="true"><span /></span>
        <h1>ترب لپ‌تاپ (استوک)</h1>
        <button className={styles.start} type="button" onClick={() => goTo(0)}>شروع</button>
      </main>
    );
  }

  return (
    <div className={styles.guide}>
      <header className={styles.header}>
        <span className={styles.brand}><Mark /><bdi>torob</bdi><span> / لپ‌تاپ</span></span>
        <span className={styles.tagline}>خرید هوشمندانه‌تر لپ‌تاپ استوک</span>
        <button className={styles.button} type="button" onClick={restart}><span aria-hidden="true">↻</span> شروع دوباره</button>
      </header>

      {step === results ? (
        <main className={styles.results}>
          <div className={styles.sectionTitle}>
            <div><p>فهرست پیشنهادی</p><h1 ref={heading} tabIndex={-1}>دو راه برای پیدا کردن لپ‌تاپ مناسب</h1></div>
            {completed && <span className={styles.complete}>✓ مراحل کامل شد</span>}
          </div>
          <Assistant>
            <p>اگر عملکرد برایتان مهم‌تر است، از گروه اول شروع کنید. برای رفت‌وآمد، مدل‌های سبک‌تر گروه دوم را بررسی کنید.</p>
            {completed && <p className={styles.brief}>{answers.slice(0, 3).join(" / ")}</p>}
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
                      <p className={styles.price}><strong>{number.format(offer.price)}</strong> تومان</p>
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
            <button className={styles.button} type="button" onClick={() => goTo(completed ? review : 0)}>
              {completed ? "بازبینی انتخاب‌ها" : "بازگشت به گفت‌وگو"}
            </button>
          </div>
        </main>
      ) : (
        <main className={styles.chat}>
          <div className={styles.sectionTitle}>
            <div><p>راهنمای انتخاب لپ‌تاپ استوک</p><h2>انتخاب مناسب، ارزش بیشتر</h2></div>
            <ol className={styles.progress} aria-label="مراحل گفت‌وگو">
              {["کاربری", "بودجه", "جزئیات"].map((label, index) => (
                <li key={label} aria-current={step < review && index === phase ? "step" : undefined}>
                  <span className={step === review || index < phase ? styles.done : undefined} aria-hidden="true">
                    {step === review || index < phase ? "✓" : number.format(index + 1)}
                  </span>{label}
                </li>
              ))}
            </ol>
          </div>
          <ol className={styles.transcript} aria-label="پیام‌ها">
            {steps.slice(0, step).map(({ name, title }, index) => (
              <li key={name} className={styles.exchange}>
                <Assistant>
                  {index === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
                  <p>{title}</p>
                </Assistant>
                <div className={styles.reply}><span className={styles.speaker}>شما</span><p>{answers[index]}</p></div>
              </li>
            ))}
            <li>
              <Assistant>
                {step === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
                <h1 id="guide-title" ref={heading} tabIndex={-1}>{question?.title ?? "انتخاب‌هایتان را مرور کنید."}</h1>
                {question ? (
                  <div className={styles.options} aria-labelledby="guide-title" role="group">
                    {question.options.map((option) => (
                      <button className={styles.button} key={option} type="button" onClick={() => sendAnswer(option)}>{option}</button>
                    ))}
                  </div>
                ) : (
                  <dl className={styles.summary}>
                    {steps.map(({ name }, index) => (
                      <div key={name}>
                        <dt>{name}</dt><dd>{answers[index]}</dd>
                        <dd><button className={styles.button} type="button" aria-label={`ویرایش ${name}`} onClick={() => {
                          setEditing(true);
                          goTo(index);
                        }}>ویرایش</button></dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Assistant>
            </li>
          </ol>
          {question && (
            <form className={styles.composer} onSubmit={submitReply}>
              <input
                aria-label={step === 1 ? "بودجه به تومان" : "پاسخ"}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "reply-error" : undefined}
                dir="auto"
                placeholder={step === 1 ? "یا بودجه را به تومان وارد کنید…" : "یا یکی از گزینه‌ها را تایپ کنید…"}
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setError(""); }}
              />
              <button className={styles.send} type="submit" aria-label="ارسال پاسخ" disabled={!draft.trim()}>↑</button>
            </form>
          )}
          {error && <p id="reply-error" className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            {(!question || (step === 0 && !editing)) && (
              <button className={styles.button} type="button" onClick={() => goTo(results)}>دیدن پیشنهادهای نمونه</button>
            )}
            {question && step > 0 && !editing && (
              <button className={styles.textButton} type="button" onClick={() => goTo(step - 1)}>مرحلهٔ قبل</button>
            )}
            {editing && (
              <button className={styles.textButton} type="button" onClick={() => {
                setEditing(false);
                goTo(review);
              }}>بازگشت به مرور</button>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
