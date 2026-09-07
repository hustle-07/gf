import React from 'react';
import { RotateCcw } from 'lucide-react';

// Shows a "please rotate" screen when in portrait mode on mobile
export const LandscapeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPortrait, setIsPortrait] = React.useState(
    () => window.innerHeight > window.innerWidth
  );

  React.useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black text-center px-6 gap-5">
        {/* Animated rotate icon */}
        <div className="animate-spin-slow text-6xl select-none">📱</div>
        <div className="text-white/90 text-xl font-bold font-serif">
          Please Rotate Your Phone
        </div>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          This romantic experience is best enjoyed in <span className="text-rose-300 font-semibold">landscape mode</span> 🌊
        </p>
        <div className="flex items-center gap-2 text-amber-300/80 text-xs">
          <RotateCcw className="w-4 h-4" />
          <span>Rotate your device sideways</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
