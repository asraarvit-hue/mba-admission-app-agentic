import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MBAOrchestrator } from "@/lib/mbaOrchestrator";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Fetch existing applicant
    const applicant = await prisma.applicant.findUnique({
      where: { userId: session.user.id },
      include: { application: true }
    });

    if (!applicant) {
      return NextResponse.json({ message: "Applicant record not found" }, { status: 404 });
    }

    if (applicant.status !== "DRAFT") {
      return NextResponse.json({ message: "Application already submitted" }, { status: 400 });
    }

    // Update Applicant and Application
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mobile: data.phone,
      }
    });

    await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        status: "SUBMITTED",
        application: {
          create: {
            city: data.address, // Mapping address to city for simplicity
            class10Percentage: parseFloat(data.class10Percent),
            class12Percentage: parseFloat(data.class12Percent),
            gradDegree: data.ugDegree,
            gradPercentage: parseFloat(data.ugPercent),
            examName: data.entranceExam,
            examScore: parseFloat(data.entranceScore),
            examPercentile: parseFloat(data.entrancePercentile),
            yearsOfExperience: data.workYears ? parseFloat(data.workYears) : 0,
            organization: data.workCompany || null,
            designation: data.workCompany ? "Employee" : null,
            sportsAchievements: data.sports || null,
            culturalAchievements: data.cultural || null,
            coCurricular: data.coCurricular || null,
          }
        }
      }
    });

    // Fire the orchestrator to log submission
    const orchestrator = new MBAOrchestrator();
    orchestrator.logActivity(applicant.applicantId, "Applicant Portal", "Application Submitted", "SUCCESS");

    return NextResponse.json({ message: "Application submitted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
