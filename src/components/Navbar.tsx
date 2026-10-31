import React from 'react';
import { ActiveView, ResearchProject } from '../types.ts';
import { 
  Compass, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  CheckSquare
} from 'lucide-react';

interface NavbarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  activeProject: ResearchProject | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeProject,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Digital Dark Spot
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">AI Information Gap Detection Platform</p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('new-research')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'new-research'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Research</span>
            </button>

            {activeProject?.analysis && (
              <>
                <button
                  onClick={() => onNavigate('analysis')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentView === 'analysis'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline">Analysis Report</span>
                  {activeProject.analysis.gaps.filter(g => g.status === 'unanswered').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('checklist')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentView === 'checklist'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span className="hidden md:inline">Checklist</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {activeProject.analysis.verificationChecklist.filter(t => t.isCompleted).length}/
                    {activeProject.analysis.verificationChecklist.length}
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
