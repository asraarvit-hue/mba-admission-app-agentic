// AI MBA Video Interview Agent Logic

export interface InterviewState {
  currentQuestionIndex: number;
  followUpCount: number;
  questions: string[];
  transcript: Array<{
    question: string;
    candidateResponse: string;
    timestamp: string;
    isFollowUp: boolean;
  }>;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
  durationMins: number;
  consentGiven: boolean;
}

export const QUESTION_BANK = [
  "Why do you want to pursue an MBA?",
  "Tell us about your academic or professional background.",
  "What is one major business challenge facing Indian companies today?",
  "A company's sales have fallen by 20%. How would you investigate the problem?",
  "Tell us about a situation where you had to work as part of a team.",
  "Describe a situation where you demonstrated leadership.",
  "Suppose you are a manager and two team members strongly disagree about an important business decision. How would you handle it?",
  "A company has ₹10 crore available for expansion. Would you invest in technology, marketing, or geographical expansion? Explain your reasoning."
];

export class InterviewAgent {
  private state: InterviewState;
  
  constructor() {
    this.state = {
      currentQuestionIndex: 0,
      followUpCount: 0,
      questions: QUESTION_BANK,
      transcript: [],
      status: "NOT_STARTED",
      durationMins: 0,
      consentGiven: false,
    };
  }

  public giveConsent(): void {
    this.state.consentGiven = true;
  }

  public startInterview(): string {
    if (!this.state.consentGiven) {
      throw new Error("Cannot start interview: Explicit consent is required.");
    }
    this.state.status = "IN_PROGRESS";
    return this.state.questions[this.state.currentQuestionIndex];
  }

  public recordResponse(response: string, timestamp: string = new Date().toISOString()): string | null {
    if (this.state.status !== "IN_PROGRESS") {
      throw new Error("Interview is not in progress.");
    }

    // Record the current question and response
    const currentQ = this.state.questions[this.state.currentQuestionIndex];
    this.state.transcript.push({
      question: currentQ,
      candidateResponse: response,
      timestamp,
      isFollowUp: this.state.followUpCount > 0
    });

    // Determine if we should ask a follow-up or move to the next question
    // AI Follow-up logic mock (normally this would call an LLM)
    const shouldAskFollowUp = this.evaluateNeedForFollowUp(response);
    
    if (shouldAskFollowUp && this.state.followUpCount < 2) {
      this.state.followUpCount++;
      // Mock generated follow-up
      const followUpQ = `Can you elaborate more on why you chose that approach for: "${response.substring(0, 20)}..."?`;
      
      // Temporarily set the question as the follow-up without advancing index
      this.state.questions[this.state.currentQuestionIndex] = followUpQ;
      return followUpQ;
    }

    // Move to next main question
    this.state.currentQuestionIndex++;
    this.state.followUpCount = 0; // Reset follow-up counter for the next question

    // Check if interview is over
    if (this.state.currentQuestionIndex >= this.state.questions.length) {
      this.state.status = "COMPLETED";
      return null; // Signals interview is over
    }

    return this.state.questions[this.state.currentQuestionIndex];
  }

  public endInterview(durationMins: number): InterviewState {
    this.state.status = "COMPLETED";
    this.state.durationMins = durationMins;
    return this.state;
  }

  public getTranscript() {
    return this.state.transcript;
  }

  // MOCK: In a real system, an LLM would evaluate if the answer needs clarification
  private evaluateNeedForFollowUp(response: string): boolean {
    return response.length < 50; // Ask follow-up if response is too short
  }
}
