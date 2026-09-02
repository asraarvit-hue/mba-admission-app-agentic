"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Loader2 } from "lucide-react";

export default function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    class10Percent: "",
    class12Percent: "",
    ugDegree: "",
    ugPercent: "",
    entranceExam: "CAT",
    entranceScore: "",
    entrancePercentile: "",
    workCompany: "",
    workRole: "",
    workYears: "",
  });

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Submission failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Asraar School of Business - Application</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded transition-all duration-300" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step > i 
                    ? "bg-blue-600 text-white" 
                    : step === i 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500 mt-2">
            <span>Personal</span>
            <span>Academics</span>
            <span>Experience</span>
            <span>Review</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 sm:p-8 border border-slate-200">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={step === 4 ? (e) => { e.preventDefault(); handleSubmit(); } : handleNext}>
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => updateForm("phone", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Full Address</label>
                    <textarea required rows={3} value={formData.address} onChange={(e) => updateForm("address", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Academics */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Academic Record</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">10th Grade Percentage</label>
                    <input type="number" step="0.1" max="100" required value={formData.class10Percent} onChange={(e) => updateForm("class10Percent", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">12th Grade Percentage</label>
                    <input type="number" step="0.1" max="100" required value={formData.class12Percent} onChange={(e) => updateForm("class12Percent", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Undergrad Degree (e.g. B.Tech, B.Com)</label>
                    <input type="text" required value={formData.ugDegree} onChange={(e) => updateForm("ugDegree", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Undergrad Percentage/CGPA</label>
                    <input type="number" step="0.1" max="100" required value={formData.ugPercent} onChange={(e) => updateForm("ugPercent", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Entrance & Work */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Entrance Exam & Experience</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Exam Type</label>
                    <select value={formData.entranceExam} onChange={(e) => updateForm("entranceExam", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                      <option>CAT</option><option>GMAT</option><option>XAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Total Score</label>
                    <input type="number" required value={formData.entranceScore} onChange={(e) => updateForm("entranceScore", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Percentile</label>
                    <input type="number" step="0.1" required value={formData.entrancePercentile} onChange={(e) => updateForm("entrancePercentile", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  
                  <div className="sm:col-span-3 pt-4"><h4 className="text-sm font-medium text-slate-900">Work Experience (Optional)</h4></div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700">Years</label>
                    <input type="number" step="0.1" value={formData.workYears} onChange={(e) => updateForm("workYears", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Latest Company & Role</label>
                    <input type="text" placeholder="Software Engineer at Tech Corp" value={formData.workCompany} onChange={(e) => updateForm("workCompany", e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Review & Submit</h3>
                <p className="text-sm text-slate-600">Please verify your details. Once submitted, your application will undergo automated eligibility checks and cannot be edited.</p>
                
                <div className="bg-slate-50 p-4 rounded text-sm grid grid-cols-2 gap-4">
                  <div><span className="text-slate-500 block">Phone</span><span className="font-medium">{formData.phone}</span></div>
                  <div><span className="text-slate-500 block">Address</span><span className="font-medium">{formData.address}</span></div>
                  <div><span className="text-slate-500 block">10th / 12th</span><span className="font-medium">{formData.class10Percent}% / {formData.class12Percent}%</span></div>
                  <div><span className="text-slate-500 block">Undergrad</span><span className="font-medium">{formData.ugDegree} ({formData.ugPercent}%)</span></div>
                  <div><span className="text-slate-500 block">Exam</span><span className="font-medium">{formData.entranceExam}: {formData.entranceScore} ({formData.entrancePercentile} %ile)</span></div>
                  <div><span className="text-slate-500 block">Experience</span><span className="font-medium">{formData.workYears ? `${formData.workYears} yrs - ${formData.workCompany}` : 'None'}</span></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t flex justify-between">
              <button
                type="button"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={`px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 ${step === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === 4 ? 'Submit Application' : 'Next Step'}
                {step !== 4 && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
