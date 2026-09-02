import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "OFFICER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: { 
        application: true, 
        user: true,
        interviews: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!applicant) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }

    return NextResponse.json(applicant, { status: 200 });
  } catch (error: any) {
    console.error("Fetch applicant error:", error);
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 });
  }
}
