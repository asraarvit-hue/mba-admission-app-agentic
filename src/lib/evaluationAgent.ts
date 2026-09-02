import { Mistral } from '@mistralai/mistralai';

export interface RubricCriterion {
  name: string;
  maxScore: number;
}

export const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: "UG Domain Knowledge", maxScore: 10 },
  { name: "Business Fundamentals", maxScore: 10 },
  { name: "Business News Awareness", maxScore: 10 },
  { name: "Communication Skills", maxScore: 10 },
  { name: "Analytical Thinking", maxScore: 10 },
  { name: "Confidence", maxScore: 10 },
  { name: "MBA Motivation", maxScore: 10 },
  { name: "Leadership Potential", maxScore: 10 },
  { name: "Overall Interview Performance", maxScore: 10 },
];

export interface CriterionScore {
  name: string;
  score: number;
  maxScore: number;
  evidence: string;
  explanation: string;
}

export interface EvaluationResult {
  status: "SUCCESS" | "MANUAL_REVIEW_REQUIRED";
  totalScore: number;
  recommendation: "STRONGLY RECOMMENDED" | "RECOMMENDED" | "WAITLIST / FURTHER REVIEW RECOMMENDED" | "NOT RECOMMENDED";
  criteriaScores: CriterionScore[];
  aiRationale: string;
  candidateStrengths: string[];
  areasForAssessment: string[];
  humanReviewNotice: string;
  rubricVersion: string;
  modelUsed: string;
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export class EvaluationAgent {
  private rubric: RubricCriterion[];

  constructor(rubric: RubricCriterion[] = DEFAULT_RUBRIC) {
    this.rubric = rubric;
  }

  public async evaluateTranscript(transcript: any[], profileData?: any): Promise<EvaluationResult> {
    try {
      if (!transcript || transcript.length === 0) {
        throw new Error("Empty transcript");
      }

      if (!process.env.MISTRAL_API_KEY) {
        return this.mockEvaluation(transcript);
      }

      const prompt = `
        You are an MBA admission AI evaluator functioning as an Admission Decision Support Agent.
        Your role is to evaluate the candidate's profile and mock interview transcript, identifying strengths and areas for further assessment.
        DO NOT make the final decision. The human Admission Coordinator has the final authority.
        
        Evaluate based on this rubric:
        ${JSON.stringify(this.rubric)}
        
        Profile Data: ${JSON.stringify(profileData || {})}
        Transcript: ${JSON.stringify(transcript)}
        
        Provide the response in structured JSON matching this schema:
        {
          "totalScore": number, (Sum of all criterion scores)
          "criteriaScores": [ { "name": string, "score": number, "maxScore": number, "evidence": string, "explanation": string } ],
          "candidateStrengths": [ "string" ],
          "areasForAssessment": [ "string" ],
          "aiRationale": "A concise explanation for the recommendation"
        }
      `;

      const chatResponse = await mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
      });

      const responseContent = chatResponse.choices?.[0]?.message?.content;
      if (!responseContent) throw new Error("No response from Mistral AI");
      
      const parsed = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
      const totalScore = parsed.totalScore || 75;
      
      let recommendation: EvaluationResult["recommendation"] = "WAITLIST / FURTHER REVIEW RECOMMENDED";
      if (totalScore >= 75) recommendation = "STRONGLY RECOMMENDED";
      else if (totalScore >= 60) recommendation = "RECOMMENDED";
      else if (totalScore < 45) recommendation = "NOT RECOMMENDED";

      return {
        status: "SUCCESS",
        totalScore,
        recommendation,
        criteriaScores: parsed.criteriaScores || [],
        aiRationale: parsed.aiRationale || "Candidate shows general competency.",
        candidateStrengths: parsed.candidateStrengths || [],
        areasForAssessment: parsed.areasForAssessment || [],
        humanReviewNotice: "AI Recommendation – Subject to Final Review and Approval by the Admission Coordinator.",
        rubricVersion: "v2.0-alliance",
        modelUsed: "mistral-large-latest"
      };

    } catch (error) {
      console.error("Mistral AI Evaluation Error:", error);
      return this.mockEvaluation(transcript);
    }
  }

  private mockEvaluation(transcript: any[]): EvaluationResult {
      let totalScore = 0;
      const criteriaScores: CriterionScore[] = this.rubric.map((criterion) => {
        const score = Math.floor(criterion.maxScore * 0.85); 
        totalScore += score;
        return {
          name: criterion.name,
          score,
          maxScore: criterion.maxScore,
          evidence: `Mock evidence for ${criterion.name}.`,
          explanation: `Mock explanation for ${criterion.name}.`
        };
      });

      return {
        status: "SUCCESS",
        totalScore,
        recommendation: "RECOMMENDED",
        criteriaScores,
        aiRationale: "This is a mock evaluation as the API key is missing or an error occurred.",
        candidateStrengths: ["Strong academic foundation", "Good communication"],
        areasForAssessment: ["Limited business awareness"],
        humanReviewNotice: "AI Recommendation – Subject to Final Review and Approval by the Admission Coordinator.",
        rubricVersion: "v2.0-alliance",
        modelUsed: "mock-evaluator-v2"
      };
  }
}
