"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Video, Mic, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function AIInterviewRoom() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questions = [
    "Tell us about your background and why you want an MBA?",
    "How do you handle complex business problems?",
    "What are your views on current global market trends?",
    "Describe a time you demonstrated leadership."
  ];

  // Anti-Malpractice System
  useEffect(() => {
    if (!hasStarted || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerMalpractice("Switched tabs or minimized window");
      }
    };

    const handleBlur = () => {
      triggerMalpractice("Clicked outside the interview window");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [hasStarted, isFinished]);

  const triggerMalpractice = (reason: string) => {
    setMalpracticeCount(prev => {
      const newCount = prev + 1;
      setShowWarning(true);
      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowWarning(false), 5000);
      
      if (newCount >= 3) {
        alert("CRITICAL VIOLATION: Interview terminated due to repeated malpractice (" + reason + ").");
        router.push("/dashboard");
      }
      return newCount;
    });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("Camera/Microphone access required to proceed.");
    }
  };

  const beginInterview = () => {
    if (!stream) {
      alert("Please enable camera first.");
      return;
    }
    // Request fullscreen to prevent distractions
    document.documentElement.requestFullscreen().catch(e => console.log(e));
    setHasStarted(true);
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsFinished(true);
      // Stop camera
      stream?.getTracks().forEach(track => track.stop());
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
      
      // Update applicant status (mock API call)
      try {
        await fetch("/api/interview/complete", { method: "POST" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch(e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      
      {/* Malpractice Overlay Warning */}
      {showWarning && (
        <div className="absolute inset-0 z-50 bg-red-600/90 flex flex-col items-center justify-center p-8 text-center animate-pulse">
          <AlertTriangle className="w-24 h-24 text-white mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">MALPRACTICE DETECTED</h1>
          <p className="text-xl text-white max-w-2xl">
            You navigated away from the interview window. This has been logged. 
            ({malpracticeCount}/3 warnings). Your interview will be terminated automatically on the 3rd warning.
          </p>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-slate-800 shadow border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="brightness-200" />
          <h1 className="text-xl font-bold tracking-tight">AI Admission Interview</h1>
        </div>
        {hasStarted && !isFinished && (
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Recording
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-300">
              Warnings: <span className={malpracticeCount > 0 ? "text-red-400 font-bold" : ""}>{malpracticeCount}/3</span>
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-8 max-w-5xl mx-auto w-full">
        
        {!hasStarted && !isFinished ? (
          <div className="bg-slate-800 p-8 rounded-xl max-w-2xl w-full text-center shadow-xl border border-slate-700 mt-12">
            <h2 className="text-2xl font-bold mb-4">Welcome to the AI Video Interview</h2>
            <div className="text-left bg-slate-900 p-4 rounded-md text-sm text-slate-300 mb-6 space-y-2">
              <p><strong>Rules & Regulations:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ensure you are in a quiet, well-lit room.</li>
                <li>Your camera and microphone must remain on.</li>
                <li className="text-red-400 font-semibold">Do not open other tabs, browsers, or AI tools (ChatGPT, Claude, etc).</li>
                <li className="text-red-400 font-semibold">Navigating away from this window will trigger a malpractice flag. 3 flags = instant rejection.</li>
              </ul>
            </div>

            {!stream ? (
              <button onClick={startCamera} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto w-full">
                <Video className="w-5 h-5" /> Enable Camera & Microphone
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-black aspect-video border-2 border-green-500">
                  <video ref={videoRef} autoPlay muted playsInline className="object-cover w-full h-full transform -scale-x-100" />
                </div>
                <button onClick={beginInterview} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg w-full">
                  I Accept The Rules — Start Interview
                </button>
              </div>
            )}
          </div>
        ) : isFinished ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Interview Completed</h2>
            <p className="text-slate-400">Your AI video responses have been securely saved and submitted for evaluation.</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 w-full h-full max-h-[600px] mt-4">
            {/* AI Avatar / Question Area */}
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
              
              {/* Fake AI Visualization */}
              <div className="flex-1 flex items-center justify-center bg-slate-900 relative">
                <div className="w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full bg-blue-500/40 animate-ping absolute"></div>
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center z-10">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-slate-400 text-sm">AI Voice Agent Listening...</p>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-6 bg-slate-800 border-t border-slate-700 min-h-[150px] flex flex-col justify-center">
                <span className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wider">Question {currentQuestion + 1} of {questions.length}</span>
                <h3 className="text-2xl font-medium leading-tight">{questions[currentQuestion]}</h3>
              </div>
            </div>

            {/* User Camera */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="bg-black rounded-xl overflow-hidden aspect-video relative border border-slate-700">
                <video ref={videoRef} autoPlay muted playsInline className="object-cover w-full h-full transform -scale-x-100" />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">You</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex-1 flex flex-col justify-between text-center">
                <div>
                  <p className="text-slate-300 text-sm mb-4">Please speak your answer clearly into the microphone. Ensure you maintain eye contact with the camera.</p>
                  <div className="flex justify-center items-center gap-1 h-8">
                     {/* Fake audio visualizer bars */}
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-2 bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%`, minHeight: '8px' }}></div>
                     ))}
                  </div>
                </div>
                <button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg mt-6 w-full">
                  {currentQuestion === questions.length - 1 ? "Submit Interview" : "Next Question"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
