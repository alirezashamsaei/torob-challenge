"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState, useTransition } from "react";
import styles from "./guide.module.css";
import { Assistant, SiteHeader } from "./chrome";
import { IntroTransition } from "./intro-transition";
import {
  type Journey,
  type QuestionStep,
  type Step,
  defects,
  defectParam,
  expectations,
  firstIncompleteStep,
  journeyParams,
  previousStep,
  priorities,
  questionStepsFor,
  readJourney,
  resultsPath,
  severities,
  severityParam,
  stepPath,
  tolerances,
  useCases,
  withoutDefectAnswer,
  withRequirement,
} from "./journey";
import { catalogFor } from "./requirements";
import SoftwarePicker from "./software-picker";
import ResultsView from "./results-view";
import type { ResultsSummary } from "./results";
import {
  answerText,
  defectLabels,
  expectationHints,
  expectationLabels,
  numberFormat,
  phaseOfStep,
  priorityLabels,
  progressLabelsFor,
  reviewRows,
  severityLabels,
  stepTitle,
  toleranceLabels,
  useCaseLabels,
} from "./labels";

const defect = defects[0];

function AnimatedText({ text }: { text: string }) {
  const [length, setLength] = useState(text.length);
  useEffect(() => {
    const characters = Array.from(text);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLength(characters.length);
      return;
    }
    setLength(0);
    const start = performance.now();
    let frame = 0;
    const reveal = (now: number) => {
      const next = Math.min(characters.length, Math.ceil((now - start) / 600 * characters.length));
      setLength(next);
      if (next < characters.length) frame = requestAnimationFrame(reveal);
    };
    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [text]);
  return <span className={styles.animatedText} aria-hidden="true"><span>{text}</span><span>{Array.from(text).slice(0, length).join("")}</span></span>;
}

type Choice = { label: string; hint?: string; params: Record<string, string> };

function choicesFor(step: QuestionStep, budgetPresets: readonly number[]): Choice[] {
  switch (step) {
    case "usecase":
      return useCases.map((value) => ({ label: useCaseLabels[value], params: { usecase: value } }));
    case "requirement":
      return [];
    case "expectation":
      return expectations.map((value) => ({
        label: expectationLabels[value],
        hint: expectationHints[value],
        params: { expectation: value },
      }));
    case "budget":
      return budgetPresets.map((value) => ({
        label: `${numberFormat.format(value)} تومان`,
        params: { budget: String(value) },
      }));
    case "priority":
      return priorities.map((value) => ({ label: priorityLabels[value], params: { priority: value } }));
    case "defects":
      return tolerances.map((value) => ({
        label: toleranceLabels[value],
        params: { [defectParam(defect)]: value },
      }));
  }
}

function severityChoices(): Choice[] {
  return severities.map((value) => ({
    label: severityLabels[value],
    params: { [severityParam(defect)]: value },
  }));
}

export default function GuideView({ step, journey, defectCandidateCount = 0, budgetPresets = [], summary }: { step: Step; journey: Journey; defectCandidateCount?: number; budgetPresets?: readonly number[]; summary?: ResultsSummary }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const transcript = useRef<HTMLOListElement>(null);
  const [isPending, startTransition] = useTransition();
  const order = questionStepsFor(journey.useCase);
  const defectAnswer = journey.defects[defect];
  const askingSeverity = step === "defects" && defectAnswer?.tolerance === "depends";
  const questionKey = summary ? "verdict" : askingSeverity ? "defects:severity" : step;
  const answered = askingSeverity || step === "review" ? order.length : order.indexOf(step);
  const progressLabels = progressLabelsFor(journey.useCase);
  const phase = Math.min(phaseOfStep(step, journey.useCase), progressLabels.length - 1);
  const catalog = catalogFor(journey.useCase) ?? [];
  const choices = step === "review" ? [] : askingSeverity ? severityChoices() : choicesFor(step, budgetPresets);
  const current = journeyParams(journey);
  const back = previousStep(step, journey);

  function selected(params: Record<string, string>) {
    return Object.entries(params).every(([key, value]) => current.get(key) === value);
  }

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (transcript.current) {
      if (summary && heading.current) {
        transcript.current.scrollTop += heading.current.getBoundingClientRect().top - transcript.current.getBoundingClientRect().top - 24;
      } else {
        transcript.current.scrollTop = transcript.current.scrollHeight;
      }
    }
  }, [questionKey, summary]);

  useEffect(() => {
    if (isPending && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [isPending]);

  function go(nextStep: Step, nextJourney: Journey) {
    setDraft("");
    setError("");
    startTransition(() => router.push(stepPath(nextStep, nextJourney)));
  }

  function answer(params: Record<string, string>) {
    const search = journeyParams(journey);
    for (const [key, value] of Object.entries(params)) search.set(key, value);
    const next = readJourney(search);
    go(firstIncompleteStep(next), next);
  }

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim();
    const chosen = choices.find((choice) => choice.label === value);
    if (chosen) {
      answer(chosen.params);
      return;
    }

    if (step === "budget" && !askingSeverity) {
      const digits = value
        .replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) - (digit >= "۰" ? 0x06f0 : 0x0660)))
        .replace(/[\s,٬]/g, "")
        .replace(/تومان$/, "");
      const budget = Number(digits);
      if (/^\d+$/.test(digits) && Number.isSafeInteger(budget) && budget > 0) {
        answer({ budget: String(budget) });
        return;
      }
      setError("بودجه را به‌صورت عدد کامل به تومان وارد کنید.");
      return;
    }

    setError("یکی از گزینه‌های نمایش‌داده‌شده را انتخاب کنید.");
  }

  const title = summary ? "پیشنهاد من برای شما" : askingSeverity
    ? `${defectLabels[defect]}: چه شدتی برای شما قابل قبول است؟`
    : step === "review"
      ? "انتخاب‌هایتان را مرور کنید."
      : stepTitle(step, journey);
  const requirementLabel = journey.useCase === "graphics" ? "جست‌وجوی نرم‌افزار" : "جست‌وجوی بازی";

  return (
    <div className={styles.guide}>
      {step === "usecase" && <IntroTransition />}
      <SiteHeader />
      <main className={styles.chat}>
        <div className={styles.sectionTitle} data-entry-content>
          <div><p>راهنمای انتخاب لپ‌تاپ استوک</p><h2>انتخاب مناسب، ارزش بیشتر</h2></div>
          <ol className={styles.progress} aria-label="مراحل گفت‌وگو">
            {progressLabels.map((label, index) => (
              <li key={label} aria-current={index === phase ? "step" : undefined}>
                <span key={`${index}-${index === phase ? "current" : index < phase ? "done" : "upcoming"}`} className={index < phase ? styles.done : undefined} aria-hidden="true">
                  {index < phase ? "✓" : numberFormat.format(index + 1)}
                </span>{label}
              </li>
            ))}
          </ol>
        </div>
        <ol ref={transcript} className={styles.transcript} data-entry-transcript aria-label="پیام‌ها" aria-busy={isPending}>
          {order.slice(0, answered).map((answeredStep, index) => (
            <li key={answeredStep} className={styles.exchange}>
              <Assistant>
                {index === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
                <p>{stepTitle(answeredStep, journey)}</p>
              </Assistant>
              <div className={`${styles.reply} ${index === answered - 1 ? styles.newMessage : ""}`}><span className={styles.speaker}>شما</span><p>{answerText(answeredStep, journey)}</p></div>
            </li>
          ))}
          <li key={questionKey} className={styles.newMessage} data-entry-message>
            <Assistant>
              {answered === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
              <h1 id="guide-title" ref={heading} tabIndex={-1} aria-label={title}><AnimatedText key={questionKey} text={title} /></h1>
              {step === "defects" && (
                <p className={styles.brief}>
                  {defectCandidateCount > 0
                    ? `${numberFormat.format(defectCandidateCount)} پیشنهاد در محدودهٔ کاربرد و بودجه، خط‌وخش بدنه را اعلام کرده‌اند.`
                    : "در پیشنهادهای فعلیِ این کاربرد و بودجه، خط‌وخش بدنه اعلام نشده است؛ برای بررسی اطلاعاتی که ممکن است ناقص باشد، میزان پذیرش خود را مشخص کنید."}
                </p>
              )}
              {summary ? <ResultsView journey={journey} summary={summary} /> : step === "review" ? (
                <dl className={styles.summary}>
                  {reviewRows(journey).map((row) => (
                    <div key={row.step}>
                      <dt>{row.name}</dt><dd>{row.answer}</dd>
                      <dd>
                        <Link
                          className={`${styles.button} ${styles.link}`}
                          aria-label={`ویرایش ${row.name}`}
                          href={row.href}
                        >
                          ویرایش
                        </Link>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : step === "requirement" ? (
                <SoftwarePicker
                  catalog={catalog}
                  classNames={{
                    root: styles.softwarePicker,
                    search: styles.softwareSearch,
                    list: styles.softwareList,
                    option: `${styles.button} ${styles.softwareOption}`,
                    latin: styles.softwareLatin,
                    empty: styles.softwareEmpty,
                  }}
                  label={requirementLabel}
                  selectedId={journey.requirement}
                  onPick={(id) => {
                    const next = withRequirement(journey, id);
                    go(firstIncompleteStep(next), next);
                  }}
                />
              ) : (
                <div className={styles.options} data-entry-choices aria-labelledby="guide-title" role="group">
                  {choices.map((choice) => (
                    <button
                      className={`${styles.button} ${selected(choice.params) ? styles.selected : ""}`}
                      key={choice.label}
                      type="button"
                      aria-pressed={selected(choice.params)}
                      onClick={() => answer(choice.params)}
                    >
                      <span>{choice.label}</span>
                      {choice.hint && <small className={styles.optionHint}>{choice.hint}</small>}
                    </button>
                  ))}
                </div>
              )}
            </Assistant>
          </li>
          {isPending && <li className={styles.thinking} role="status" aria-label="دستیار در حال فکر کردن است"><span /><span /><span /></li>}
        </ol>
        {step !== "review" && step !== "requirement" && (
          <form className={styles.composer} data-composer onSubmit={submitReply}>
            <input
              aria-label={step === "budget" && !askingSeverity ? "بودجه به تومان" : "پاسخ"}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "reply-error" : undefined}
              dir="auto"
              placeholder={step === "budget" && !askingSeverity ? "یا بودجه را به تومان وارد کنید…" : "یا یکی از گزینه‌ها را تایپ کنید…"}
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setError(""); }}
            />
            <button className={styles.send} type="submit" aria-label="ارسال پاسخ" disabled={!draft.trim()}>
              <svg viewBox="0 0 122.56 122.88" aria-hidden="true" focusable="false"><path fillRule="evenodd" d="M2.33,44.58,117.33.37a3.63,3.63,0,0,1,5,4.56l-44,115.61h0a3.63,3.63,0,0,1-6.67.28L53.93,84.14,89.12,33.77,38.85,68.86,2.06,51.24a3.63,3.63,0,0,1,.27-6.66Z" /></svg>
            </button>
          </form>
        )}
        {error && <p id="reply-error" className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions} data-entry-content>
          {step === "review" && !summary && (
            <Link className={`${styles.button} ${styles.link}`} href={resultsPath(journey)}>دیدن پیشنهادها</Link>
          )}
          {askingSeverity && (
            <button className={styles.textButton} type="button" onClick={() => go("defects", withoutDefectAnswer(journey, defect))}>
              تغییر پاسخ
            </button>
          )}
          {back && !askingSeverity && (
            <button className={styles.textButton} type="button" onClick={() => go(back, journey)}>مرحلهٔ قبل</button>
          )}
          {step === "usecase" && (
            <button className={styles.textButton} type="button" onClick={() => router.push("/")}>بازگشت</button>
          )}
        </div>
      </main>
    </div>
  );
}
