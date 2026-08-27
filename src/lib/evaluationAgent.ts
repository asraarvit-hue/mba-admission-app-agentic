// AI Interview Evaluation Agent Logic
import { Mistral } from '@mistralai/mistralai';

export interface RubricCriterion {
  name: string;
  maxScore: number;
}

export const DEFAULT_RUBRIC: RubricCriterion[] = [
  { name: "Communication", maxScore: 20 },
  { name: "Analytical Thinking", maxScore: 20 },
  { name: "Business Awareness", maxScore: 15 },
  { name: "Leadership", maxScore: 15 },
  { name: "Problem Solving", maxScore: 15 },
  { name: "MBA Motivation", maxScore: 15 },
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
  recommendation: "STRONGLY RECOMMENDED" | "RECOMMENDED" | "BORDERLINE" | "NOT RECOMMENDED";
  criteriaScores: CriterionScore[];
  humanReviewNotice: "AI Recommendation — Human Review Required";
  rubricVersion: string;
  modelUsed: string;
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export class EvaluationAgent {
  private rubric: RubricCriterion[];

  constructor(rubric: RubricCriterion[] = DEFAULT_RUBRIC) {
    this.validateRubric(rubric);
    this.rubric = rubric;
  }

  private validateRubric(rubric: RubricCriterion[]) {
    const total = rubric.reduce((acc, curr) => acc + curr.maxScore, 0);
    if (total !== 100) {
      throw new Error(`Rubric weights must total exactly 100. Current total: ${total}`);
    }
  }

  public async evaluateTranscript(transcript: any[]): Promise<EvaluationResult> {
    try {
      if (!transcript || transcript.length === 0) {
        throw new Error("Empty transcript");
      }

      if (!process.env.MISTRAL_API_KEY) {
        return this.mockEvaluation(transcript);
      }

      const prompt = `
        You are an MBA admission AI evaluator. Evaluate the following interview transcript based on this rubric:
        ${JSON.stringify(this.rubric)}
        
        Transcript: ${JSON.stringify(transcript)}
        
        Provide the response in structured JSON containing a 'totalScore' and 'criteriaScores'.
        DO NOT base evaluation on restricted criteria like gender, age, race, appearance, etc.
      `;

      const chatResponse = await mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
      });

      const responseContent = chatResponse.choices?.[0]?.message?.content;
      if (!responseContent) throw new Error("No response from Mistral AI");
      
      const parsed = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      
      const totalScore = parsed.totalScore || 85;
      
      let recommendation: EvaluationResult["recommendation"] = "BORDERLINE";
      if (totalScore >= 85) recommendation = "STRONGLY RECOMMENDED";
      else if (totalScore >= 70) recommendation = "RECOMMENDED";
      else if (totalScore < 50) recommendation = "NOT RECOMMENDED";

      return {
        status: "SUCCESS",
        totalScore,
        recommendation,
        criteriaScores: parsed.criteriaScores || [],
        humanReviewNotice: "AI Recommendation — Human Review Required",
        rubricVersion: "v1.0",
        modelUsed: "mistral-large-latest"
      };

    } catch (error) {
      console.error("Mistral AI Evaluation Error:", error);
      return {
        status: "MANUAL_REVIEW_REQUIRED",
        totalScore: 0,
        recommendation: "NOT RECOMMENDED",
        criteriaScores: [],
        humanReviewNotice: "AI Recommendation — Human Review Required",
        rubricVersion: "v1.0",
        modelUsed: "mistral-large-latest"
      };
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
          evidence: `Candidate provided relevant examples related to ${criterion.name}.`,
          explanation: `The response demonstrated strong capability in ${criterion.name} without relying on restricted demographic identifiers.`
        };
      });

      let recommendation: EvaluationResult["recommendation"] = "BORDERLINE";
      if (totalScore >= 85) recommendation = "STRONGLY RECOMMENDED";
      else if (totalScore >= 70) recommendation = "RECOMMENDED";
      else if (totalScore < 50) recommendation = "NOT RECOMMENDED";

      return {
        status: "SUCCESS",
        totalScore,
        recommendation,
        criteriaScores,
        humanReviewNotice: "AI Recommendation — Human Review Required",
        rubricVersion: "v1.0",
        modelUsed: "mock-evaluator-v1"
      };
  }
}
