import { defects, needsRequirement, questionStepsFor, stepPath } from "./journey";
import type {
  DefectId,
  Expectation,
  Journey,
  Priority,
  QuestionStep,
  Severity,
  Step,
  Tolerance,
  UseCase,
} from "./journey";
import { findRequirement } from "./requirements";

export const numberFormat = new Intl.NumberFormat("fa-IR");

export const useCaseLabels: Record<UseCase, string> = {
  everyday: "روزمره و تحصیل",
  office: "کار اداری",
  gaming: "بازی",
  graphics: "کار گرافیکی",
};

export const priorityLabels: Record<Priority, string> = {
  price: "قیمت کمتر",
  performance: "عملکرد بهتر",
  condition: "وضعیت بهتر دستگاه",
};

export const toleranceLabels: Record<Tolerance, string> = {
  acceptable: "قابل قبول",
  unacceptable: "غیرقابل قبول",
  depends: "بستگی به شدت دارد",
};

export const severityLabels: Record<Severity, string> = {
  minor: "جزئی",
  major: "شدید",
};

export const expectationLabels: Record<Expectation, string> = {
  basic: "قابل اجرا",
  balanced: "روان",
  high: "بالاترین کیفیت",
};

export const expectationHints: Record<Expectation, string> = {
  basic: "با تنظیمات پایین و بدون انتظار جزئیات زیاد",
  balanced: "ترکیب خوبی از روانی و جزئیات",
  high: "بالاترین تنظیمات گرافیکی برای بیشترین جزئیات",
};

export const defectLabels: Record<DefectId, string> = {
  chassisScratch: "خط‌وخش روی بدنه",
};

export const stepNames: Record<QuestionStep, string> = {
  usecase: "کاربری",
  requirement: "بازی یا نرم‌افزار",
  expectation: "سطح انتظار",
  budget: "بودجه",
  priority: "اولویت",
  defects: "ایرادها",
};

export function stepTitle(step: QuestionStep, journey: Journey): string {
  switch (step) {
    case "usecase":
      return "لپ‌تاپ را بیشتر برای چه کاری می‌خواهید؟";
    case "requirement":
      return journey.useCase === "graphics"
        ? "بیشتر با چه نرم‌افزاری کار می‌کنید؟"
        : "بیشتر چه بازی‌ای را بازی می‌کنید؟";
    case "expectation":
      return "چه سطحی از عملکرد برایتان کافی است؟";
    case "budget":
      return "چه بودجه‌ای برای لپ‌تاپ در نظر دارید؟";
    case "priority":
      return "کدام ویژگی برای شما مهم‌تر است؟";
    case "defects":
      return "خط‌وخش روی بدنه برای شما قابل قبول است؟";
  }
}

export function progressLabelsFor(useCase: UseCase | undefined): readonly string[] {
  return needsRequirement(useCase)
    ? ["کاربری", "بازی یا نرم‌افزار", "بودجه", "جزئیات"]
    : ["کاربری", "بودجه", "جزئیات"];
}

export function phaseOfStep(step: Step, useCase: UseCase | undefined): number {
  const offset = needsRequirement(useCase) ? 1 : 0;
  switch (step) {
    case "usecase":
      return 0;
    case "requirement":
    case "expectation":
      return 1;
    case "budget":
      return 1 + offset;
    case "priority":
    case "defects":
    case "review":
      return 2 + offset;
  }
}

export function answerText(step: QuestionStep, journey: Journey): string {
  switch (step) {
    case "usecase":
      return journey.useCase ? useCaseLabels[journey.useCase] : "";
    case "requirement": {
      const item = journey.requirement ? findRequirement(journey.useCase, journey.requirement) : undefined;
      return item ? item.label : "";
    }
    case "expectation":
      return journey.expectation ? expectationLabels[journey.expectation] : "";
    case "budget":
      return journey.budget === undefined ? "" : `${numberFormat.format(journey.budget)} تومان`;
    case "priority":
      return journey.priority ? priorityLabels[journey.priority] : "";
    case "defects":
      return defects
        .flatMap((id) => {
          const answer = journey.defects[id];
          if (!answer) return [];
          return [
            answer.severity
              ? `${toleranceLabels[answer.tolerance]} · ${severityLabels[answer.severity]}`
              : toleranceLabels[answer.tolerance],
          ];
        })
        .join(" / ");
  }
}

export type ReviewRow = {
  step: QuestionStep;
  name: string;
  answer: string;
  href: string;
};

export function reviewRows(journey: Journey): ReviewRow[] {
  return questionStepsFor(journey.useCase).map((step) => ({
    step,
    name: stepNames[step],
    answer: answerText(step, journey),
    href: stepPath(step, journey),
  }));
}
