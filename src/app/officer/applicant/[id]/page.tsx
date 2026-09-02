"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BrainCircuit, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ApplicantReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    fetchApplicant();
  }, [id]);

  const fetchApplicant = async () => {
    try {
      const res = await fetch(`/api/applicant/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApplicant(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId: id }),
      });
      if (res.ok) {
        await fetchApplicant();
      } else {
        alert("Failed to run evaluation");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalDecision = async (decision: "SELECTED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to mark this applicant as ${decision}?`)) return;
    
    setDecisionLoading(true);
    try {
      const res = await fetch(`/api/applicant/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        await fetchApplicant();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!applicant) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-slate-600">Applicant not found.</div>;
  }

  const app = applicant.application;
  
  // Find latest evaluation if it exists
  const interview = applicant.interviews?.[0];
  const evaluation = interview?.evaluations?.[0];

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
          <Link href="/officer" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{applicant.user.name}</h2>
            <p className="text-slate-500 mt-1">ID: {applicant.applicantId} | Status: <span className="font-semibold">{applicant.status.replace(/_/g, ' ')}</span></p>
          </div>
          
          <div className="flex gap-3">
            {applicant.status !== "SELECTED" && applicant.status !== "REJECTED" && (
              <button
                onClick={handleRunEvaluation}
                disabled={evaluating}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                Run Mistral AI Evaluation
              </button>
            )}
            
            {applicant.status === "AWAITING_ADMISSION_APPROVAL" && (
              <>
                <button
                  onClick={() => handleFinalDecision("SELECTED")}
                  disabled={decisionLoading}
                  className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => handleFinalDecision("REJECTED")}
                  disabled={decisionLoading}
                  className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Applicant Data */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Application Details</h3>
              </div>
              <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-slate-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Full name</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{applicant.user.name}</dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Email & Phone</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{applicant.user.email} | {applicant.user.mobile}</dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Academics</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      10th: {app?.class10Percentage}% | 12th: {app?.class12Percentage}% <br/>
                      Undergrad: {app?.gradDegree} ({app?.gradPercentage}%)
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Entrance Exam</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      {app?.examName} - Score: {app?.examScore} ({app?.examPercentile} %ile)
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Work Experience</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      {app?.yearsOfExperience > 0 ? `${app?.yearsOfExperience} years as ${app?.designation} at ${app?.organization}` : "None"}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Extra-Curricular</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      <strong>Sports:</strong> {app?.sportsAchievements || "N/A"}<br/>
                      <strong>Cultural:</strong> {app?.culturalAchievements || "N/A"}<br/>
                      <strong>Co-Curricular:</strong> {app?.coCurricular || "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Disclaimer for Human-In-The-Loop */}
            {evaluation && (
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                 <div className="flex">
                   <div className="flex-shrink-0">
                     <BrainCircuit className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                   </div>
                   <div className="ml-3">
                     <p className="text-sm text-yellow-700 font-medium">
                       {evaluation.humanReviewNotice || "AI Recommendation – Subject to Final Review and Approval by the Admission Coordinator."}
                     </p>
                   </div>
                 </div>
               </div>
            )}
          </div>

          {/* Right Column: AI Evaluation */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> AI Candidate Evaluation Report</h3>
              </div>
              <div className="p-6">
                {!evaluation ? (
                  <div className="text-center py-8 text-slate-500">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No evaluation available yet.</p>
                    <p className="text-sm mt-1">Click "Run Mistral AI" above to generate.</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 text-center">
                      <div className="text-5xl font-bold text-slate-900">{evaluation.totalScore} <span className="text-2xl text-slate-400">/ 90</span></div>
                      <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5 ${
                        evaluation.recommendation.includes('STRONGLY') ? 'bg-green-100 text-green-800' :
                        evaluation.recommendation.includes('NOT') ? 'bg-red-100 text-red-800' :
                        evaluation.recommendation.includes('WAITLIST') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {evaluation.recommendation}
                      </div>
                    </div>
                    
                    <div className="mb-6 bg-slate-50 p-4 rounded-md border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">AI Rationale</h4>
                      <p className="text-sm text-slate-700">{evaluation.aiRationale}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div>
                          <h4 className="font-semibold text-slate-900 mb-2 text-sm">Candidate Strengths</h4>
                          <ul className="list-disc pl-4 text-xs text-green-700 space-y-1">
                             {evaluation.candidateStrengths ? JSON.parse(evaluation.candidateStrengths).map((s: string, i: number) => <li key={i}>{s}</li>) : <li>No specific strengths identified.</li>}
                          </ul>
                       </div>
                       <div>
                          <h4 className="font-semibold text-slate-900 mb-2 text-sm">Areas for Further Assessment</h4>
                          <ul className="list-disc pl-4 text-xs text-amber-700 space-y-1">
                             {evaluation.areasForAssessment ? JSON.parse(evaluation.areasForAssessment).map((s: string, i: number) => <li key={i}>{s}</li>) : <li>No specific areas identified.</li>}
                          </ul>
                       </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-semibold text-slate-900">AI Interview Assessment</h4>
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b text-left text-slate-500">
                            <th className="pb-2">Evaluation Criteria</th>
                            <th className="pb-2 text-right">Score</th>
                            <th className="pb-2 pl-4">AI Observations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {JSON.parse(evaluation.criteriaScores).map((crit: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 font-medium text-slate-700">{crit.name}</td>
                              <td className="py-2 text-right font-semibold">{crit.score}/{crit.maxScore}</td>
                              <td className="py-2 pl-4 text-slate-500">{crit.evidence || crit.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
