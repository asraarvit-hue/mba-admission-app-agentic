// Shortlisting Agent and Human Approval Logic

export interface ShortlistWeights {
  entrance: number; // e.g. 20
  graduation: number; // e.g. 20
  interview: number; // e.g. 50
  other: number; // e.g. 10
}

export interface CandidateData {
  isEligible: boolean;
  interviewCompleted: boolean;
  interviewScore: number | null; // out of 100
  entranceScorePct: number | null; // out of 100
  graduationPct: number | null; // out of 100
  otherScore: number | null; // out of 100
}

export interface ShortlistResult {
  overallScore: number | null;
  aiRecommendation: "SHORTLIST" | "MANUAL REVIEW";
  humanReviewRequired: boolean; // Always true by design
}

export class ShortlistingAgent {
  private weights: ShortlistWeights;

  constructor(weights: ShortlistWeights = { entrance: 20, graduation: 20, interview: 50, other: 10 }) {
    this.validateWeights(weights);
    this.weights = weights;
  }

  private validateWeights(weights: ShortlistWeights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      throw new Error(`Configured shortlisting weights must equal exactly 100%. Current total: ${total}%`);
    }
  }

  public evaluateCandidate(data: CandidateData): ShortlistResult {
    // Basic criteria check
    const basicCriteriaMet = 
      data.isEligible && 
      data.interviewCompleted && 
      data.interviewScore !== null && 
      data.interviewScore >= 70;

    let overallScore = null;
    
    // Deterministic overall score calculation
    if (data.interviewScore !== null && data.entranceScorePct !== null && data.graduationPct !== null && data.otherScore !== null) {
      overallScore = (
        (data.entranceScorePct * (this.weights.entrance / 100)) +
        (data.graduationPct * (this.weights.graduation / 100)) +
        (data.interviewScore * (this.weights.interview / 100)) +
        (data.otherScore * (this.weights.other / 100))
      );
    }

    return {
      overallScore: overallScore ? parseFloat(overallScore.toFixed(2)) : null,
      aiRecommendation: basicCriteriaMet ? "SHORTLIST" : "MANUAL REVIEW",
      humanReviewRequired: true // Hard constraint: AI never decides final selection
    };
  }
}
