import React, { useEffect, useState } from 'react';
import { X, User, Mail, ShieldCheck, Check, Sparkles, Radio } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSaveName: (newName: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  onSaveName
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNameInput(userName);
      setSaved(false);
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim();
    if (!cleaned) return;
    onSaveName(cleaned);
    setSaved(true);
    window.setTimeout(() => {
      onClose();
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050507]/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-[0_24px_60px_rgba(9,9,11,0.34)] overflow-hidden animate-modal-pop">
        {/* Top Black & Crimson Banner */}
        <div className="relative bg-gradient-to-br from-[#050507] via-[#09090B] to-[#991B1B] p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] border border-red-400/50 flex items-center justify-center text-white text-xl font-extrabold shadow-[0_0_24px_rgba(220,38,38,0.45)]">
              {(nameInput || userName).charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-400/40 text-[10px] font-bold uppercase tracking-widest text-red-200">
                <ShieldCheck className="w-3 h-3 text-red-300" />
                Live Verified Analyst
              </span>
              <h2 className="text-xl font-display font-bold mt-1">{userName}</h2>
              <p className="text-xs text-zinc-300">analyst@geosentinel.ai</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Display Name</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAFA] border border-zinc-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] transition text-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Workspace Email</span>
            </label>
            <input
              type="email"
              value="analyst@geosentinel.ai"
              disabled
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-xl bg-[#FAFAFA] border border-zinc-200 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#DC2626]" />
                <span>2026 Feeds</span>
              </div>
              <div className="text-xs font-bold text-[#09090B] mt-1">6 Sources Active</div>
            </div>
            <div className="rounded-xl bg-[#FAFAFA] border border-zinc-200 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#DC2626]" />
                <span>Query Engine</span>
              </div>
              <div className="text-xs font-bold text-[#09090B] mt-1">Intent AI Ready</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#09090B] to-[#DC2626] hover:from-[#18181B] hover:to-[#B91C1C] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
