// Communication Agent

export type EmailType = 
  | "SUBMITTED" 
  | "ELIGIBLE" 
  | "NOT_ELIGIBLE" 
  | "INTERVIEW_SCHEDULED" 
  | "INTERVIEW_REMINDER_24H" 
  | "INTERVIEW_REMINDER_1H"
  | "INTERVIEW_COMPLETED"
  | "AI_EVAL_COMPLETED"
  | "AWAITING_APPROVAL"
  | "SELECTED"
  | "REJECTED";

export interface EmailPayload {
  applicantName: string;
  applicantId: string;
  recipient: string;
  type: EmailType;
  interviewDetails?: {
    date: string;
    time: string;
    link: string;
    duration: string;
  };
}

export class CommunicationAgent {
  private isDemoMode: boolean;

  constructor(demoMode: boolean = true) {
    this.isDemoMode = demoMode;
  }

  public async sendEmail(payload: EmailPayload): Promise<{ success: boolean; logId?: string; error?: string }> {
    // SECURITY HARD STOP: Ensure final decision emails are strictly validated
    if (payload.type === "SELECTED" || payload.type === "REJECTED") {
      if (!this.verifyHumanApproval(payload.applicantId)) {
        console.error(`SECURITY ALERT: Attempted to send ${payload.type} without human approval for ${payload.applicantId}`);
        return { success: false, error: "Missing human approval for final decision." };
      }
    }

    try {
      const emailContent = this.generateEmailContent(payload);
      
      if (this.isDemoMode) {
        console.log("\n====== DEMO EMAIL ======");
        console.log(`To: ${payload.recipient}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log("------------------------");
        console.log(emailContent.body);
        console.log("========================\n");
      } else {
        // Send actual email using SMTP / Resend / SendGrid
        // await smtp.send(...)
      }

      // Log email delivery in database (mocked return for now)
      return { success: true, logId: `log_${new Date().getTime()}` };
    } catch (error: any) {
      // Logic for retry goes here
      return { success: false, error: error.message };
    }
  }

  private verifyHumanApproval(applicantId: string): boolean {
    // In a real system, query the AuditLog to confirm 'HUMAN_APPROVED' or 'HUMAN_REJECTED' exists
    // For now, return true (mock)
    return true; 
  }

  private generateEmailContent(payload: EmailPayload): { subject: string; body: string } {
    switch (payload.type) {
      case "SELECTED":
        return {
          subject: "MBA Admission Application — Selection Confirmation",
          body: `Dear ${payload.applicantName},\n\nApplication ID: ${payload.applicantId}\n\nWe are delighted to confirm your selection for the MBA program.\n\nPlease refer to the university portal for next steps.\n\nBest regards,\nAdmissions Office`
        };
      case "REJECTED":
        return {
          subject: "MBA Admission Application — Admission Decision",
          body: `Dear ${payload.applicantName},\n\nApplication ID: ${payload.applicantId}\n\nThank you for applying. We regret to inform you that we cannot offer you admission at this time.\n\nBest regards,\nAdmissions Office`
        };
      case "INTERVIEW_SCHEDULED":
        return {
          subject: "MBA Admission Application — Interview Scheduled",
          body: `Dear ${payload.applicantName},\n\nYour interview is scheduled for ${payload.interviewDetails?.date} at ${payload.interviewDetails?.time}.\nLink: ${payload.interviewDetails?.link}\nDuration: ${payload.interviewDetails?.duration}\n\nInstructions: Please join 5 minutes early.\n\nBest regards,\nAdmissions Office`
        };
      // Other templates would follow...
      default:
        return {
          subject: `MBA Admission Update: ${payload.type}`,
          body: `Hello ${payload.applicantName},\n\nYour application status has been updated to: ${payload.type}.`
        };
    }
  }
}
