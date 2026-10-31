import React from 'react';
import { ActiveView } from '../types.ts';
import { 
  Compass, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  FileCheck, 
  FileQuestion, 
  Sparkles,
  BookOpen,
  Scale,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLoadScenario }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/80">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-700/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Platform Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-800/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                AI-Powered Evidence Verification & Dark Spot Discovery
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Uncover the <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Digital Dark Spots</span> in your research.
            </h1>

            {/* Subheading / Value Proposition */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              Ordinary search engines summarize what is written. <strong className="text-white font-semibold">Digital Dark Spot</strong> analyzes multiple conflicting sources to reveal what is <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-4">missing</span>, <span className="text-red-400 underline decoration-red-500/50 underline-offset-4">contradictory</span>, or <span className="text-orange-400 underline decoration-orange-500/50 underline-offset-4">outdated</span> before you make critical decisions.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('new-research')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start New Research</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onLoadScenario('scholarship')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Live Scholarship Demo</span>
              </button>
            </div>

            {/* Benchmark stats */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-900 mt-10">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <p className="text-2xl font-bold text-cyan-400">100%</p>
                <p className="text-xs text-slate-400 font-medium">Grounded in Evidence</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <p className="text-2xl font-bold text-amber-400">Zero</p>
                <p className="text-xs text-slate-400 font-medium">Hallucinated Citations</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <p className="text-2xl font-bold text-emerald-400">SSRF Safe</p>
                <p className="text-xs text-slate-400 font-medium">Internal IP Protection</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                <p className="text-2xl font-bold text-indigo-400">Actionable</p>
                <p className="text-xs text-slate-400 font-medium">Priority Checklist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Contrast: Search vs Digital Dark Spot */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">The Information Dilemma</h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">Why standard search engines fail high-stakes decisions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Conventional Tools */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/60 text-red-400 text-xs font-semibold mb-4 border border-red-900/40">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Standard Search & LLM Summarizers</span>
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-3">Answers only what you explicitly ask</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Ignores missing information: If a document omits a crucial renewal rule, search engines say nothing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Blindly accepts outdated articles from 2023–24 alongside 2026 guidelines without cycle tagging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Averages out contradictions instead of alerting you to conflicting legal or eligibility requirements.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                Result: Blindspots cause students and applicants to lose scholarships and admissions.
              </div>
            </div>

            {/* Digital Dark Spot */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border border-cyan-800/50 shadow-xl shadow-cyan-950/20 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 text-cyan-400 text-xs font-semibold mb-4 border border-cyan-800/60">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Digital Dark Spot Platform</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Highlights what is NOT there and what conflicts</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Dark Spot Gap Detection:</strong> Identifies unaddressed questions against domain benchmarks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Contradiction Spotter:</strong> Pinpoints discrepancies (e.g. income caps or postal vs online format).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Outdated Cycle Warning:</strong> Distinguishes 2024–25 obsolete data from active 2026–27 directives.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-cyan-900/40 text-xs text-cyan-300 font-medium">
                Result: A verified, transparent decision report with an actionable checklist.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Platform Capabilities</h2>
          <p className="text-3xl font-extrabold text-white">Engineered for Evidence & Verification</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-5">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Information Gap Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cross-examines all sources against comprehensive domain checklists (eligibility, documentation, renewal rules) to map completely unanswered or partially addressed questions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-5">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contradiction Analysis</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pairs claims across sources to detect conflicting numbers, required documentation modes, or eligibility cutoffs. Distinguishes genuine conflicts from application-cycle shifts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-orange-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-950 border border-orange-800/50 flex items-center justify-center text-orange-400 mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Outdated Information Sentinel</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tags sources as Current, Potentially Outdated, Undated, or Date Unavailable by analyzing publication timestamps and cycle markers (e.g. 2024–25 vs 2026–27).
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Verifiable Evidence Trail</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zero fabricated claims. Every extracted point contains an exact supporting quotation, source URL attribution, and publication timestamp for immediate human audit.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Priority Verification Checklist</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Converts complex multi-source findings into an interactive checklist ranked into High, Medium, and Low priorities with clear instructions on who to call or where to look.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-800/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Explainable Completeness Score</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Measures coverage of predefined domain questions: <code>(Answered / Total) × 100</code> with transparent disclaimers that it reflects source coverage rather than omniscience.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Pipeline) */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Workflow Pipeline</h2>
            <p className="text-3xl font-extrabold text-white">How Digital Dark Spot Works</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative p-5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/30">01</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Enter Inquiry & Topic</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your research topic (e.g. Scholarship application, college admission cutoffs, internship criteria).
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/30">02</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Add Multiple Sources</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit public web URLs, pasted notices, or document extracts. Backend validates links with SSRF defense.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/30">03</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">AI Cross-Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts claims, flags contradictions, spots missing questions (dark spots), and evaluates staleness.
              </p>
            </div>

            <div className="relative p-5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-3xl font-black text-cyan-500/30">04</span>
              <h4 className="text-base font-bold text-white mt-2 mb-1">Verification Report</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive evidence-based findings, research completeness score, and an actionable priority verification checklist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Showcase Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/50 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/60 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready-to-Demo Benchmark Scenario</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Try the National Merit Scholarship 2026–27 Analysis
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              See Digital Dark Spot catch a critical missing renewal clause, an obsolete 2024–25 income limit, and a high-risk contradiction between postal paper submission and paperless portal upload.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onLoadScenario('scholarship')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Load Scholarship Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-600 flex items-center justify-center text-white text-[10px] font-bold">
              DS
            </div>
            <span className="text-slate-300 font-medium">Digital Dark Spot</span>
            <span>– Evidence-Based Research Platform</span>
          </div>
          <p className="text-center sm:text-right">
            Designed for truth, transparency, and research integrity. Built with React, Express, and Gemini API.
          </p>
        </div>
      </footer>
    </div>
  );
};
