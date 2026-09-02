import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EvaluationAgent } from "@/lib/evaluationAgent";
import { MBAOrchestrator } from "@/lib/mbaOrchestrator";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "OFFICER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { applicantId } = await req.json();

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      include: { application: true, user: true },
    });

    if (!applicant || !applicant.application) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }

    // Since this is a demo without real video interviews, we generate a mock transcript 
    // based on the applicant's profile to pass to Mistral for a realistic evaluation.
    const mockTranscript = [
      {
        question: "Tell us about your background and why you want an MBA?",
        answer: `I graduated with a ${applicant.application.gradDegree} and scored ${applicant.application.gradPercentage}%. I have ${applicant.application.yearsOfExperience} years of experience working as a ${applicant.application.designation} at ${applicant.application.organization}. I want an MBA to enhance my leadership skills.`
      },
      {
        question: "How do you handle complex problems?",
        answer: `In my previous role, I often had to analyze data to find the root cause of issues. I use a structured approach to break down the problem and collaborate with my team to implement solutions.`
      }
    ];

    // Create a mock interview record to attach the evaluation to
    let interview = await prisma.interview.findFirst({
      where: { applicantId: applicant.id }
    });

    if (!interview) {
      // Create a dummy slot first
      const slot = await prisma.interviewSlot.create({
        data: {
          date: new Date(),
          startTime: "10:00",
          endTime: "10:30",
          interviewer: "AI System",
          maxCandidates: 1,
        }
      });
      
      interview = await prisma.interview.create({
        data: {
          applicantId: applicant.id,
          slotId: slot.id,
          status: "INTERVIEW_EVALUATION_PENDING",
          transcript: JSON.stringify(mockTranscript),
          consentGiven: true,
        }
      });
    }

    // Call Mistral via our EvaluationAgent
    const agent = new EvaluationAgent();
    const evaluationResult = await agent.evaluateTranscript(mockTranscript);

    // Save evaluation to DB
    const evaluation = await prisma.evaluation.create({
      data: {
        interviewId: interview.id,
        totalScore: evaluationResult.totalScore,
        recommendation: evaluationResult.recommendation,
        humanReviewReq: true,
        modelUsed: evaluationResult.modelUsed,
        criteriaScores: JSON.stringify(evaluationResult.criteriaScores),
        rubricVersion: evaluationResult.rubricVersion,
        aiRationale: evaluationResult.aiRationale,
        candidateStrengths: JSON.stringify(evaluationResult.candidateStrengths),
        areasForAssessment: JSON.stringify(evaluationResult.areasForAssessment),
      }
    });

    // Update orchestrator status
    const orchestrator = new MBAOrchestrator();
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { 
        status: "AWAITING_ADMISSION_APPROVAL",
        eligibility: "ELIGIBLE" 
      }
    });
    
    orchestrator.logActivity(applicant.applicantId, "Mistral Evaluation Agent", "Evaluation Completed", "SUCCESS", `Score: ${evaluationResult.totalScore}`);

    return NextResponse.json({ message: "Evaluation complete", evaluation }, { status: 200 });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 });
  }
}
