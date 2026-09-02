import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MBAOrchestrator } from "@/lib/mbaOrchestrator";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "OFFICER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { decision } = await req.json();

    if (decision !== "SELECTED" && decision !== "REJECTED") {
      return NextResponse.json({ message: "Invalid decision" }, { status: 400 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }

    await prisma.applicant.update({
      where: { id },
      data: { status: decision }
    });

    const orchestrator = new MBAOrchestrator();
    orchestrator.logActivity(applicant.applicantId, "Human Admission Officer", `Final Decision: ${decision}`, "SUCCESS");

    return NextResponse.json({ message: "Decision recorded" }, { status: 200 });
  } catch (error: any) {
    console.error("Decision error:", error);
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 });
  }
}
