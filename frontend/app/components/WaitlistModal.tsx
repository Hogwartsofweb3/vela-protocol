"use client";

import { useState, useEffect } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const depositOptions = [
  { value: "50-500", label: "$50 – $500" },
  { value: "500-5000", label: "$500 – $5,000" },
  { value: "5000-50000", label: "$5,000 – $50,000" },
  { value: "50000+", label: "$50,000+" },
];

const investorTypes = [
  { value: "individual", label: "Individual" },
  { value: "hnw", label: "Family Office / HNW" },
  { value: "institution", label: "Institution / Fund" },
];

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [deposit, setDeposit] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Escape key closes modal; lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !deposit || !investorType) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deposit, investorType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220] p-8 shadow-[0_0_60px_rgba(0,194,255,0.1)] max-h-[80vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#8B9BB4] hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {status === "success" ? (
            /* Success State */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-3">You&apos;re on the list.</h2>
              <p className="font-body text-[#8B9BB4] text-sm leading-relaxed mb-6">
                We&apos;ll reach out before Vela goes live on mainnet. Watch your inbox.
              </p>
              <button
                onClick={onClose}
                className="bg-[#00C2FF] text-black font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-all duration-200 text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00C2FF] animate-pulse" />
                  <span className="font-mono text-[10px] font-bold text-[#00C2FF] uppercase tracking-widest">
                    Early Access
                  </span>
                </div>
                <h2 id="waitlist-title" className="font-display text-2xl font-bold text-white mb-2">
                  Join the waitlist
                </h2>
                <p className="font-body text-[#8B9BB4] text-sm leading-relaxed">
                  Be first when Vela goes live. Minimum deposit is{" "}
                  <span className="text-white font-semibold">$50 USDC</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wl-email" className="font-mono text-[10px] font-bold text-[#8B9BB4] uppercase tracking-widest">
                    Email address
                  </label>
                  <input
                    id="wl-email"
                    type="email"
                    required
                    placeholder="you@fund.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08090f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8B9BB4]/50 font-body text-sm focus:outline-none focus:border-[#00C2FF]/50 transition-colors"
                  />
                </div>

                {/* Planned deposit */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#8B9BB4] uppercase tracking-widest">
                    Planned first deposit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {depositOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDeposit(opt.value)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-body font-medium transition-all duration-150 ${
                          deposit === opt.value
                            ? "border-[#00C2FF] bg-[#00C2FF]/10 text-white"
                            : "border-white/10 bg-[#08090f] text-[#8B9BB4] hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investor type */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#8B9BB4] uppercase tracking-widest">
                    I am a...
                  </label>
                  <div className="flex flex-col gap-2">
                    {investorTypes.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInvestorType(opt.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body transition-all duration-150 text-left ${
                          investorType === opt.value
                            ? "border-[#00C2FF] bg-[#00C2FF]/10 text-white"
                            : "border-white/10 bg-[#08090f] text-[#8B9BB4] hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            investorType === opt.value ? "border-[#00C2FF]" : "border-white/20"
                          }`}
                        >
                          {investorType === opt.value && (
                            <div className="w-2 h-2 rounded-full bg-[#00C2FF]" />
                          )}
                        </div>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <p className="font-body text-red-400 text-xs">{errorMsg}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading" || !email || !deposit || !investorType}
                  className="w-full bg-[#00C2FF] text-black font-bold py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,194,255,0.4)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-1"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Request Early Access"
                  )}
                </button>

                <p className="font-body text-[#8B9BB4]/50 text-[10px] text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
