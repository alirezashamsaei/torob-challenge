import { defects } from "./journey";
import type { DefectId, Journey, Priority, QuestionStep, Severity, Step, Tolerance, UseCase } from "./journey";

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

export const defectLabels: Record<DefectId, string> = {
  chassisScratch: "خط‌وخش روی بدنه",
};

export const stepNames: Record<QuestionStep, string> = {
  usecase: "کاربری",
  budget: "بودجه",
  priority: "اولویت",
  defects: "ایرادها",
};

export const stepTitles: Record<QuestionStep, string> = {
  usecase: "لپ‌تاپ را بیشتر برای چه کاری می‌خواهید؟",
  budget: "چه بودجه‌ای برای لپ‌تاپ در نظر دارید؟",
  priority: "کدام ویژگی برای شما مهم‌تر است؟",
  defects: "خط‌وخش روی بدنه برای شما قابل قبول است؟",
};

export const progressLabels = ["کاربری", "بودجه", "جزئیات"] as const;

const phaseOf: Record<Step, number> = {
  usecase: 0,
  budget: 1,
  priority: 2,
  defects: 2,
  review: 3,
};

export function phaseOfStep(step: Step): number {
  return phaseOf[step];
}

export function answerText(step: QuestionStep, journey: Journey): string {
  switch (step) {
    case "usecase":
      return journey.useCase ? useCaseLabels[journey.useCase] : "";
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
