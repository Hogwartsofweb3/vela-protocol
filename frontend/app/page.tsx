"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitlistModal } from "./components/WaitlistModal";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-white overflow-x-hidden selection:bg-accent selection:text-black antialiased">
      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#08090f]/80 backdrop-blur-md border-b border-border transition-all duration-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            {/* Vela Triangle Logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2 L4 16 L14 20 Z" fill="#ffffff" />
              <path d="M4 16 L18 28 L14 20 Z" fill="#ffffff" />
              <path d="M18 4 L18 28 L14 20 Z" fill="#00C2FF" />
            </svg>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              Vela
            </span>
          </div>
          <Link
            href="/dashboard"
            className="bg-accent text-black font-semibold px-6 py-2 rounded-full hover:scale-105 hover:shadow-[0_0_15px_rgba(0,194,255,0.4)] transition-all duration-200"
          >
            Enter App
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
        {/* Animated Background Video */}
        <div className="hero-canvas">
          {mounted && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-50 mix-blend-screen"
            >
              <source src="/background.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,194,255,0.15)_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08090f]/50 to-[#08090f]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto px-4 w-full animate-fade-in-up">
          {/* Top Pill */}
          <div className="glass-card px-4 py-1.5 rounded-full flex items-center gap-2 mb-10 border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow"></div>
            <span className="font-mono text-[10px] sm:text-xs font-bold text-accent uppercase tracking-widest">
              Institutional RWA Yield · Solana
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-[4rem] sm:text-[5.5rem] md:text-[7rem] font-bold leading-[1.05] tracking-tight text-center mb-8">
            <span className="text-white block">One token.</span>
            <span className="text-accent block">Every RWA yield</span>
            <span className="text-white block">on Solana.</span>
          </h1>

          {/* Subheadline */}
          <p className="font-body text-muted text-lg sm:text-xl text-center max-w-[600px] leading-relaxed mb-12">
            Vela auto-routes your USDC across the highest-yielding Real-World
            Asset protocols like Ondo, Kamino, BlackRock BUIDL, and beyond and
            compounds everything into a single receipt token.
          </p>

          {/* CTA */}
          <button
            onClick={() => setModalOpen(true)}
            className="bg-accent text-black font-bold px-8 py-4 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(0,194,255,0.4)] transition-all duration-200 mb-20"
          >
            Join the Waitlist
          </button>

          {/* Stats Bar */}
          <div className="w-full max-w-4xl glass-card rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <span className="font-mono font-bold text-4xl text-accent mb-2">
                $2B+
              </span>
              <span className="font-mono text-[10px] text-muted tracking-widest uppercase font-semibold">
                Solana RWA Market
              </span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <span className="font-mono font-bold text-4xl text-accent mb-2">
                5+
              </span>
              <span className="font-mono text-[10px] text-muted tracking-widest uppercase font-semibold">
                Issuers Auto-Routed
              </span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <span className="font-mono font-bold text-4xl text-accent mb-2">
                ~5.8%
              </span>
              <span className="font-mono text-[10px] text-muted tracking-widest uppercase font-semibold">
                Target APY
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. The Problem Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#08090f] to-[#0a0d16]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8 reveal-on-scroll">
            <div className="h-px w-8 bg-accent"></div>
            <span className="font-mono text-accent text-xs font-bold tracking-[0.2em] uppercase">
              The Problem
            </span>
            <div className="h-px w-8 bg-accent"></div>
          </div>

          <h2
            className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6 reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            Managing RWA yield{" "}
            <span className="text-secondary block">
              on Solana is a full-time job.
            </span>
          </h2>

          <p
            className="font-body text-muted text-lg max-w-[800px] mb-20 leading-relaxed reveal-on-scroll"
            style={{ transitionDelay: "200ms" }}
          >
            Accessing real-world asset yield on-chain today is a manual,
            multi-step, high-friction process. Institutions deserve better
            infrastructure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-8">
            {/* Card 1 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "300ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Fragmented Access
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                Institutional RWA yield is siloed across dozens of custodians,
                platforms, and legal jurisdictions. There is no unified on-chain
                layer to aggregate, compare, or allocate efficiently.
              </p>
            </div>
            {/* Card 2 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "400ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Opacity at Scale
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                Traditional off-chain vehicles offer minimal real-time
                transparency. Yield reporting is delayed, counterparty risk is
                opaque, and on-chain auditability is virtually nonexistent.
              </p>
            </div>
            {/* Card 3 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "500ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Capital Inefficiency
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                Fragmented liquidity across RWA platforms means institutions
                cannot dynamically rebalance. Idle capital sits between
                settlement cycles, eroding net yield by 200–350 bps.
              </p>
            </div>
          </div>

          {/* Bottom Stat Banner */}
          <div
            className="w-full glass-card rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-left gap-8 reveal-on-scroll"
            style={{ transitionDelay: "600ms" }}
          >
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
              <span className="font-display font-bold text-5xl md:text-6xl text-white tracking-tight">
                $14T+
              </span>
              <span className="font-body text-muted text-sm max-w-[150px]">
                in tokenisable RWA by 2030
              </span>
            </div>
            <div className="hidden md:block w-px h-16 bg-border"></div>
            <div className="flex-1 font-body text-muted text-lg leading-relaxed">
              Less than <strong className="text-white font-semibold">0.3%</strong>{" "}
              of global institutional RWA is currently accessible on-chain. The
              infrastructure gap is the opportunity.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interstitial / Scroll Break */}
      <section className="relative py-32 bg-[#06080e] flex flex-col items-center justify-center min-h-[50vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,194,255,0.05)_0%,_transparent_60%)]"></div>

        <div className="relative z-10 flex flex-col items-center reveal-on-scroll">
          <span className="font-mono text-accent/50 text-[10px] font-bold tracking-widest mb-4 uppercase">
            Scroll
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-accent/50 to-transparent mb-8"></div>

          <div className="bg-[#2A1D0B] border border-secondary/30 rounded-xl px-12 py-6 shadow-[0_0_40px_rgba(245,166,35,0.05)]">
            <span className="font-mono text-secondary text-sm md:text-base font-medium tracking-tight">
              You're leaving 30-80 bps on the table. Every day.
            </span>
          </div>

          <div className="w-px h-16 bg-gradient-to-b from-transparent to-accent/50 mt-8 mb-4"></div>
          <span className="font-mono text-accent/50 text-[10px] font-bold tracking-widest uppercase">
            Scroll
          </span>
        </div>
      </section>

      {/* 5. How Vela Works (Simplified for Individuals & Institutions) */}
      <section className="relative py-32 px-6 bg-[#0a0d16] border-y border-border">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8 reveal-on-scroll">
            <div className="h-px w-8 bg-accent"></div>
            <span className="font-mono text-accent text-xs font-bold tracking-[0.2em] uppercase">
              How Vela Works
            </span>
            <div className="h-px w-8 bg-accent"></div>
          </div>

          <h2
            className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-2 reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            Deposit <span className="text-accent">USDC</span>. Receive{" "}
            <span className="text-accent">yUSDC</span>.
          </h2>
          <h2
            className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-8 reveal-on-scroll"
            style={{ transitionDelay: "150ms" }}
          >
            Earn the best <span className="text-accent">RWA yield</span> on
            Solana.
          </h2>

          <p
            className="font-body text-muted text-lg max-w-[700px] mb-20 leading-relaxed reveal-on-scroll"
            style={{ transitionDelay: "200ms" }}
          >
            Vela abstracts the complexity of multi-protocol RWA access into a single, unified workflow designed for everyone from individual allocators to institutional capital.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {/* Step 1 */}
            <div
              className="glass-card rounded-2xl p-10 relative overflow-hidden reveal-on-scroll"
              style={{ transitionDelay: "300ms" }}
            >
              <div className="absolute top-6 right-6 font-mono text-accent/10 text-6xl font-black select-none pointer-events-none">
                01
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative z-10">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4 relative z-10">
                Connect Wallet
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed relative z-10">
                Connect any Solana wallet. Your address is credentialed on-chain instantly—no manual onboarding. Start allocating with zero minimums.
              </p>
            </div>
            {/* Step 2 */}
            <div
              className="glass-card rounded-2xl p-10 relative overflow-hidden reveal-on-scroll"
              style={{ transitionDelay: "400ms" }}
            >
              <div className="absolute top-6 right-6 font-mono text-accent/10 text-6xl font-black select-none pointer-events-none">
                02
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative z-10">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4 relative z-10">
                Deposit & Route
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed relative z-10">
                Deposit USDC into the Vela smart contract. Our Allocation Engine instantly routes your capital across the highest-yielding verified RWA vaults.
              </p>
            </div>
            {/* Step 3 */}
            <div
              className="glass-card rounded-2xl p-10 relative overflow-hidden reveal-on-scroll"
              style={{ transitionDelay: "500ms" }}
            >
              <div className="absolute top-6 right-6 font-mono text-accent/10 text-6xl font-black select-none pointer-events-none">
                03
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative z-10">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4 relative z-10">
                Earn & Compound
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed relative z-10">
                Receive yUSDC in return. Yields are settled on-chain and auto-compounded continuously. Full position analytics available via dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Architecture Diagram */}
      <section className="relative py-32 px-6 bg-[#08090f] flex justify-center">
        <div className="w-full max-w-[1000px] glass-card rounded-3xl p-8 md:p-16 relative reveal-on-scroll">
          <div className="absolute top-8 left-8 flex items-center gap-2 text-accent font-mono text-xs font-bold tracking-widest">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 9l3 3-3 3m5 0h3M4 6h16v12H4z"
              ></path>
            </svg>
            <span>⌥ VELA_PROTOCOL :: ARCHITECTURE_V1</span>
          </div>

          <div className="flex flex-col items-center mt-12 w-full relative">
            {/* Top Node */}
            <div className="bg-white text-black font-display font-bold px-12 py-4 rounded-full text-sm z-10 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Your USDC
            </div>

            {/* Vertical Line */}
            <svg className="h-16 w-4 -my-2" viewBox="0 0 4 64">
              <line
                x1="2"
                y1="0"
                x2="2"
                y2="64"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
            </svg>

            {/* Router Label */}
            <span className="font-mono text-accent text-[10px] font-bold tracking-widest mb-2 z-10 bg-[#08090f] px-2">
              VELA PROTOCOL
            </span>

            {/* Middle Node */}
            <div className="bg-[#003B4D] border border-accent text-accent font-display font-bold px-12 py-4 rounded-xl text-sm z-10 shadow-[0_0_30px_rgba(0,194,255,0.1)]">
              Vela Yield Router
            </div>

            {/* Branching Lines (Visual approximation) */}
            <svg
              className="h-16 w-full max-w-[600px] -my-2"
              viewBox="0 0 600 64"
              preserveAspectRatio="none"
            >
              <path
                d="M300 0 L300 32 L50 32 L50 64"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M300 0 L300 32 L175 32 L175 64"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M300 0 L300 64"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M300 0 L300 32 L425 32 L425 64"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M300 0 L300 32 L550 32 L550 64"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                className="dash-line"
              />
            </svg>

            {/* Protocols Row */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 z-10 w-full">
              <div className="glass-card border-secondary/50 text-secondary font-body text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,166,35,0.05)]">
                Ondo USDY
              </div>
              <div className="glass-card border-secondary/50 text-secondary font-body text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,166,35,0.05)]">
                BlackRock BUIDL
              </div>
              <div className="glass-card border-secondary/50 text-secondary font-body text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,166,35,0.05)]">
                Franklin FOBXX
              </div>
              <div className="glass-card border-secondary/50 text-secondary font-body text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,166,35,0.05)]">
                WisdomTree
              </div>
              <div className="glass-card border-secondary/50 text-secondary font-body text-xs md:text-sm font-medium px-4 md:px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,166,35,0.05)]">
                OpenEden
              </div>
            </div>

            {/* Converging Lines */}
            <svg
              className="h-16 w-full max-w-[600px] -my-2"
              viewBox="0 0 600 64"
              preserveAspectRatio="none"
            >
              <path
                d="M50 0 L50 32 L300 32 L300 64"
                fill="none"
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M175 0 L175 32 L300 32 L300 64"
                fill="none"
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M300 0 L300 64"
                fill="none"
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M425 0 L425 32 L300 32 L300 64"
                fill="none"
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="2"
                className="dash-line"
              />
              <path
                d="M550 0 L550 32 L300 32 L300 64"
                fill="none"
                stroke="rgba(16,185,129,0.4)"
                strokeWidth="2"
                className="dash-line"
              />
            </svg>

            {/* Bottom Node */}
            <div className="bg-[#022C22] border border-[#10B981] text-[#10B981] font-display font-bold px-12 py-4 rounded-xl text-sm z-10 shadow-[0_0_30px_rgba(16,185,129,0.1)] flex items-center gap-2">
              yUSDC <span className="font-mono text-lg leading-none">↑</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Built for You */}
      <section className="relative py-32 px-6 bg-[#0a0d16] border-y border-border">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-8 reveal-on-scroll">
            <div className="h-px w-8 bg-accent"></div>
            <span className="font-mono text-accent text-xs font-bold tracking-[0.2em] uppercase">
              Vela is Built for Institutions
            </span>
            <div className="h-px w-8 bg-accent"></div>
          </div>

          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-20 reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            Serious capital deserves<br />
            serious infrastructure.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            {/* Card 1 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "200ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Multi-issuer routing
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                Not locked to one issuer. Vela dynamically rebalances across
                top-tier RWA providers like Ondo and BUIDL—chasing the optimal yield in real time.
              </p>
            </div>
            {/* Card 2 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "300ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Single receipt token
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                yUSDC is natively yield-bearing via Token-2022 extensions. Yield accrues automatically without rebasing—clean for your accounting and tax treatment.
              </p>
            </div>
            {/* Card 3 */}
            <div
              className="glass-card rounded-2xl p-8 hover:border-[rgba(255,255,255,0.1)] transition-colors reveal-on-scroll"
              style={{ transitionDelay: "400ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  ></path>
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">
                DeFi composable
              </h3>
              <p className="font-body text-muted text-sm leading-relaxed">
                Use yUSDC as collateral in lending protocols from day one. Your capital works harder while generating passive RWA yield in the background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Early Access / CTA Section */}
      <section id="early-access" className="relative py-32 px-6 bg-[#08090f] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,194,255,0.1)_0%,_transparent_70%)]"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 reveal-on-scroll">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-accent"></div>
            <span className="font-mono text-accent text-xs font-bold tracking-[0.2em] uppercase">
              Early Access
            </span>
            <div className="h-px w-8 bg-accent"></div>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            There is no <span className="text-accent">Jupiter</span><br />
            for RWA yield.
          </h2>

          <p className="font-body text-muted text-lg max-w-[600px] mb-12">
            We're building it. Be first when Vela goes live on Solana mainnet.
          </p>

          <button
              onClick={() => setModalOpen(true)}
              className="bg-accent text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(0,194,255,0.4)] transition-all duration-200"
            >
              Request Early Access
            </button>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="relative pt-20 pb-12 px-6 bg-[#0a0d16] border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-0 relative z-10">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2 L4 16 L14 20 Z" fill="#ffffff" />
                <path d="M4 16 L18 28 L14 20 Z" fill="#ffffff" />
                <path d="M18 4 L18 28 L14 20 Z" fill="#00C2FF" />
              </svg>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Vela
              </span>
            </div>
            <p className="font-body text-muted text-sm max-w-[250px]">
              One token. Every RWA yield on Solana, auto-compounded.
            </p>
          </div>

          {/* Center */}
          <div className="flex flex-wrap gap-8 font-body text-sm font-medium text-muted">
            <Link href="#" className="hover:text-white transition-colors">
              X (Twitter)
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-1 text-left md:text-right font-body text-xs text-muted/60 font-medium">
            <span>© 2026 Vela Protocol</span>
            <span>Protocol in devnet.</span>
          </div>
        </div>

        {/* Massive Watermark */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-1/3 select-none pointer-events-none opacity-[0.03]">
          <h1 className="font-display font-black text-[30vw] leading-none tracking-tight text-white m-0 p-0">
            VELA
          </h1>
        </div>
      </footer>
    </div>
  );
}
