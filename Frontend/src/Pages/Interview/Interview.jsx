import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Components/Layout/Layout";
import InterviewCamera from "../../Components/InterviewCamera/InterviewCamera";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";

const Interview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [cumulativeTranscript, setCumulativeTranscript] = useState("");
  
  const questions = [
    "1. Can you describe a challenging technical problem you solved recently and how you approached it?",
    "2. How do you ensure the quality and reliability of the code you write?",
    "3. Tell me about a time you had a disagreement with a team member on a technical decision. How did you resolve it?",
    "4. Describe your experience with testing frameworks and why they are important.",
    "5. How do you stay up to date with the latest industry trends and technologies?",
    "6. Explain a complex technical concept to a non-technical stakeholder.",
    "7. What is your approach to debugging an application when it fails in production?",
    "8. Tell me about a project where you had to quickly learn a new technology or tool.",
    "9. How do you review someone else's code? What specific things do you look out for?",
    "10. Can you share an experience where you had to meet a very tight deadline? How did you manage it?"
  ];

  const handleComplete = async (transcript) => {
    let currentInput = transcript;
    if (!currentInput || currentInput.trim().length === 0) {
      toast.error("Transcript is empty. Skipping this question...");
      currentInput = "[No response captured]";
    }

    const questionAsk = questions[currentQuestionIndex];
    const newCumulative = cumulativeTranscript + `\n\nQuestion: ${questionAsk}\nAnswer: ${currentInput}`;
    setCumulativeTranscript(newCumulative);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await submitInterview(newCumulative);
    }
  };

  const submitInterview = async (finalTranscript) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;
      
      const res = await axios.post(
        `${API_URL}/projects/applications/${applicationId}/submit-interview`,
        { transcript: finalTranscript },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Interview submitted successfully!");
        setSubmitted(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit interview");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center bg-[#f8fafc] px-4">
          <div className="bg-white p-12 rounded-3xl shadow-lg border border-emerald-100 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Interview Submitted!</h2>
            <p className="text-slate-500 mb-8">Your AI-evaluated interview responses have been recorded. The project creator will review your overall score.</p>
            <button 
              onClick={() => navigate("/my-applications")}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">AI Video Interview</h1>
          <p className="text-slate-500 text-lg font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-700">Evaluating your responses...</p>
            <p className="text-sm text-slate-500 mt-2">Our AI is analyzing your full transcript. This may take a moment.</p>
          </div>
        ) : (
          <InterviewCamera 
            key={currentQuestionIndex} // forces remount for fresh timer/hooks
            question={questions[currentQuestionIndex]} 
            onComplete={handleComplete} 
          />
        )}
      </div>
    </Layout>
  );
};

export default Interview;
