import React, { useState } from 'react';
import { ActiveView, ClaimCategory, ResearchProject } from '../types.ts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileQuestion, 
  Scale, 
  Printer, 
  Download, 
  ExternalLink, 
  CheckSquare, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Info,
  ShieldAlert,
  ChevronDown,
  Layers,
  Search
} from 'lucide-react';

interface AnalysisResultsViewProps {
  project: ResearchProject;
  onNavigate: (view: ActiveView) => void;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  project,
  onNavigate,
}) => {
  const analysis = project.analysis;
  const [activeTab, setActiveTab] = useState<'gaps' | 'contradictions' | 'claims' | 'outdated' | 'sources' | 'limitations'>('gaps');
  const [selectedClaimCategory, setSelectedClaimCategory] = useState<string>('ALL');

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <FileQuestion className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Analysis Available</h2>
        <p className="text-sm text-slate-400">This project has not completed analysis yet.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Export report as Markdown file
  const handleExportMarkdown = () => {
    let md = `# Research Verification Report: ${project.title}\n`;
    md += `**Date:** ${new Date(analysis.analyzedAt).toLocaleString()}\n`;
    md += `**Model:** ${analysis.modelUsed}\n`;
    md += `**Completeness Score:** ${analysis.completeness.completenessPercentage}% (${analysis.completeness.answeredQuestions}/${analysis.completeness.totalQuestions} questions covered)\n\n`;

    md += `## 1. Research Inquiry\n${project.researchQuestion}\n\n`;
    md += `## 2. Overview\n${analysis.overview}\n\n`;

    md += `## 3. Potential Information Gaps (Digital Dark Spots)\n`;
    analysis.gaps.forEach((g, i) => {
      md += `### ${i + 1}. [${g.status.toUpperCase()}] [${g.impact} Impact] ${g.question}\n`;
      md += `- **Category:** ${g.category}\n`;
      md += `- **Explanation:** ${g.explanation}\n`;
      md += `- **Suggested Action:** ${g.suggestedWhereToLook}\n\n`;
    });

    md += `## 4. Flagged Contradictions & Discrepancies\n`;
    analysis.contradictions.forEach((c, i) => {
      md += `### Discrepancy ${i + 1}: ${c.subject}\n`;
      md += `- **Source A (${c.sourceA.sourceTitle}):** "${c.sourceA.claim}"\n`;
      md += `- **Source B (${c.sourceB.sourceTitle}):** "${c.sourceB.claim}"\n`;
      md += `- **Reason:** ${c.reason}\n`;
      md += `- **Suggested Action:** ${c.suggestedAction}\n\n`;
    });

    md += `## 5. Source Health & Staleness Warnings\n`;
    analysis.outdatedWarnings.forEach((w, i) => {
      md += `- **${w.sourceTitle}:** Status: ${w.status} (${w.detectedDateOrCycle || 'No date'}). ${w.explanation}\n`;
    });

    md += `\n## 6. Actionable Verification Checklist\n`;
    analysis.verificationChecklist.forEach((t, i) => {
      md += `- [${t.isCompleted ? 'x' : ' '}] **[${t.priority.toUpperCase()}]** ${t.title}: ${t.description}\n`;
    });

    md += `\n## 7. Research Limitations\n`;
    analysis.researchLimitations.forEach(l => {
      md += `- ${l}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DigitalDarkSpot-Report-${project.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON data
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `DigitalDarkSpot-Data-${project.id}.json`);
    dlAnchorElem.click();
  };

  const categories = Array.from(new Set(analysis.claims.map(c => c.category)));
  const filteredClaims = selectedClaimCategory === 'ALL'
    ? analysis.claims
    : analysis.claims.filter(c => c.category === selectedClaimCategory);

  const unansweredGaps = analysis.gaps.filter(g => g.status === 'unanswered');
  const partialGaps = analysis.gaps.filter(g => g.status === 'partially_answered');
  const answeredGaps = analysis.gaps.filter(g => g.status === 'answered');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {project.title}
              </h1>
              {project.isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700">
                  Sample Study
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()} • {analysis.modelUsed}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('checklist')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-600/30 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Interactive Checklist</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer no-print"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer no-print"
            title="Download Markdown Report"
          >
            <Download className="w-4 h-4" />
            <span>Export MD</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer no-print"
            title="Export Raw JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Overview & Completeness Indicator Card */}
      <div className="grid md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Executive Research Overview</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {analysis.overview}
          </p>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Primary Research Question:
            </span>
            <p className="text-xs text-white font-medium mt-0.5">
              "{project.researchQuestion}"
            </p>
          </div>
        </div>

        {/* Explainable Completeness Gauge */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Research Completeness</span>
            <Info className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">
              {analysis.completeness.completenessPercentage}%
            </span>
            <span className="text-xs text-slate-400">
              ({analysis.completeness.answeredQuestions} of {analysis.completeness.totalQuestions} questions covered)
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
            <div
              className="bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.completeness.completenessPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            {analysis.completeness.explanation}
          </p>
        </div>
      </div>

      {/* Navigation Tabs for Analysis Facets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 no-print">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'gaps'
              ? 'bg-amber-950 text-amber-300 border border-amber-800/60 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileQuestion className="w-4 h-4 text-amber-400" />
          <span>Information Dark Spots ({unansweredGaps.length + partialGaps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contradictions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'contradictions'
              ? 'bg-red-950 text-red-300 border border-red-800/60 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-red-400" />
          <span>Contradictions & Conflicts ({analysis.contradictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Extracted Claims ({analysis.claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('outdated')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'outdated'
              ? 'bg-orange-950 text-orange-300 border border-orange-800/60 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Source Staleness ({analysis.outdatedWarnings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sources Evidence ({project.sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('limitations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'limitations'
              ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Research Limitations</span>
        </button>
      </div>

      {/* TAB 1: INFORMATION DARK SPOTS (GAPS) */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-semibold">Important Methodology Note:</strong> Digital Dark Spot compares your analyzed sources against standard domain questions (eligibility, documentation, renewal obligations, grievance desks). <em>Flagged items indicate vital questions that were NOT addressed in the reviewed documents, not that the information does not exist anywhere.</em>
          </div>

          <div className="grid gap-4">
            {analysis.gaps.map((gap, idx) => {
              const isUnanswered = gap.status === 'unanswered';
              const isPartial = gap.status === 'partially_answered';

              return (
                <div
                  key={gap.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isUnanswered
                      ? 'bg-slate-900/80 border-amber-800/50 hover:border-amber-700'
                      : isPartial
                      ? 'bg-slate-900/60 border-blue-800/40 hover:border-blue-700'
                      : 'bg-slate-900/40 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isUnanswered
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : isPartial
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isUnanswered ? '● Dark Spot (Unanswered)' : isPartial ? '◐ Partially Answered' : '✓ Answered'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {gap.category}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        gap.impact === 'Critical'
                          ? 'bg-red-950 text-red-400'
                          : gap.impact === 'High'
                          ? 'bg-orange-950 text-orange-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {gap.impact} Impact
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {gap.question}
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="text-slate-300">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Reason Flagged:
                      </span>
                      {gap.explanation}
                    </div>

                    {isUnanswered && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                        <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">
                          Recommended Action / Where To Look:
                        </span>
                        {gap.suggestedWhereToLook}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CONTRADICTIONS & CONFLICTS */}
      {activeTab === 'contradictions' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-200/90 leading-relaxed">
            <strong className="text-red-300 font-semibold">Cross-Source Divergence Engine:</strong> The system compares factual parameters (cutoffs, dates, document modes, monetary caps) between pairs of sources. When dates differ, it classifies whether the disagreement is due to an updated application cycle or an outright conflict.
          </div>

          {analysis.contradictions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
              No direct contradictions or parameter clashes detected between the reviewed sources.
            </div>
          ) : (
            <div className="space-y-6">
              {analysis.contradictions.map((contra, idx) => (
                <div
                  key={contra.id || idx}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-red-900/60 shadow-lg shadow-red-950/20 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-red-400 shrink-0" />
                      <h3 className="text-base font-bold text-white">
                        {contra.subject}
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      contra.isCycleDifference
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {contra.isCycleDifference ? 'Application Cycle Shift' : 'Direct Contradiction'}
                    </span>
                  </div>

                  {/* Side-by-side comparison cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Source A */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                          Source A: {contra.sourceA.sourceTitle}
                        </span>
                        {contra.sourceA.dateOrCycle && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                            {contra.sourceA.dateOrCycle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white">
                        "{contra.sourceA.claim}"
                      </p>
                      <blockquote className="text-[11px] text-slate-400 italic border-l-2 border-cyan-800 pl-2">
                        {contra.sourceA.supportingText}
                      </blockquote>
                      {contra.sourceA.sourceUrl && (
                        <a
                          href={contra.sourceA.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 pt-1 truncate"
                        >
                          <span className="truncate">{contra.sourceA.sourceUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>

                    {/* Source B */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          Source B: {contra.sourceB.sourceTitle}
                        </span>
                        {contra.sourceB.dateOrCycle && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                            {contra.sourceB.dateOrCycle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white">
                        "{contra.sourceB.claim}"
                      </p>
                      <blockquote className="text-[11px] text-slate-400 italic border-l-2 border-amber-800 pl-2">
                        {contra.sourceB.supportingText}
                      </blockquote>
                      {contra.sourceB.sourceUrl && (
                        <a
                          href={contra.sourceB.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 pt-1 truncate"
                        >
                          <span className="truncate">{contra.sourceB.sourceUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reconciliation & Analysis Note */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        Discrepancy Analysis:
                      </span>
                      <p className="text-slate-200 mt-0.5">{contra.reason}</p>
                    </div>
                    <div>
                      <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">
                        Recommended Resolution Action:
                      </span>
                      <p className="text-cyan-200 mt-0.5">{contra.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXTRACTED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedClaimCategory('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedClaimCategory === 'ALL'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Categories ({analysis.claims.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedClaimCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedClaimCategory === cat
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({analysis.claims.filter(c => c.category === cat).length})
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredClaims.map((claim, idx) => (
              <div
                key={claim.id || idx}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    {claim.category}
                  </span>
                  {claim.date && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cycle: {claim.date}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-white">
                  {claim.claim}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] text-slate-400 italic border-l-2 border-slate-700">
                  "{claim.supportingText}"
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span className="truncate max-w-[200px]">From: {claim.sourceTitle}</span>
                  {claim.sourceUrl && (
                    <a
                      href={claim.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Original Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOURCE STALENESS & HEALTH */}
      {activeTab === 'outdated' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-800/40 text-xs text-orange-200/90 leading-relaxed">
            <strong className="text-orange-300 font-semibold">Temporal Relevance Filter:</strong> Documents with publication timestamps or academic cycle markers (e.g., 2024–25 vs 2026–27) are audited for potential policy expiration.
          </div>

          <div className="grid gap-4">
            {analysis.outdatedWarnings.map((warning, idx) => (
              <div
                key={warning.id || idx}
                className={`p-5 rounded-2xl border ${
                  warning.status === 'potentially_outdated'
                    ? 'bg-slate-900/80 border-orange-800/60'
                    : warning.status === 'current'
                    ? 'bg-slate-900/60 border-emerald-800/50'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {warning.sourceTitle}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      warning.status === 'potentially_outdated'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : warning.status === 'current'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {warning.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Tag: {warning.detectedDateOrCycle || 'No Date Available'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2">
                  {warning.explanation}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-cyan-300">
                  <strong className="text-slate-400 font-medium">Recommendation: </strong>
                  {warning.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SOURCE EVIDENCE & TRANSPARENCY */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {project.sources.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.title}</h3>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{s.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                      {s.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {s.wordCount} words
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-800/80">
                  {s.content.slice(0, 800)}
                  {s.content.length > 800 && '... [truncated for display]'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RESEARCH LIMITATIONS */}
      {activeTab === 'limitations' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Info className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Platform Methodological Boundaries & Transparency</h2>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {analysis.researchLimitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
