import React, { useState } from 'react';
import { ActiveView, ResearchProject, VerificationTask } from '../types.ts';
import { toggleChecklistTask } from '../services/apiClient.ts';
import { 
  CheckSquare, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Filter,
  Sparkles,
  Printer
} from 'lucide-react';

interface ChecklistViewProps {
  project: ResearchProject;
  onNavigate: (view: ActiveView) => void;
  onUpdateChecklist: (tasks: VerificationTask[]) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  project,
  onNavigate,
  onUpdateChecklist,
}) => {
  const analysis = project.analysis;
  const tasks = analysis?.verificationChecklist || [];
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Custom task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isAdding, setIsAdding] = useState(false);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Verification Checklist</h2>
        <p className="text-sm text-slate-400">Please analyze your research to generate a priority-based checklist.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    // Optimistic local update
    const updated = tasks.map(t => (t.id === taskId ? { ...t, isCompleted: !currentStatus } : t));
    onUpdateChecklist(updated);

    try {
      await toggleChecklistTask(project.id, taskId, !currentStatus);
    } catch (err: any) {
      console.error('Failed to sync checklist update to backend:', err);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const customTask: VerificationTask = {
      id: `task-custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom user verification task',
      priority: newPriority,
      category: 'User Added',
      isCompleted: false,
    };

    const updated = [customTask, ...tasks];
    onUpdateChecklist(updated);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const filteredTasks = priorityFilter === 'all'
    ? tasks
    : tasks.filter(t => t.priority === priorityFilter);

  const highTasks = tasks.filter(t => t.priority === 'high');
  const mediumTasks = tasks.filter(t => t.priority === 'medium');
  const lowTasks = tasks.filter(t => t.priority === 'low');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('analysis')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Analysis Report"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Priority Verification Checklist
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: {project.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Checklist</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Checklist Execution Progress
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{completedCount}</span>
            <span className="text-slate-400 text-sm">of {totalCount} tasks completed</span>
            <span className="text-emerald-400 font-bold text-sm ml-2">({progressPercent}%)</span>
          </div>
          <p className="text-xs text-slate-400">
            Tasks are ranked by severity: Contradictions and Critical Gaps are marked High Priority.
          </p>
        </div>

        {/* Priority breakdown counters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="px-3 py-2 rounded-xl bg-red-950/70 border border-red-800/60 text-center">
            <span className="text-[10px] font-bold uppercase text-red-400 block">High</span>
            <span className="text-lg font-bold text-white">{highTasks.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-amber-950/70 border border-amber-800/60 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-400 block">Medium</span>
            <span className="text-lg font-bold text-white">{mediumTasks.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-blue-950/70 border border-blue-800/60 text-center">
            <span className="text-[10px] font-bold uppercase text-blue-400 block">Low</span>
            <span className="text-lg font-bold text-white">{lowTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Add Custom Task Drawer */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-5 rounded-2xl bg-slate-900 border border-cyan-800/70 space-y-3">
          <h3 className="text-sm font-bold text-white">Add Verification Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Task Title (e.g. Verify caste certificate validity with Tehsildar)"
              className="sm:col-span-3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              required
            />
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <textarea
            rows={2}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Detailed instructions or specific phone numbers / web links to verify..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs cursor-pointer"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Priority Filter */}
      <div className="flex items-center gap-2 no-print">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {(['all', 'high', 'medium', 'low'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer ${
              priorityFilter === p
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
            No verification tasks match this filter.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id, task.isCompleted)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                task.isCompleted
                  ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                  : task.priority === 'high'
                  ? 'bg-slate-900/80 border-red-900/40 hover:border-red-700'
                  : task.priority === 'medium'
                  ? 'bg-slate-900/60 border-amber-900/40 hover:border-amber-700'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="pt-0.5 shrink-0 text-cyan-400">
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400 transition-colors" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                    {task.title}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'high'
                      ? 'bg-red-950 text-red-300 border border-red-800/60'
                      : task.priority === 'medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                  }`}>
                    {task.priority} Priority
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {task.category}
                  </span>
                </div>

                <p className={`text-xs ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  {task.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
