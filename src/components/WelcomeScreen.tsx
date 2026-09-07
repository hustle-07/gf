import React, { useState, useEffect } from 'react';
import { ArrowRight, Music, Mail, CheckCircle, XCircle } from 'lucide-react';
import { sendTestNotification, getSavedEmail, saveEmail } from '../services/notificationService';

interface WelcomeScreenProps {
  herName: string;
  yourName: string;
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ herName, yourName, onEnter }) => {
  const [gmail, setGmail] = useState('hustlebhaiya@gmail.com');
  const [testState, setTestState] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    const saved = getSavedEmail();
    if (saved) setGmail(saved);
  }, []);

  const handleTest = async () => {
    if (!gmail || !gmail.includes('@')) {
      alert('Please enter a valid Gmail address (e.g., hustlebhaiya@gmail.com)');
      return;
    }
    saveEmail(gmail);
    setTestState('sending');
    const ok = await sendTestNotification(gmail);
    setTestState(ok ? 'ok' : 'fail');
    setTimeout(() => setTestState('idle'), 5000);
  };

  const handleGmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGmail(e.target.value);
    saveEmail(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 select-none overflow-y-auto py-6">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-sky-600/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative glass-panel rounded-3xl p-6 sm:p-9 max-w-sm w-full text-center border border-rose-500/25 shadow-2xl my-auto">
        <div className="text-4xl mb-3">🌊🌙</div>

        <p className="font-display tracking-[0.3em] text-[10px] uppercase text-sky-300/80 mb-1.5">
          A Romantic Night on the Beach
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">
          This night is for
        </h1>
        <h1 className="font-cursive text-4xl sm:text-5xl text-rose-gradient mb-3">
          {herName}
        </h1>

        <p className="text-slate-300/80 text-xs leading-relaxed mb-5 max-w-xs mx-auto">
          <span className="text-rose-300 font-medium">{yourName}</span> has prepared something
          very special for you on this starlit beach. Follow the rose petals... 🌹
        </p>

        {/* Main enter button */}
        <button
          onClick={onEnter}
          className="group w-full py-3.5 rounded-2xl glass-button text-white font-bold text-base flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-xl mb-4"
        >
          <span>🏖️</span>
          <span>Walk on the Beach</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* ── GMAIL NOTIFICATION SETUP FOR PRASHANT ── */}
        <div className="border-t border-white/10 pt-3.5 text-left">
          <p className="text-[11px] text-amber-200/90 font-medium mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-rose-400" />
            <span>Notification Target Email:</span>
          </p>

          <input
            type="email"
            value={gmail}
            onChange={handleGmailChange}
            placeholder="hustlebhaiya@gmail.com"
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-400 mb-2 font-mono"
          />

          <button
            onClick={handleTest}
            disabled={testState === 'sending' || !gmail}
            className="w-full py-2 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {testState === 'idle' && <>✉️ Send Test Email to {gmail}</>}
            {testState === 'sending' && <><span className="animate-spin">⏳</span> Sending Email...</>}
            {testState === 'ok' && <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> <span className="text-green-400">Sent! Check hustlebhaiya@gmail.com ✅</span></>}
            {testState === 'fail' && <><XCircle className="w-3.5 h-3.5 text-red-400" /> <span className="text-red-400">Failed — Enter valid email</span></>}
          </button>

          {testState === 'ok' && (
            <p className="text-[10px] text-green-400/80 mt-1.5 leading-relaxed text-center">
              Check your Gmail inbox (or Spam folder)!<br/>
              When Raj Nandani says YES, email goes to hustlebhaiya@gmail.com!
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-sky-300/70">
          <Music className="w-3 h-3" />
          <span>Turn on sound for the full experience</span>
        </div>
      </div>
    </div>
  );
};
