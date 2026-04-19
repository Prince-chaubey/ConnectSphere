import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { AlertTriangle, Mic, MicOff, Camera, Video, Clock } from "lucide-react";
import toast from "react-hot-toast";

const InterviewCamera = ({ question, onComplete }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [hasFace, setHasFace] = useState(true);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [transcript, setTranscript] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Detect Tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        toast.error("Warning: Switching tabs during interview is not allowed!", { id: 'tab-switch', duration: 4000 });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRecording]);

  useEffect(() => {
    let isMounted = true;
    const loadModelsAndStart = async () => {
      try {
        const MODEL_URL = "https://vladmandic.github.io/face-api/model/";
        // Use ssdMobilenetv1 instead for more reliable face detection
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        if (isMounted) setModelsLoaded(true);
      } catch (err) {
        console.warn("Could not load face-api models. Falling back without face tracking.", err);
      }
      if (isMounted) startCamera();
    };
    loadModelsAndStart();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera and Microphone access required to proceed.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleVideoPlay = () => {
    if (!modelsLoaded) return;
    
    // Periodically detect faces
    setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        try {
          const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }));
          if (detections.length === 0) {
            setHasFace(false);
            setMultipleFaces(false);
          } else if (detections.length > 1) {
            setHasFace(true);
            setMultipleFaces(true);
          } else {
            setHasFace(true);
            setMultipleFaces(false);
          }
        } catch (e) {
          // ignore detection errors
        }
      }
    }, 1000);
  };

  const startRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setTimeLeft(120);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error", event.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      toast.error("Your browser doesn't support speech recognition API. Transcript will be empty.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onComplete(transcript);
  };

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording, transcript]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6">
      
      {/* Video Section */}
      <div className="flex-1 relative bg-slate-900 rounded-xl overflow-hidden shadow-inner aspect-video flex-shrink-0">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          onPlay={handleVideoPlay}
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold">
            <Camera className="w-4 h-4 text-emerald-400" /> WebCam Active
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div> Recording
            </div>
          )}
        </div>

        {/* Face Detection Warnings */}
        {(!hasFace || multipleFaces) && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border-2 border-red-500">
              <AlertTriangle className="w-6 h-6" />
              <span>
                {!hasFace ? "No face detected in frame!" : "Multiple faces detected!"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex-[0.8] flex flex-col justify-between py-2">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Interview Question</h3>
          <p className="text-xl font-extrabold text-slate-800 leading-tight mb-4">{question}</p>
          
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Mic className="w-3 h-3"/> Live Transcript</span>
              {isRecording && <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Clock className="w-3 h-3"/> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</span>}
            </div>
            <div className="h-24 overflow-y-auto w-full pr-2 text-sm text-slate-700 italic">
              {transcript || <span className="text-slate-400 font-normal">Candidate's answer will appear here once recording starts...</span>}
            </div>
          </div>
        </div>

        <div>
          {!isRecording ? (
            <button 
              onClick={startRecording}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Mic className="w-5 h-5"/> Start Answering
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="w-full bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              <MicOff className="w-5 h-5"/> Stop & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCamera;
