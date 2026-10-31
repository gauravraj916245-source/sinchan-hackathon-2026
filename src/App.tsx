/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, ResearchProject, VerificationTask } from './types.ts';
import { fetchAllProjects, deleteProject as apiDeleteProject, loadDemoScenario } from './services/apiClient.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { NewResearchView } from './components/NewResearchView.tsx';
import { AnalysisResultsView } from './components/AnalysisResultsView.tsx';
import { ChecklistView } from './components/ChecklistView.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('landing');
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load of research projects from backend database
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllProjects();
      setProjects(data);
      if (!activeProject && data.length > 0) {
        // default active to first completed demo project if any
        const demo = data.find(p => p.isDemo) || data[0];
        setActiveProject(demo);
      }
    } catch (err) {
      console.error('Failed to load projects from server database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleNavigate = (view: ActiveView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (project: ResearchProject, targetView: ActiveView = 'analysis') => {
    setActiveProject(project);
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await apiDeleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(projects.find(p => p.id !== id) || null);
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleLoadScenario = async (scenarioId: string) => {
    try {
      setIsLoading(true);
      const project = await loadDemoScenario(scenarioId);
      setActiveProject(project);
      setProjects(prev => {
        const existingIdx = prev.findIndex(p => p.id === project.id);
        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = project;
          return clone;
        }
        return [project, ...prev];
      });
      setCurrentView('analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(`Could not load scenario:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = (newProject: ResearchProject) => {
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setCurrentView('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateChecklist = (updatedTasks: VerificationTask[]) => {
    if (!activeProject || !activeProject.analysis) return;
    const updatedProject: ResearchProject = {
      ...activeProject,
      analysis: {
        ...activeProject.analysis,
        verificationChecklist: updatedTasks,
      },
    };
    setActiveProject(updatedProject);
    setProjects(prev => prev.map(p => (p.id === updatedProject.id ? updatedProject : p)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeProject={activeProject}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading Digital Dark Spot database records...</p>
          </div>
        ) : (
          <>
            {currentView === 'landing' && (
              <LandingPage
                onNavigate={handleNavigate}
                onLoadScenario={handleLoadScenario}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                projects={projects}
                onSelectProject={handleSelectProject}
                onNavigate={handleNavigate}
                onDeleteProject={handleDeleteProject}
                onLoadScenario={handleLoadScenario}
              />
            )}

            {currentView === 'new-research' && (
              <NewResearchView
                onAnalysisComplete={handleAnalysisComplete}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'analysis' && activeProject && (
              <AnalysisResultsView
                project={activeProject}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'checklist' && activeProject && (
              <ChecklistView
                project={activeProject}
                onNavigate={handleNavigate}
                onUpdateChecklist={handleUpdateChecklist}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
