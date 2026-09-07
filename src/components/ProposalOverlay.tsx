import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';
import { sendYesNotification } from '../services/notificationService';

interface ProposalOverlayProps {
  herName: string;
  yourName: string;
  onAccepted: () => void;
  isAccepted: boolean;
}

export const ProposalOverlay: React.FC<ProposalOverlayProps> = ({
  herName,
  yourName,
  onAccepted,
  isAccepted
}) => {
  const [celebrating, setCelebrating] = useState(isAccepted);
  const [noCount, setNoCount] = useState(0);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  // Soft fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAccepted) setCelebrating(true);
  }, [isAccepted]);

  const launchConfetti = () => {
    soundEngine.playProposalChime();

    // Left side burst
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      colors: ['#ff0a54', '#ff477e', '#f6d365', '#ffffff', '#fda4af'],
    });
    // Right side burst
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      colors: ['#ff0a54', '#ff477e', '#f6d365', '#ffffff', '#fda4af'],
    });

    // Continuous rain for 3s
    const end = Date.now() + 3000;
    const rain = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 3,
        startVelocity: 0,
        ticks: 200,
        origin: { x: Math.random(), y: 0 },
        colors: ['#f43f5e', '#fb7185', '#f6d365'],
        gravity: 0.6,
        drift: 0,
      });
      requestAnimationFrame(rain);
    };
    requestAnimationFrame(rain);
  };

  const handleYes = async () => {
    setCelebrating(true);
    launchConfetti();
    onAccepted();
    await sendYesNotification(herName, yourName);
  };

  // Dodge the "No" button playfully
  const dodgeNo = () => {
    setNoCount(c => c + 1);
    if (!noButtonRef.current) return;
    const btn = noButtonRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const rx = Math.random() * (vw * 0.7 - bw);
    const ry = Math.random() * (vh * 0.55 - bh);
    btn.style.position = 'fixed';
    btn.style.left = `${rx}px`;
    btn.style.top = `${ry}px`;
    btn.style.zIndex = '9999';
    btn.style.transition = 'left 0.22s ease-out, top 0.22s ease-out';
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      {/* Dark beach-sky vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* Beach-side wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none" style={{
        background: 'linear-gradient(90deg, transparent, rgba(147,197,253,0.3), transparent)'
      }} />

      {/* Card slides up from bottom */}
      <div
        className="relative w-full max-w-md mx-auto pointer-events-auto mb-0"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(60px)',
          transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Glow ring */}
        <div className="absolute -inset-0.5 rounded-t-[2.4rem] bg-gradient-to-r from-rose-600 via-amber-400 to-pink-600 blur-lg opacity-60 animate-pulse-slow pointer-events-none" />

        {/* Main card — rounded only on top, flush to bottom on mobile */}
        <div className="relative glass-panel rounded-t-[2.2rem] border-t border-x border-rose-400/35 shadow-2xl">
          {!celebrating ? (
            <div className="px-6 pt-7 pb-8 sm:px-10 sm:pt-9 sm:pb-10 text-center">
              {/* Location chip */}
              <div className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 rounded-full px-3 py-1 text-[10px] sm:text-[11px] text-sky-200 mb-4">
                <span>🌊</span>
                <span>Beachside, under the midnight sky</span>
              </div>

              {/* Glowing heart */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-950/80 border-2 border-rose-400/60 flex items-center justify-center shadow-xl">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-rose-500 text-rose-300 animate-glow-pulse" />
                </div>
              </div>

              {/* Message from Prashant */}
              <p className="font-serif italic text-rose-200/80 text-xs sm:text-sm mb-2 leading-relaxed">
                {yourName} knelt down on the beach and said...
              </p>

              <h2 className="font-cursive text-4xl sm:text-5xl text-rose-300 leading-tight mb-1">
                I Love You
              </h2>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                {herName} 💖
              </h2>

              <p className="font-serif italic text-slate-300 text-sm sm:text-base mb-6 leading-relaxed max-w-xs mx-auto">
                "Every star in this sky is a reason I love you. Will you be mine, forever?"
              </p>

              {/* Answer buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center relative">
                {/* YES */}
                <button
                  onClick={handleYes}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl glass-button text-white font-bold text-lg sm:text-xl shadow-2xl active:scale-95 transition-all"
                >
                  Yes 💖
                </button>

                {/* NO — dodge */}
                <button
                  ref={noButtonRef}
                  onClick={dodgeNo}
                  onMouseEnter={dodgeNo}
                  onTouchStart={(e) => { e.preventDefault(); dodgeNo(); }}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-800/70 text-slate-400 font-medium text-base sm:text-xl border border-slate-600/30 shadow active:scale-95 transition-all"
                  style={{ touchAction: 'none' }}
                >
                  {noCount === 0 ? 'No 💔' : noCount < 4 ? "Are you sure? 🥺" : "Please 🙏💕"}
                </button>
              </div>

              {noCount > 0 && (
                <p className="mt-3 text-[11px] text-rose-300/70 italic animate-pulse">
                  {noCount < 3 ? "Hmm... that button is quite slippery 😄" : "Love always finds a way... 💫"}
                </p>
              )}
            </div>
          ) : (
            /* ─── CELEBRATION STATE ─── */
            <div className="px-6 pt-7 pb-8 sm:px-10 sm:pt-9 sm:pb-10 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/30 border-2 border-rose-400 flex items-center justify-center animate-glow-pulse">
                  <Heart className="w-9 h-9 sm:w-10 sm:h-10 fill-rose-500 text-rose-300" />
                </div>
              </div>

              <h2 className="font-cursive text-5xl sm:text-6xl text-rose-300 leading-tight">
                She Said YES!
              </h2>

              <p className="font-serif italic text-amber-200 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                "Forever & always yours, {herName}. 💍"
              </p>

              {/* Notification sent confirmation */}
              <div className="flex items-center justify-center gap-2 bg-green-900/30 border border-green-500/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-green-300">
                <span>✉️</span>
                <span>
                  An email has been sent to <strong>{yourName}</strong>'s Gmail inbox!
                </span>
              </div>

              <button
                onClick={launchConfetti}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium border border-white/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                More Confetti! 🎉
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
