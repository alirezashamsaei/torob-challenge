"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import styles from "./guide.module.css";
import { Assistant, SiteHeader } from "./chrome";
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
} from "./journey";
import { catalogFor } from "./requirements";
import SoftwarePicker from "./software-picker";
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

const presetBudgets = [18_000_000, 25_000_000, 40_000_000];
const defect = defects[0];

type Choice = { label: string; hint?: string; params: Record<string, string> };

function choicesFor(step: QuestionStep): Choice[] {
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
      return presetBudgets.map((value) => ({
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

export default function GuideView({ step, journey }: { step: Step; journey: Journey }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const order = questionStepsFor(journey.useCase);
  const defectAnswer = journey.defects[defect];
  const askingSeverity = step === "defects" && defectAnswer?.tolerance === "depends";
  const questionKey = askingSeverity ? "defects:severity" : step;
  const answered = askingSeverity || step === "review" ? order.length : order.indexOf(step);
  const progressLabels = progressLabelsFor(journey.useCase);
  const phase = Math.min(phaseOfStep(step, journey.useCase), progressLabels.length - 1);
  const catalog = catalogFor(journey.useCase) ?? [];
  const choices = step === "review" ? [] : askingSeverity ? severityChoices() : choicesFor(step);
  const current = journeyParams(journey);
  const back = previousStep(step, journey);

  function selected(params: Record<string, string>) {
    return Object.entries(params).every(([key, value]) => current.get(key) === value);
  }

  useEffect(() => {
    heading.current?.focus();
  }, [questionKey]);

  function go(nextStep: Step, nextJourney: Journey) {
    setDraft("");
    setError("");
    router.push(stepPath(nextStep, nextJourney));
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

  const title = askingSeverity
    ? `${defectLabels[defect]}: چه شدتی برای شما قابل قبول است؟`
    : step === "review"
      ? "انتخاب‌هایتان را مرور کنید."
      : stepTitle(step, journey);
  const requirementLabel = journey.useCase === "graphics" ? "جست‌وجوی نرم‌افزار" : "جست‌وجوی بازی";

  return (
    <div className={styles.guide}>
      <SiteHeader />
      <main className={styles.chat}>
        <div className={styles.sectionTitle}>
          <div><p>راهنمای انتخاب لپ‌تاپ استوک</p><h2>انتخاب مناسب، ارزش بیشتر</h2></div>
          <ol className={styles.progress} aria-label="مراحل گفت‌وگو">
            {progressLabels.map((label, index) => (
              <li key={label} aria-current={index === phase ? "step" : undefined}>
                <span className={index < phase ? styles.done : undefined} aria-hidden="true">
                  {index < phase ? "✓" : numberFormat.format(index + 1)}
                </span>{label}
              </li>
            ))}
          </ol>
        </div>
        <ol className={styles.transcript} aria-label="پیام‌ها">
          {order.slice(0, answered).map((answeredStep, index) => (
            <li key={answeredStep} className={styles.exchange}>
              <Assistant>
                {index === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
                <p>{stepTitle(answeredStep, journey)}</p>
              </Assistant>
              <div className={styles.reply}><span className={styles.speaker}>شما</span><p>{answerText(answeredStep, journey)}</p></div>
            </li>
          ))}
          <li>
            <Assistant>
              {answered === 0 && <p>سلام! بیایید لپ‌تاپ استوک مناسبتان را پیدا کنیم.</p>}
              <h1 id="guide-title" ref={heading} tabIndex={-1}>{title}</h1>
              {step === "review" ? (
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
                    option: styles.softwareOption,
                    latin: styles.softwareLatin,
                    empty: styles.softwareEmpty,
                  }}
                  label={requirementLabel}
                  selectedId={journey.requirement}
                  onPick={(id) => answer({ requirement: id })}
                />
              ) : (
                <div className={styles.options} aria-labelledby="guide-title" role="group">
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
        </ol>
        {step !== "review" && step !== "requirement" && (
          <form className={styles.composer} onSubmit={submitReply}>
            <input
              aria-label={step === "budget" && !askingSeverity ? "بودجه به تومان" : "پاسخ"}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "reply-error" : undefined}
              dir="auto"
              placeholder={step === "budget" && !askingSeverity ? "یا بودجه را به تومان وارد کنید…" : "یا یکی از گزینه‌ها را تایپ کنید…"}
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setError(""); }}
            />
            <button className={styles.send} type="submit" aria-label="ارسال پاسخ" disabled={!draft.trim()}>↑</button>
          </form>
        )}
        {error && <p id="reply-error" className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          {step === "review" && (
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
