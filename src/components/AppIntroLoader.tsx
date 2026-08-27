import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface AppIntroLoaderProps {
  onComplete?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
}

export const AppIntroLoader: React.FC<AppIntroLoaderProps> = ({ onComplete, onFinish, onSkip }) => {
  const [progress, setProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // User uploaded Intro Video permalink
  const videoUrl = 'https://raw.githubusercontent.com/Gautamgs21/AutoCare/d42c2f20345b33be9c9c7e879a07c01a8ebfd61f/Intro.mp4';

  const handleFinish = () => {
    if (typeof onComplete === 'function') {
      onComplete();
    } else if (typeof onFinish === 'function') {
      onFinish();
    } else if (typeof onSkip === 'function') {
      onSkip();
    }
  };

  useEffect(() => {
    // If video fails or while fallback is running, calculate progress
    const startTime = Date.now();
    const duration = 3500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100 && videoError) {
        clearInterval(interval);
        setTimeout(() => {
          handleFinish();
        }, 400);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [videoError]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b13] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden transition-colors duration-500">
      {/* Background Soft Glow Radial Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Action Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-2.5 z-20">
        {!videoError && isVideoPlaying && (
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-2.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-300 hover:text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        )}

        <button
          onClick={() => {
            if (typeof onSkip === 'function') onSkip();
            else handleFinish();
          }}
          className="px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/90 backdrop-blur-md border border-slate-700 text-xs font-bold text-slate-200 hover:text-white shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container: Video or Animated Vector */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        {/* Video Player */}
        {!videoError ? (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              muted={isMuted}
              playsInline
              onPlay={() => setIsVideoPlaying(true)}
              onEnded={handleFinish}
              onError={() => {
                setVideoError(true);
                setIsVideoPlaying(false);
              }}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration) {
                  const pct = Math.floor((videoRef.current.currentTime / videoRef.current.duration) * 100);
                  setProgress(pct);
                }
              }}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* Animated Vector Loop Fallback */
          <div className="relative w-72 h-44 sm:w-84 sm:h-52 flex items-center justify-center">
            <svg viewBox="0 0 400 240" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="infinityGradIntro" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="40%" stopColor="#0284c7" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <filter id="tracerGlowIntro" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="135" cy="120" r="68" stroke="#1e293b" strokeWidth="14" strokeOpacity="0.4" />
              <circle cx="265" cy="120" r="68" stroke="#1e293b" strokeWidth="14" strokeOpacity="0.4" />

              <path
                d="M 200,120 C 235,70 310,70 335,120 C 360,170 285,170 200,120 C 115,70 40,70 65,120 C 90,170 165,170 200,120 Z"
                stroke="url(#infinityGradIntro)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              <path
                d="M 200,120 C 235,70 310,70 335,120 C 360,170 285,170 200,120 C 115,70 40,70 65,120 C 90,170 165,170 200,120 Z"
                stroke="#67e8f9"
                strokeWidth="18"
                strokeDasharray="60 380"
                strokeDashoffset={-progress * 4.4}
                strokeLinecap="round"
                fill="none"
                filter="url(#tracerGlowIntro)"
                className="opacity-90"
              />
            </svg>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center mt-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
            AUTOCARE
          </h1>
          <p className="text-xs font-extrabold tracking-[0.25em] text-cyan-400 uppercase mt-1">
            MANAGE YOUR RIDES
          </p>
        </div>

        {/* Progress Bar with Percentage */}
        <div className="w-full max-w-xs sm:max-w-sm mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Calibrating Telemetry...</span>
            </span>
            <span className="font-mono text-cyan-400 font-black">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-linear-to-r from-blue-700 via-sky-500 to-cyan-400 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
