import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Users, FileCheck, BrainCircuit, Activity } from "lucide-react";

async function getApplicants() {
  return await prisma.applicant.findMany({
    include: {
      user: true,
      application: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function OfficerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "OFFICER" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  const applicants = await getApplicants();

  const metrics = {
    total: applicants.length,
    submitted: applicants.filter(a => a.status !== "DRAFT").length,
    eligible: applicants.filter(a => a.eligibility === "ELIGIBLE").length,
    selected: applicants.filter(a => a.status === "SELECTED").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="brightness-200" />
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
              Asraar School of Business - Admission Control
            </h1>
          </div>
          <div className="flex items-center gap-4 text-white">
            <span className="text-sm">Officer: {session.user.email}</span>
            <Link 
              href="/api/auth/signout" 
              className="text-sm font-medium hover:text-slate-300 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2"><Users className="w-4 h-4" /> Total Applicants</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{metrics.total}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2"><FileCheck className="w-4 h-4" /> Applications Submitted</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{metrics.submitted}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> AI Eligible</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">{metrics.eligible}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
            <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4" /> Final Selected</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">{metrics.selected}</dd>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white shadow sm:rounded-lg border border-slate-200">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-slate-200">
            <h3 className="text-lg font-medium leading-6 text-slate-900">All Applicants</h3>
            <div className="text-sm text-slate-500">Live Database View</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">App ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Current Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">AI Eligibility</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {applicants.map((app) => (
                  <tr key={app.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{app.applicantId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{app.user.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${app.status === 'SELECTED' ? 'bg-green-100 text-green-800' : app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {app.eligibility ? (
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${app.eligibility === 'ELIGIBLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {app.eligibility}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/officer/applicant/${app.id}`} className="text-blue-600 hover:text-blue-900">
                        Review<span className="sr-only">, {app.applicantId}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {applicants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      No applicants found. Wait for someone to register!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
