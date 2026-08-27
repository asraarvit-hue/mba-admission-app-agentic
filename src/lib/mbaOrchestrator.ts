// MBA Admission Orchestrator

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENT_VERIFICATION"
  | "ELIGIBILITY_CHECK"
  | "NOT_ELIGIBLE"
  | "ELIGIBLE"
  | "INTERVIEW_PENDING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "AI_EVALUATION"
  | "AI_SHORTLISTED"
  | "AWAITING_ADMISSION_APPROVAL"
  | "SELECTED"
  | "REJECTED"
  | "MANUAL_REVIEW_REQUIRED";

export interface ApplicantState {
  applicantId: string;
  status: ApplicationStatus;
}

export class MBAOrchestrator {
  private allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    DRAFT: ["SUBMITTED"],
    SUBMITTED: ["DOCUMENT_VERIFICATION", "MANUAL_REVIEW_REQUIRED"],
    DOCUMENT_VERIFICATION: ["ELIGIBILITY_CHECK", "MANUAL_REVIEW_REQUIRED"],
    ELIGIBILITY_CHECK: ["NOT_ELIGIBLE", "ELIGIBLE", "MANUAL_REVIEW_REQUIRED"],
    NOT_ELIGIBLE: [],
    ELIGIBLE: ["INTERVIEW_PENDING", "MANUAL_REVIEW_REQUIRED"],
    INTERVIEW_PENDING: ["INTERVIEW_SCHEDULED", "MANUAL_REVIEW_REQUIRED"],
    INTERVIEW_SCHEDULED: ["INTERVIEW_COMPLETED", "MANUAL_REVIEW_REQUIRED"],
    INTERVIEW_COMPLETED: ["AI_EVALUATION", "MANUAL_REVIEW_REQUIRED"],
    AI_EVALUATION: ["AI_SHORTLISTED", "MANUAL_REVIEW_REQUIRED"],
    AI_SHORTLISTED: ["AWAITING_ADMISSION_APPROVAL", "MANUAL_REVIEW_REQUIRED"],
    AWAITING_ADMISSION_APPROVAL: ["SELECTED", "REJECTED", "MANUAL_REVIEW_REQUIRED"],
    SELECTED: [],
    REJECTED: [],
    MANUAL_REVIEW_REQUIRED: [
      "DOCUMENT_VERIFICATION",
      "ELIGIBILITY_CHECK",
      "INTERVIEW_PENDING",
      "AI_EVALUATION",
      "AWAITING_ADMISSION_APPROVAL",
      "REJECTED"
    ], // Recovery paths
  };

  public transitionState(state: ApplicantState, nextStatus: ApplicationStatus): ApplicantState {
    const validNextStates = this.allowedTransitions[state.status];
    if (!validNextStates.includes(nextStatus)) {
      throw new Error(`Invalid state transition from ${state.status} to ${nextStatus}.`);
    }
    
    // SECURITY HARD STOP: Ensure SELECTED/REJECTED is only reached from human approval
    if (nextStatus === "SELECTED" && state.status !== "AWAITING_ADMISSION_APPROVAL") {
      throw new Error("SECURITY ALERT: Cannot jump to SELECTED without passing through AWAITING_ADMISSION_APPROVAL.");
    }
    
    state.status = nextStatus;
    return state;
  }

  public logActivity(applicantId: string, agentName: string, action: string, status: "SUCCESS" | "FAILED", details?: string) {
    // In a real system, insert into AgentActivityLog table
    console.log(`[AGENT LOG] ${new Date().toLocaleTimeString()} — ${agentName}: ${action} [${status}] ${details ? '- ' + details : ''}`);
  }

  public handleError(state: ApplicantState, error: any): ApplicantState {
    console.error(`ORCHESTRATOR ERROR on applicant ${state.applicantId}:`, error);
    this.logActivity(state.applicantId, "Orchestrator", "Failure Recovery Triggered", "FAILED", error.message);
    return this.transitionState(state, "MANUAL_REVIEW_REQUIRED");
  }
}
