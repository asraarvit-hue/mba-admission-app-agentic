import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { FileText, CheckCircle, Clock, Video, UserCheck, AlertCircle, LogOut } from "lucide-react";

async function getDashboardData(userId: string) {
  const applicant = await prisma.applicant.findUnique({
    where: { userId },
    include: {
      application: true,
      documents: true,
    },
  });
  return applicant;
}

function getStatusStep(status?: string) {
  const stages = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "INTERVIEW_PENDING",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "INTERVIEW_EVALUATION_PENDING",
    "MANUAL_REVIEW_REQUIRED",
    "SHORTLISTED",
    "SELECTED",
    "REJECTED",
  ];
  return stages.indexOf(status || "DRAFT");
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect officers/admins to their respective dashboards (to be built later)
  if (session.user.role === "OFFICER") redirect("/officer");
  if (session.user.role === "ADMIN") redirect("/admin");

  const applicant = await getDashboardData(session.user.id);
  
  if (!applicant) {
    return <div>Applicant record not found. Please contact support.</div>;
  }

  const appStatus = applicant.status || "DRAFT";
  const stepIndex = getStatusStep(appStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 hidden sm:block">
              Asraar School of Business
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">ID: {applicant.applicantId}</span>
            <Link 
              href="/api/auth/signout" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Main Status Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
              <h2 className="text-lg font-medium text-slate-900 mb-4">Application Status</h2>
              
              <div className="relative pt-4 pb-8">
                <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-slate-200"></div>
                
                <div className="relative flex items-start mb-8">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${stepIndex >= 0 ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400"}`}>
                    {stepIndex > 0 ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="ml-4 mt-1">
                    <h3 className="text-sm font-medium text-slate-900">Application Started</h3>
                    <p className="text-sm text-slate-500">Drafting your MBA application</p>
                  </div>
                </div>

                <div className="relative flex items-start mb-8">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${stepIndex >= 1 ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400"}`}>
                    {stepIndex > 1 ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="ml-4 mt-1">
                    <h3 className="text-sm font-medium text-slate-900">Submitted</h3>
                    <p className="text-sm text-slate-500">Awaiting document verification</p>
                  </div>
                </div>

                <div className="relative flex items-start mb-8">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${stepIndex >= 3 ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400"}`}>
                    {stepIndex > 4 ? <CheckCircle className="h-5 w-5" /> : <Video className="h-4 w-4" />}
                  </div>
                  <div className="ml-4 mt-1">
                    <h3 className="text-sm font-medium text-slate-900">AI Interview</h3>
                    <p className="text-sm text-slate-500">Complete your asynchronous video interview</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${stepIndex >= 8 ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400"}`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="ml-4 mt-1">
                    <h3 className="text-sm font-medium text-slate-900">Final Decision</h3>
                    <p className="text-sm text-slate-500">Committee review completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
              <h2 className="text-lg font-medium text-slate-900 mb-4">Required Actions</h2>
              
              {appStatus === "DRAFT" && (
                <div className="space-y-4">
                  <div className="flex items-start bg-blue-50 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Complete Your Application</h4>
                      <p className="mt-1 text-sm text-blue-700">Please provide your academic and professional details to submit your application.</p>
                    </div>
                  </div>
                  <Link
                    href="/apply"
                    className="block w-full text-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    Continue Application
                  </Link>
                </div>
              )}

              {appStatus === "SUBMITTED" && (
                <div className="space-y-4">
                  <div className="flex items-start bg-indigo-50 p-4 rounded-md">
                    <Video className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-800">AI Video Interview Required</h4>
                      <p className="mt-1 text-sm text-indigo-700">Please complete your mandatory AI Admission Interview. Ensure you are in a quiet room with a working webcam.</p>
                    </div>
                  </div>
                  <Link
                    href="/interview"
                    className="block w-full text-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Start AI Video Interview
                  </Link>
                </div>
              )}

              {appStatus !== "DRAFT" && appStatus !== "SUBMITTED" && (
                <div className="flex items-start bg-slate-50 p-4 rounded-md">
                  <Clock className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">Under Review</h4>
                    <p className="mt-1 text-sm text-slate-600">No actions required at this time. We will notify you via email when there is an update.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
