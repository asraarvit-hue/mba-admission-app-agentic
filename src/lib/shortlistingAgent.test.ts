import { ShortlistingAgent, CandidateData } from "./shortlistingAgent";

function runTests() {
  console.log("Running Shortlisting Agent Tests...\n");
  const agent = new ShortlistingAgent();

  const perfectCandidate: CandidateData = {
    isEligible: true,
    interviewCompleted: true,
    interviewScore: 90,
    entranceScorePct: 95,
    graduationPct: 88,
    otherScore: 100
  };

  const weakCandidate: CandidateData = {
    isEligible: true,
    interviewCompleted: true,
    interviewScore: 60, // Below 70
    entranceScorePct: 60,
    graduationPct: 60,
    otherScore: 60
  };

  console.log("--- Perfect Candidate ---");
  const pResult = agent.evaluateCandidate(perfectCandidate);
  console.log(`AI Recommendation: ${pResult.aiRecommendation} (Expected: SHORTLIST)`);
  console.log(`Human Review Required: ${pResult.humanReviewRequired} (Expected: true)`);
  console.log(`Overall Score: ${pResult.overallScore}`);
  
  if (pResult.aiRecommendation === "SHORTLIST" && pResult.humanReviewRequired === true) {
    console.log("✅ PASS: AI recommends shortlisting, but human review remains required. No auto-selection.");
  } else {
    console.log("❌ FAIL");
  }

  console.log("\n--- Weak Candidate ---");
  const wResult = agent.evaluateCandidate(weakCandidate);
  console.log(`AI Recommendation: ${wResult.aiRecommendation} (Expected: MANUAL REVIEW)`);
  console.log(`Human Review Required: ${wResult.humanReviewRequired} (Expected: true)`);
  console.log(`Overall Score: ${wResult.overallScore}`);

  if (wResult.aiRecommendation === "MANUAL REVIEW" && wResult.humanReviewRequired === true) {
    console.log("✅ PASS: AI recommends manual review. No auto-rejection.");
  } else {
    console.log("❌ FAIL");
  }

}

runTests();
