import { ResearchProject, SourceItem, VerificationTask } from '../types.ts';

const API_BASE = '/api';

export async function fetchAllProjects(): Promise<ResearchProject[]> {
  const res = await fetch(`${API_BASE}/research`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch projects');
  return data.data;
}

export async function fetchProjectById(id: string): Promise<ResearchProject> {
  const res = await fetch(`${API_BASE}/research/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Project not found');
  return data.data;
}

export async function createProject(
  title: string,
  researchQuestion: string,
  sources: SourceItem[]
): Promise<ResearchProject> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, researchQuestion, sources }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create project');
  return data.data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/research/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete project');
}

export async function toggleChecklistTask(
  projectId: string,
  taskId: string,
  isCompleted: boolean
): Promise<VerificationTask[]> {
  const res = await fetch(`${API_BASE}/research/${projectId}/checklist`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, isCompleted }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to toggle task');
  return data.data;
}

export async function fetchUrlSource(url: string): Promise<SourceItem> {
  const res = await fetch(`${API_BASE}/sources/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch URL');
  return data.data;
}

export async function parseTextSource(
  title: string,
  content: string,
  type: 'text' | 'file' = 'text',
  cycleInfo?: string,
  publishedDate?: string
): Promise<SourceItem> {
  const res = await fetch(`${API_BASE}/sources/parse-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, type, cycleInfo, publishedDate }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to parse text');
  return data.data;
}

export async function analyzeResearch(
  projectId?: string,
  topic?: string,
  researchQuestion?: string,
  sources?: SourceItem[]
): Promise<ResearchProject> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, topic, researchQuestion, sources }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Analysis failed');
  return data.data;
}

export async function loadDemoScenario(scenarioId: string): Promise<ResearchProject> {
  const res = await fetch(`${API_BASE}/scenarios/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to load demo scenario');
  return data.data;
}
