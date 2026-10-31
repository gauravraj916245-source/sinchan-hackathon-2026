export type SourceType = 'url' | 'text' | 'file';

export type OutdatedStatus = 'current' | 'potentially_outdated' | 'undated' | 'date_unavailable';

export interface SourceItem {
  id: string;
  title: string;
  url?: string;
  content: string;
  type: SourceType;
  publishedDate?: string | null;
  cycleInfo?: string | null; // e.g. "2025–26", "2026–27"
  extractedAt: string;
  wordCount: number;
  status: 'valid' | 'failed' | 'warning';
  errorMessage?: string;
}

export type ClaimCategory = 
  | 'Eligibility'
  | 'Requirements'
  | 'Documents'
  | 'Deadlines'
  | 'Application Procedures'
  | 'Benefits'
  | 'Renewal Conditions'
  | 'Important Limitations';

export interface ExtractedClaim {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  category: ClaimCategory;
  claim: string;
  supportingText: string;
  date?: string | null;
  confidence?: 'high' | 'medium' | 'low';
}

export type GapStatus = 'unanswered' | 'partially_answered' | 'answered';

export interface InformationGap {
  id: string;
  question: string;
  category: string;
  status: GapStatus;
  explanation: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestedWhereToLook: string;
}

export interface ContradictionItem {
  id: string;
  subject: string;
  sourceA: {
    sourceId: string;
    sourceTitle: string;
    sourceUrl?: string;
    claim: string;
    supportingText: string;
    dateOrCycle?: string | null;
  };
  sourceB: {
    sourceId: string;
    sourceTitle: string;
    sourceUrl?: string;
    claim: string;
    supportingText: string;
    dateOrCycle?: string | null;
  };
  reason: string;
  isCycleDifference: boolean; // Flag genuine contradiction vs different cycle/jurisdiction
  suggestedAction: string;
}

export interface OutdatedWarning {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  detectedDateOrCycle: string | null;
  status: OutdatedStatus;
  explanation: string;
  recommendation: string;
}

export interface VerificationTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isCompleted: boolean;
  relatedGapId?: string;
  relatedContradictionId?: string;
}

export interface CompletenessMetrics {
  totalQuestions: number;
  answeredQuestions: number;
  partiallyAnsweredQuestions: number;
  unansweredQuestions: number;
  completenessPercentage: number;
  explanation: string;
}

export interface ResearchAnalysisResult {
  overview: string;
  claims: ExtractedClaim[];
  gaps: InformationGap[];
  contradictions: ContradictionItem[];
  outdatedWarnings: OutdatedWarning[];
  completeness: CompletenessMetrics;
  verificationChecklist: VerificationTask[];
  researchLimitations: string[];
  analyzedAt: string;
  modelUsed: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  researchQuestion: string;
  createdAt: string;
  updatedAt: string;
  sources: SourceItem[];
  analysis?: ResearchAnalysisResult;
  status: 'draft' | 'analyzing' | 'completed' | 'error';
  isDemo?: boolean;
}
