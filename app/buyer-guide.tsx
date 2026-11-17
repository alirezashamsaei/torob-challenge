"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./buyer-guide.module.css";

const number = new Intl.NumberFormat("fa-IR");

const steps = [
  { name: "کاربری", title: "لپ‌تاپ را برای چه کاری می‌خواهید؟", options: ["روزمره و تحصیل", "کار اداری", "بازی", "کار گرافیکی"] },
  { name: "بودجه", title: "سقف بودجهٔ شما چقدر است؟", options: [18000000, 25000000, 40000000].map((value) => `${number.format(value)} تومان`) },
  { name: "اولویت", title: "کدام ویژگی برای شما مهم‌تر است؟", options: ["قیمت کمتر", "عملکرد بهتر", "وضعیت بهتر دستگاه"] },
  { name: "ایرادها", title: "خط‌وخش روی بدنه برای شما قابل قبول است؟", options: ["قابل قبول", "غیرقابل قبول", "بستگی به شدت دارد"] },
];

const offers = [
  { brand: "Lenovo", model: "ThinkPad T480", use: "کار اداری", cpu: "Core i5-8350U", ram: 16, disk: 256, price: 18900000, condition: "خط‌وخش روی بدنه" },
  { brand: "Dell", model: "Latitude 5400", use: "روزمره و تحصیل", cpu: "Core i5-8365U", ram: 8, disk: 256, price: 16500000, condition: "وضعیت باتری نامشخص" },
  { brand: "HP", model: "EliteBook 840 G6", use: "کار اداری", cpu: "Core i5-8265U", ram: 16, disk: 512, price: 20400000, condition: "خط‌وخش جزئی" },
];

export default function BuyerGuide() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const question = steps[step];
  const resultsStep = steps.length + 1;
  const showingResults = step === resultsStep;
  const completed = answers.length === steps.length;

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      heading.current?.focus();
    }
  }, [step]);

  function sendAnswer(answer: string) {
    setAnswers((previous) => {
      const updated = [...previous];
      updated[step] = answer;
      return updated;
    });
    setStep(editing ? steps.length : step + 1);
    setEditing(false);
  }

  return (
    <div className={styles.guide}>
      <header className={styles.header}>
        <div className={styles.container}>
          <span className={styles.brand}><span className={styles.laptop} aria-hidden="true" /> راهنمای لپ‌تاپ استوک</span>
          <span className={styles.sample}>نمونهٔ تعاملی</span>
        </div>
      </header>

      <main className={styles.container}>
        {showingResults ? (
          <>
            <h1 ref={heading} tabIndex={-1}>لپ‌تاپ‌های استوک</h1>
            <p className={styles.description}>نمونهٔ نمایش پیشنهادها</p>
            <ul className={styles.cards} aria-label="پیشنهادهای نمونه">
              {offers.map((offer) => (
                <li key={offer.model} className={styles.card}>
                  <div className={styles.cardVisual}>
                    <span className={styles.laptop} aria-hidden="true" />
                    <span>{offer.use}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <small><bdi>{offer.brand}</bdi></small>
                    <h2><bdi>{offer.model}</bdi></h2>
                    <p><bdi>{offer.cpu}</bdi></p>
                    <p>رم {number.format(offer.ram)} و حافظهٔ {number.format(offer.disk)} گیگابایت</p>
                    <p>{offer.condition}</p>
                    <p className={styles.price}><strong>{number.format(offer.price)}</strong> تومان</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className={styles.button} type="button" onClick={() => setStep(completed ? steps.length : 0)}>
              {completed ? "بازگشت به مرور پاسخ‌ها" : "بازگشت به راهنما"}
            </button>
          </>
        ) : (
          <section className={styles.chat} aria-label="گفت‌وگوی انتخاب لپ‌تاپ">
            <ol className={styles.transcript} aria-label="پیام‌ها">
              <li className={styles.assistant}>
                <p>سلام! چند سؤال کوتاه می‌پرسم تا ببینیم چه لپ‌تاپی به نیاز شما می‌خورد.</p>
              </li>
              {steps.slice(0, step).map(({ name, title }, index) => (
                <li key={name} className={styles.exchange}>
                  <p className={styles.assistant}>{title}</p>
                  <p className={styles.reply}>{answers[index]}</p>
                </li>
              ))}
              <li className={styles.assistant}>
                <h1 id="guide-title" ref={heading} tabIndex={-1}>{question?.title ?? "انتخاب‌هایتان را مرور کنید."}</h1>
              </li>
            </ol>

            {question ? (
              <div className={styles.composer} aria-labelledby="guide-title" role="group">
                <div className={styles.composerLabel}>یک گزینه را انتخاب کنید <span>{number.format(step + 1)} از {number.format(steps.length)}</span></div>
                <div className={styles.options}>
                  {question.options.map((option) => (
                    <button className={styles.button} key={option} type="button" onClick={() => sendAnswer(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <dl className={styles.summary}>
                {steps.map(({ name }, index) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{answers[index]}</dd>
                    <dd>
                      <button className={styles.button} type="button" aria-label={`ویرایش ${name}`} onClick={() => {
                        setEditing(true);
                        setStep(index);
                      }}>ویرایش</button>
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className={styles.actions}>
              {(!question || (step === 0 && !editing)) && (
                <button className={question ? styles.textButton : `${styles.button} ${styles.primary}`} type="button" onClick={() => setStep(resultsStep)}>
                  دیدن پیشنهادهای نمونه
                </button>
              )}
              {question && step > 0 && !editing && (
                <button className={styles.textButton} type="button" onClick={() => setStep(step - 1)}>مرحلهٔ قبل</button>
              )}
              {editing && (
                <button className={styles.textButton} type="button" onClick={() => {
                  setEditing(false);
                  setStep(steps.length);
                }}>بازگشت به مرور</button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
