import React, { useState } from 'react';
import { ActiveView, ResearchProject, SourceItem } from '../types.ts';
import { fetchUrlSource, parseTextSource, analyzeResearch } from '../services/apiClient.ts';
import { 
  Plus, 
  Trash2, 
  Globe, 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface NewResearchViewProps {
  onAnalysisComplete: (project: ResearchProject) => void;
  onNavigate: (view: ActiveView) => void;
}

export const NewResearchView: React.FC<NewResearchViewProps> = ({
  onAnalysisComplete,
  onNavigate,
}) => {
  const [topic, setTopic] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [sources, setSources] = useState<SourceItem[]>([]);
  
  // Source input mode: 'url' | 'paste' | 'upload'
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'upload'>('url');

  // URL input state
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Paste text state
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [pasteCycle, setPasteCycle] = useState('');
  const [pasteDate, setPasteDate] = useState('');

  // Analysis running state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Quick templates
  const templates = [
    {
      label: 'Scholarship Application',
      topic: 'National Merit STEM Scholarship 2026–27',
      question: 'What should I verify before applying, and what renewal criteria or document policies are missing?',
    },
    {
      label: 'College Admissions',
      topic: 'B.Tech Computer Science Admissions & Cutoffs',
      question: 'What are the qualifying entrance ranks, document verification procedures, and credit transfer policies?',
    },
    {
      label: 'Tech Internship',
      topic: 'Software Engineering Summer Internship 2027',
      question: 'What are the batch graduation year restrictions, compensation details, and intellectual property/bond requirements?',
    },
    {
      label: 'Government Scheme',
      topic: 'National Startup Seed Grant Scheme 2026',
      question: 'What are the mandatory founder eligibility criteria, fund disbursement milestones, and non-dilutive equity clauses?',
    },
  ];

  const handleApplyTemplate = (t: typeof templates[0]) => {
    setTopic(t.topic);
    setResearchQuestion(t.question);
  };

  // Add URL source
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsFetchingUrl(true);
    setUrlError(null);

    try {
      const source = await fetchUrlSource(urlInput.trim());
      setSources(prev => [...prev, source]);
      setUrlInput('');
      if (source.status === 'failed') {
        setUrlError(`Note: Source returned an error (${source.errorMessage}). It is saved but will be handled accordingly.`);
      }
    } catch (err: any) {
      setUrlError(err?.message || 'Failed to fetch the webpage. Verify URL and network status.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Add Pasted Text source
  const handleAddPastedText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    try {
      const source = await parseTextSource(
        pasteTitle.trim() || 'Custom Document',
        pasteContent.trim(),
        'text',
        pasteCycle.trim() || undefined,
        pasteDate.trim() || undefined
      );
      setSources(prev => [...prev, source]);
      setPasteTitle('');
      setPasteContent('');
      setPasteCycle('');
      setPasteDate('');
    } catch (err: any) {
      setAnalysisError(err?.message || 'Failed to process pasted text.');
    }
  };

  // File Upload handler (.txt, .md, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const source = await parseTextSource(
        file.name,
        content,
        'file'
      );
      setSources(prev => [...prev, source]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Remove source
  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  // Run AI analysis
  const handleStartAnalysis = async () => {
    if (!topic.trim()) {
      setAnalysisError('Please enter a research topic to begin analysis.');
      return;
    }
    if (sources.length === 0) {
      setAnalysisError('Please provide at least one source (URL, text, or file) to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      setAnalysisStep('1/4: Ingesting sources & validating content integrity...');
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep('2/4: Extracting verifiable factual claims & quotes...');
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep('3/4: Spotting cross-source contradictions & outdated cycle tags...');
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep('4/4: Cross-referencing benchmark questions to detect Information Dark Spots...');
      
      const completedProject = await analyzeResearch(
        undefined,
        topic.trim(),
        researchQuestion.trim() || `Key verification analysis for ${topic.trim()}`,
        sources
      );

      onAnalysisComplete(completedProject);
    } catch (err: any) {
      setAnalysisError(err?.message || 'Analysis failed. Please check your sources and retry.');
      setIsAnalyzing(false);
    }
  };

  const validSourcesCount = sources.filter(s => s.status === 'valid').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create New Research Verification
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Provide your research query and multiple sources. Digital Dark Spot will cross-examine them to identify missing clauses, outdated data, and contradictions.
        </p>
      </div>

      {/* Quick Template Selector */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Research Templates:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {templates.map(t => (
            <button
              key={t.label}
              type="button"
              onClick={() => handleApplyTemplate(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
            >
              + {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Research Topic & Core Question */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center text-xs font-bold">
            1
          </span>
          <h2 className="text-base font-bold text-white">Research Focus & Inquiry</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Topic or Program Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. National Merit STEM Scholarship 2026–27 or B.Tech CSE Admissions"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Primary Research Question / Areas of Concern
            </label>
            <textarea
              rows={2}
              value={researchQuestion}
              onChange={e => setResearchQuestion(e.target.value)}
              placeholder="e.g. What critical eligibility rules, renewal CGPA cutoffs, and document submission modes must I verify before applying?"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Source Collection (URL, Paste Text, Upload) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h2 className="text-base font-bold text-white">Provide Research Sources</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {sources.length} source(s) added
          </span>
        </div>

        {/* Source Method Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Web URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text Notice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Tab 1: URL Input */}
        {activeTab === 'url' && (
          <form onSubmit={handleAddUrl} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.gov.in/notifications/circular-2026.html"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isFetchingUrl || !urlInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {isFetchingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add URL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Protected by SSRF guards. Localhost, cloud metadata, and private IP addresses are automatically blocked.
            </p>
            {urlError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{urlError}</span>
              </div>
            )}
          </form>
        )}

        {/* Tab 2: Paste Text */}
        {activeTab === 'paste' && (
          <form onSubmit={handleAddPastedText} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={pasteTitle}
                onChange={e => setPasteTitle(e.target.value)}
                placeholder="Document Title (e.g. Directorate Notice 2026)"
                className="sm:col-span-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={pasteCycle}
                onChange={e => setPasteCycle(e.target.value)}
                placeholder="Cycle / Session (e.g. 2026–27)"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={pasteDate}
                onChange={e => setPasteDate(e.target.value)}
                placeholder="Publication Date (e.g. 2026-08-15)"
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <textarea
              rows={4}
              value={pasteContent}
              onChange={e => setPasteContent(e.target.value)}
              placeholder="Paste raw notice text, terms and conditions, or circular clauses here..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 resize-none font-mono"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!pasteContent.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pasted Document</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload Document */}
        {activeTab === 'upload' && (
          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-700/60 rounded-2xl p-6 text-center transition-colors">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              Upload text notices, syllabus outlines, or admission brochures
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Supports .txt, .md, .json, .csv files</p>
            <label className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer transition-colors">
              Browse Files
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Added Sources List */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Collected Sources ({sources.length}):
          </span>

          {sources.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500">
              No sources added yet. Provide at least two sources for optimal cross-source contradiction and gap detection.
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map(source => (
                <div
                  key={source.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    source.status === 'failed'
                      ? 'bg-red-950/30 border-red-900/50 text-red-300'
                      : source.status === 'warning'
                      ? 'bg-amber-950/30 border-amber-900/50 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white truncate max-w-sm">
                        {source.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400">
                        {source.type}
                      </span>
                      {source.cycleInfo && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                          Cycle: {source.cycleInfo}
                        </span>
                      )}
                      {source.publishedDate && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-900 border border-slate-800">
                          Date: {source.publishedDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{source.wordCount} words</span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                        >
                          <span className="truncate">{source.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>

                    {source.errorMessage && (
                      <p className="text-[11px] text-red-400 italic">
                        {source.errorMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSource(source.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                    title="Remove source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Error Notification */}
      {analysisError && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Step 3: Trigger Analysis */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          {sources.length < 2
            ? 'Tip: Add 2 or more sources to enable cross-source contradiction spotting and staleness checks.'
            : 'Ready to cross-examine sources and detect Information Dark Spots.'}
        </p>

        <button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing || !topic.trim() || sources.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Research...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Research</span>
            </>
          )}
        </button>
      </div>

      {/* Live Progress Overlay during Analysis */}
      {isAnalyzing && (
        <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Digital Dark Spot Intelligence Engine Active</span>
          </div>
          <p className="text-sm font-medium text-white">{analysisStep}</p>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full w-3/4 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
