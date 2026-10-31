import React, { useState, useMemo } from 'react';
import { ActiveView, ResearchProject } from '../types.ts';
import { 
  PlusCircle, 
  Sparkles, 
  AlertTriangle, 
  FileQuestion, 
  Layers, 
  Clock, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  Search,
  X,
  BookOpen
} from 'lucide-react';

interface DashboardViewProps {
  projects: ResearchProject[];
  onSelectProject: (project: ResearchProject, view: ActiveView) => void;
  onNavigate: (view: ActiveView) => void;
  onDeleteProject: (id: string) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
  onDeleteProject,
  onLoadScenario,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Compute aggregate metrics
  const totalProjects = projects.length;
  const totalSources = projects.reduce((acc, p) => acc + p.sources.length, 0);
  
  let totalGaps = 0;
  let totalContradictions = 0;
  let completenessSum = 0;
  let completedAnalyses = 0;

  for (const p of projects) {
    if (p.analysis) {
      completedAnalyses++;
      totalGaps += p.analysis.gaps.filter(g => g.status === 'unanswered').length;
      totalContradictions += p.analysis.contradictions.length;
      completenessSum += p.analysis.completeness.completenessPercentage;
    }
  }

  const avgCompleteness = completedAnalyses > 0 ? Math.round(completenessSum / completedAnalyses) : 0;

  // Filter projects by title, research question, or extracted claims/gaps categories
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter(p => {
      // 1. Match title
      if (p.title.toLowerCase().includes(q)) return true;

      // 2. Match research question
      if (p.researchQuestion.toLowerCase().includes(q)) return true;

      // 3. Match extracted categories / topics
      if (p.analysis) {
        const hasClaimCategory = p.analysis.claims.some(c => 
          c.category.toLowerCase().includes(q) || c.claim.toLowerCase().includes(q)
        );
        if (hasClaimCategory) return true;

        const hasGapTopic = p.analysis.gaps.some(g =>
          g.category.toLowerCase().includes(q) || g.question.toLowerCase().includes(q)
        );
        if (hasGapTopic) return true;
      }

      // 4. Match source titles
      if (p.sources.some(s => s.title.toLowerCase().includes(q))) return true;

      return false;
    });
  }, [projects, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Research Verification Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Active Workspace
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Detecting hidden information gaps, conflicting requirements, and outdated cycle data across multiple sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-research')}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Research</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Research Projects</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{totalProjects}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Persistent database records</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sources Processed</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400 tabular-nums">{totalSources}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">URLs & documents</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Dark Spots (Gaps)</span>
            <FileQuestion className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">{totalGaps}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Unanswered critical questions</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Contradictions</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-red-400 tabular-nums">{totalContradictions}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cross-source discrepancies</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Completeness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">{avgCompleteness}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Benchmark inquiry coverage</p>
          </div>
        </div>
      </div>

      {/* Quick Launch Benchmark Scenarios */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Pre-Configured Verification Scenarios</h2>
          </div>
          <span className="text-xs text-cyan-300 font-mono">1-Click Multi-Source Studies</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Instant multi-source analyses demonstrating conflicting income thresholds, obsolete cycle notices, and unaddressed renewal clauses.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Scenario 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/50">
                  Scholarship
                </span>
                <span className="text-[10px] text-slate-500 font-mono">3 Sources</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                National Merit Scholarship 2026–27
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                Detects missing renewal CGPA, postal vs online upload conflict, and obsolete 2024–25 income limits.
              </p>
            </div>
            <button
              onClick={() => onLoadScenario('scholarship')}
              className="mt-4 w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Load Case Study</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/50">
                  Admissions
                </span>
                <span className="text-[10px] text-slate-500 font-mono">2 Sources</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                B.Tech CS Admissions & Lateral Transfers
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                Catches unconfirmed coaching blog cutoff rumors (87% vs 92.5%) and unaddressed lateral credit rules.
              </p>
            </div>
            <button
              onClick={() => onLoadScenario('admissions')}
              className="mt-4 w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Load Case Study</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-700/60 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/50">
                  Internship
                </span>
                <span className="text-[10px] text-slate-500 font-mono">2 Sources</span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Software Engineering Internship 2027
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                Flags batch mismatch (2027 vs 2028 batch) and identifies complete absence of intellectual property clauses.
              </p>
            </div>
            <button
              onClick={() => onLoadScenario('internship')}
              className="mt-4 w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Load Case Study</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Research Projects Section with Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Previous Research Studies</h2>
            <p className="text-xs text-slate-400">
              Showing {filteredProjects.length} of {projects.length} project(s)
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic, question, or category..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Project List / Empty States */}
        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No research projects yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start your first multi-source analysis or load a preset study scenario above.
            </p>
            <button
              onClick={() => onNavigate('new-research')}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
            >
              Create New Research
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">No projects match your search</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No results found for &ldquo;<span className="text-cyan-300">{searchQuery}</span>&rdquo;. Try searching for &ldquo;scholarship&rdquo;, &ldquo;admissions&rdquo;, or &ldquo;eligibility&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map(project => {
              const gapsCount = project.analysis?.gaps.filter(g => g.status === 'unanswered').length ?? 0;
              const contraCount = project.analysis?.contradictions.length ?? 0;
              const completeness = project.analysis?.completeness.completenessPercentage ?? null;

              return (
                <div
                  key={project.id}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white hover:text-cyan-400 transition-colors text-base cursor-pointer"
                        onClick={() => onSelectProject(project, 'analysis')}
                      >
                        {project.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        project.status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                          : project.status === 'analyzing'
                          ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/50 animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {project.researchQuestion}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>{project.sources.length} source(s)</span>
                      <span>•</span>
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      {completeness !== null && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Completeness: {completeness}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Dark Spots Badge */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {gapsCount > 0 && (
                          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60" title="Information Dark Spots identified">
                            {gapsCount} Gaps
                          </span>
                        )}
                        {contraCount > 0 && (
                          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/60" title="Cross-source contradictions flagged">
                            {contraCount} Contradictions
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => onSelectProject(project, 'analysis')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Report
                    </button>

                    <button
                      onClick={() => onSelectProject(project, 'checklist')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Checklist
                    </button>

                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
