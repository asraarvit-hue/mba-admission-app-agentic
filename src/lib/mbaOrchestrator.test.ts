import { MBAOrchestrator, ApplicantState } from "./mbaOrchestrator";

function runTests() {
  console.log("Running End-to-End Orchestrator Simulation...\n");
  const orchestrator = new MBAOrchestrator();

  let applicant: ApplicantState = {
    applicantId: "MBA2026001",
    status: "DRAFT"
  };

  try {
    // 1. Submit
    applicant = orchestrator.transitionState(applicant, "SUBMITTED");
    orchestrator.logActivity(applicant.applicantId, "Application Agent", "Application submitted", "SUCCESS");

    // 2. Document Verification
    applicant = orchestrator.transitionState(applicant, "DOCUMENT_VERIFICATION");
    orchestrator.logActivity(applicant.applicantId, "Document Verification Agent", "Documents verified", "SUCCESS");

    // 3. Eligibility
    applicant = orchestrator.transitionState(applicant, "ELIGIBILITY_CHECK");
    orchestrator.logActivity(applicant.applicantId, "Eligibility Agent", "Eligibility Agent executed", "SUCCESS");
    
    applicant = orchestrator.transitionState(applicant, "ELIGIBLE");
    orchestrator.logActivity(applicant.applicantId, "Eligibility Agent", "Applicant eligible", "SUCCESS");

    // 4. Interview Setup
    applicant = orchestrator.transitionState(applicant, "INTERVIEW_PENDING");
    applicant = orchestrator.transitionState(applicant, "INTERVIEW_SCHEDULED");
    orchestrator.logActivity(applicant.applicantId, "Interview Agent", "Interview scheduled", "SUCCESS");

    // 5. Interview Completed
    applicant = orchestrator.transitionState(applicant, "INTERVIEW_COMPLETED");
    orchestrator.logActivity(applicant.applicantId, "AI Interview Agent", "Transcript generated", "SUCCESS");

    // 6. Evaluation
    applicant = orchestrator.transitionState(applicant, "AI_EVALUATION");
    orchestrator.logActivity(applicant.applicantId, "Evaluation Agent", "Interview Score: 86/100", "SUCCESS");

    // 7. Shortlist
    applicant = orchestrator.transitionState(applicant, "AI_SHORTLISTED");
    orchestrator.logActivity(applicant.applicantId, "Shortlisting Agent", "AI Recommendation: SHORTLIST", "SUCCESS");

    // 8. Human Review (Officer View)
    applicant = orchestrator.transitionState(applicant, "AWAITING_ADMISSION_APPROVAL");
    
    // 9. Officer Approval -> Selection
    applicant = orchestrator.transitionState(applicant, "SELECTED");
    orchestrator.logActivity(applicant.applicantId, "Human Admission Officer", "Approved applicant", "SUCCESS");

    // 10. Communication
    orchestrator.logActivity(applicant.applicantId, "Communication Agent", "Sent SELECTION email", "SUCCESS");

    console.log(`\n✅ End-to-End Test Passed. Final Status: ${applicant.status}`);

    // Security Test: Try to jump from SUBMITTED to SELECTED
    console.log("\nRunning Security Test: Jump to SELECTED without passing review...");
    let rogueApplicant: ApplicantState = {
      applicantId: "MBA2026002",
      status: "SUBMITTED"
    };
    try {
      orchestrator.transitionState(rogueApplicant, "SELECTED");
      console.log("❌ FAIL: System allowed invalid transition.");
    } catch (e: any) {
      console.log(`✅ PASS: System blocked invalid transition. Reason: ${e.message}`);
    }

  } catch (error) {
    console.error("Test Failed:", error);
  }
}

runTests();
