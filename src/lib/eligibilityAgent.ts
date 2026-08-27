// Eligibility Agent Logic

export interface AcademicRecord {
  class10Percentage: number | null;
  class12Percentage: number | null;
}

export interface EligibilityResult {
  isEligible: boolean;
  status: "ELIGIBLE" | "NOT ELIGIBLE";
  reason: string;
}

export function calculateEligibility(
  record: AcademicRecord,
  minClass10: number = 60,
  minClass12: number = 60
): EligibilityResult {
  const { class10Percentage, class12Percentage } = record;

  if (class10Percentage === null || class12Percentage === null) {
    return {
      isEligible: false,
      status: "NOT ELIGIBLE",
      reason: "Class 10 or Class 12 percentage is missing.",
    };
  }

  const isClass10Eligible = class10Percentage >= minClass10;
  const isClass12Eligible = class12Percentage >= minClass12;

  if (isClass10Eligible && isClass12Eligible) {
    return {
      isEligible: true,
      status: "ELIGIBLE",
      reason: `Applicant satisfies the minimum ${minClass10}% requirement in both Class 10 and Class 12.`,
    };
  }

  if (!isClass12Eligible && isClass10Eligible) {
    return {
      isEligible: false,
      status: "NOT ELIGIBLE",
      reason: `Class 12 percentage is ${class12Percentage}%, which is below the minimum requirement of ${minClass12}%.`,
    };
  }

  if (!isClass10Eligible && isClass12Eligible) {
    return {
      isEligible: false,
      status: "NOT ELIGIBLE",
      reason: `Class 10 percentage is ${class10Percentage}%, which is below the minimum requirement of ${minClass10}%.`,
    };
  }

  return {
    isEligible: false,
    status: "NOT ELIGIBLE",
    reason: `Class 10 (${class10Percentage}%) and Class 12 (${class12Percentage}%) are both below the minimum requirement.`,
  };
}
