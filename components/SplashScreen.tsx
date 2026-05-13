import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 30);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050e1f] overflow-hidden">
      {/* Deep dark navy background matching the logo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0d2040_0%,_#050e1f_70%)]" />

      {/* Subtle outer glow rings matching logo's blue circuit aesthetic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[520px] h-[520px] rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '3.5s' }} />
        <div className="absolute w-[420px] h-[420px] rounded-full border border-blue-400/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.4s' }} />
        <div className="absolute w-[320px] h-[320px] rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.8s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        {/* Full logo image — the user's provided JIDO FREIGHT artwork */}
        <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-[0_0_60px_rgba(0,120,255,0.4),0_0_120px_rgba(0,200,100,0.15)]">
          <img
            src="/jido-logo.jpg"
            alt="JIDO FREIGHT"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Subtitle below logo */}
        <p className="text-blue-300/80 text-sm font-semibold tracking-[0.3em] uppercase">
          PRO · Trucker Companion
        </p>

        {/* Progress bar */}
        <div className="w-64 mt-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 rounded-full"
              style={{ width: `${progress}%`, transition: 'width 30ms linear' }}
            />
          </div>
          <p className="text-white/25 text-xs mt-2 text-center tracking-widest uppercase">
            Loading
          </p>
        </div>
      </div>
    </div>
  );
}
