import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config.js';
import {
  CompletenessMetrics,
  ContradictionItem,
  ExtractedClaim,
  InformationGap,
  OutdatedWarning,
  ResearchAnalysisResult,
  SourceItem,
  VerificationTask,
} from '../types.js';
import { extractClaimsHeuristically } from './claimExtraction.js';
import { detectInformationGapsHeuristically } from './gapDetection.js';
import { detectContradictionsHeuristically } from './contradictionDetection.js';
import { detectOutdatedInformation } from './outdatedDetection.js';
import {
  generateCompletenessMetrics,
  generateResearchLimitations,
  generateVerificationChecklist,
} from './checklistGenerator.js';

let genAI: GoogleGenAI | null = null;
if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': config.userAgent,
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with API key, will use deterministic engine:', err);
  }
}

// Main AI Analysis Pipeline Orchestrator
export async function analyzeResearchProject(
  topic: string,
  researchQuestion: string,
  sources: SourceItem[]
): Promise<ResearchAnalysisResult> {
  const validSources = sources.filter(s => s.status === 'valid' || s.status === 'warning');

  if (validSources.length === 0) {
    throw new Error('No valid sources available for analysis. Please add at least one source with text content.');
  }

  // If Gemini API is available, try LLM extraction with structured prompts
  if (genAI && config.geminiApiKey) {
    try {
      return await analyzeWithGemini(topic, researchQuestion, validSources);
    } catch (err: any) {
      console.warn('Gemini API call encountered an error. Seamlessly falling back to rule-based engine:', err?.message || err);
    }
  }

  // Resilient heuristic engine (also used for instant testing & fallback)
  return analyzeWithHeuristics(topic, researchQuestion, validSources);
}

// Fallback / deterministic analysis engine
function analyzeWithHeuristics(
  topic: string,
  researchQuestion: string,
  sources: SourceItem[]
): ResearchAnalysisResult {
  // 1. Extract claims per source
  const allClaims: ExtractedClaim[] = [];
  for (const s of sources) {
    const claims = extractClaimsHeuristically(s);
    allClaims.push(...claims);
  }

  // 2. Detect Information Gaps
  const gaps = detectInformationGapsHeuristically(topic, researchQuestion, sources, allClaims);

  // 3. Detect Contradictions
  const contradictions = detectContradictionsHeuristically(sources, allClaims);

  // 4. Outdated Information Warnings
  const outdatedWarnings = detectOutdatedInformation(sources);

  // 5. Completeness Score
  const completeness = generateCompletenessMetrics(gaps);

  // 6. Verification Checklist
  const verificationChecklist = generateVerificationChecklist(gaps, contradictions, topic);

  // 7. Research Limitations
  const researchLimitations = generateResearchLimitations(topic, sources.length);

  const overview = `Analyzed ${sources.length} document(s) on "${topic || 'User Inquiry'}". Found ${allClaims.length} verifiable factual claims, ${gaps.filter(g => g.status === 'unanswered').length} unaddressed information dark spots, and ${contradictions.length} cross-source discrepancies requiring reconciliation.`;

  return {
    overview,
    claims: allClaims,
    gaps,
    contradictions,
    outdatedWarnings,
    completeness,
    verificationChecklist,
    researchLimitations,
    analyzedAt: new Date().toISOString(),
    modelUsed: 'Digital Dark Spot Intelligence Engine (Rule-based & Heuristic NLP)',
  };
}

// Gemini structured analysis
async function analyzeWithGemini(
  topic: string,
  researchQuestion: string,
  sources: SourceItem[]
): Promise<ResearchAnalysisResult> {
  if (!genAI) {
    throw new Error('GenAI not initialized');
  }

  // Prepare source summaries
  const sourcesPayload = sources.map((s, idx) => ({
    id: s.id,
    title: s.title,
    url: s.url || 'Pasted text',
    cycle: s.cycleInfo || 'Unspecified',
    publishedDate: s.publishedDate || 'Unknown',
    contentSnippet: s.content.slice(0, 4000), // bounded input
  }));

  const prompt = `Analyze the following research topic and sources for "Digital Dark Spot".
TOPIC: ${topic}
PRIMARY RESEARCH QUESTION: ${researchQuestion}

SOURCES:
${JSON.stringify(sourcesPayload, null, 2)}

TASK:
1. Extract 4-12 key factual claims across the sources. Quote exact or near-exact supporting text. Categories MUST be: "Eligibility", "Requirements", "Documents", "Deadlines", "Application Procedures", "Benefits", "Renewal Conditions", "Important Limitations".
2. Identify 4-7 critical questions that a researcher MUST answer for this topic. Compare against the sources to find which are "answered", "partially_answered", or "unanswered" (Information Dark Spots). State why it was not found in the reviewed sources.
3. Detect any genuine contradictions or cycle differences between different sources. Explain if the difference is due to application cycle or an outright conflict.
4. Review publication dates or cycles to determine if any source is "current", "potentially_outdated", "undated", or "date_unavailable".
5. Formulate an actionable verification checklist ranked into "high", "medium", and "low" priority.

Be truthful. DO NOT invent citations or claims. If information is not in the text, explicitly flag it as an information gap.`;

  const response = await genAI.models.generateContent({
    model: config.geminiModel,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          claims: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                sourceId: { type: Type.STRING },
                sourceTitle: { type: Type.STRING },
                category: { type: Type.STRING },
                claim: { type: Type.STRING },
                supportingText: { type: Type.STRING },
                date: { type: Type.STRING, nullable: true },
              },
              required: ['sourceId', 'category', 'claim', 'supportingText'],
            },
          },
          gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                category: { type: Type.STRING },
                status: { type: Type.STRING }, // 'answered', 'partially_answered', 'unanswered'
                explanation: { type: Type.STRING },
                impact: { type: Type.STRING }, // 'Critical', 'High', 'Medium', 'Low'
                suggestedWhereToLook: { type: Type.STRING },
              },
              required: ['question', 'category', 'status', 'explanation', 'impact', 'suggestedWhereToLook'],
            },
          },
          contradictions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                subject: { type: Type.STRING },
                sourceA: {
                  type: Type.OBJECT,
                  properties: {
                    sourceId: { type: Type.STRING },
                    sourceTitle: { type: Type.STRING },
                    claim: { type: Type.STRING },
                    supportingText: { type: Type.STRING },
                    dateOrCycle: { type: Type.STRING, nullable: true },
                  },
                  required: ['sourceId', 'sourceTitle', 'claim', 'supportingText'],
                },
                sourceB: {
                  type: Type.OBJECT,
                  properties: {
                    sourceId: { type: Type.STRING },
                    sourceTitle: { type: Type.STRING },
                    claim: { type: Type.STRING },
                    supportingText: { type: Type.STRING },
                    dateOrCycle: { type: Type.STRING, nullable: true },
                  },
                  required: ['sourceId', 'sourceTitle', 'claim', 'supportingText'],
                },
                reason: { type: Type.STRING },
                isCycleDifference: { type: Type.BOOLEAN },
                suggestedAction: { type: Type.STRING },
              },
              required: ['subject', 'sourceA', 'sourceB', 'reason', 'isCycleDifference', 'suggestedAction'],
            },
          },
          outdatedWarnings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                sourceId: { type: Type.STRING },
                sourceTitle: { type: Type.STRING },
                detectedDateOrCycle: { type: Type.STRING, nullable: true },
                status: { type: Type.STRING }, // 'current', 'potentially_outdated', 'undated', 'date_unavailable'
                explanation: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['sourceId', 'sourceTitle', 'status', 'explanation', 'recommendation'],
            },
          },
          verificationChecklist: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING }, // 'high', 'medium', 'low'
                category: { type: Type.STRING },
                isCompleted: { type: Type.BOOLEAN },
              },
              required: ['title', 'description', 'priority', 'category'],
            },
          },
        },
        required: ['overview', 'claims', 'gaps', 'contradictions', 'outdatedWarnings', 'verificationChecklist'],
      },
    },
  });

  const rawJson = (response.text || '{}').trim();
  const parsed = JSON.parse(rawJson);

  // Normalize IDs and map source metadata
  const claims: ExtractedClaim[] = (parsed.claims || []).map((c: any, i: number) => {
    const matchedSource = sources.find(s => s.id === c.sourceId || s.title === c.sourceTitle);
    return {
      id: c.id || `clm-gemini-${i + 1}`,
      sourceId: matchedSource ? matchedSource.id : (c.sourceId || sources[0].id),
      sourceTitle: matchedSource ? matchedSource.title : (c.sourceTitle || 'Source Document'),
      sourceUrl: matchedSource?.url,
      category: c.category as any,
      claim: c.claim,
      supportingText: c.supportingText,
      date: c.date || matchedSource?.cycleInfo || matchedSource?.publishedDate,
      confidence: 'high',
    };
  });

  const gaps: InformationGap[] = (parsed.gaps || []).map((g: any, i: number) => ({
    id: g.id || `gap-gemini-${i + 1}`,
    question: g.question,
    category: g.category,
    status: (g.status === 'answered' || g.status === 'partially_answered' ? g.status : 'unanswered') as any,
    explanation: g.explanation,
    impact: (g.impact || 'High') as any,
    suggestedWhereToLook: g.suggestedWhereToLook || 'Official department portal or regulatory gazette',
  }));

  const contradictions: ContradictionItem[] = (parsed.contradictions || []).map((c: any, i: number) => ({
    id: c.id || `contra-gemini-${i + 1}`,
    subject: c.subject,
    sourceA: {
      sourceId: c.sourceA.sourceId || sources[0].id,
      sourceTitle: c.sourceA.sourceTitle || sources[0].title,
      sourceUrl: sources.find(s => s.id === c.sourceA.sourceId)?.url,
      claim: c.sourceA.claim,
      supportingText: c.sourceA.supportingText,
      dateOrCycle: c.sourceA.dateOrCycle || null,
    },
    sourceB: {
      sourceId: c.sourceB.sourceId || (sources[1] ? sources[1].id : sources[0].id),
      sourceTitle: c.sourceB.sourceTitle || (sources[1] ? sources[1].title : sources[0].title),
      sourceUrl: sources.find(s => s.id === c.sourceB.sourceId)?.url,
      claim: c.sourceB.claim,
      supportingText: c.sourceB.supportingText,
      dateOrCycle: c.sourceB.dateOrCycle || null,
    },
    reason: c.reason,
    isCycleDifference: Boolean(c.isCycleDifference),
    suggestedAction: c.suggestedAction,
  }));

  const outdatedWarnings: OutdatedWarning[] = (parsed.outdatedWarnings || []).map((w: any, i: number) => {
    const matchedSource = sources.find(s => s.id === w.sourceId || s.title === w.sourceTitle);
    return {
      id: w.id || `outdate-gemini-${i + 1}`,
      sourceId: matchedSource ? matchedSource.id : (w.sourceId || sources[0].id),
      sourceTitle: matchedSource ? matchedSource.title : (w.sourceTitle || 'Source Document'),
      sourceUrl: matchedSource?.url,
      detectedDateOrCycle: w.detectedDateOrCycle || matchedSource?.cycleInfo || matchedSource?.publishedDate || null,
      status: (w.status || 'date_unavailable') as any,
      explanation: w.explanation,
      recommendation: w.recommendation,
    };
  });

  const completeness = generateCompletenessMetrics(gaps);

  const verificationChecklist: VerificationTask[] = (parsed.verificationChecklist || []).map((t: any, i: number) => ({
    id: t.id || `task-gemini-${i + 1}`,
    title: t.title,
    description: t.description,
    priority: (t.priority === 'high' || t.priority === 'low' ? t.priority : 'medium') as any,
    category: t.category || 'Verification',
    isCompleted: false,
  }));

  const researchLimitations = generateResearchLimitations(topic, sources.length);

  return {
    overview: parsed.overview || `Completed Gemini AI analysis of ${sources.length} sources for "${topic}".`,
    claims,
    gaps,
    contradictions,
    outdatedWarnings,
    completeness,
    verificationChecklist,
    researchLimitations,
    analyzedAt: new Date().toISOString(),
    modelUsed: `${config.geminiModel} (Google GenAI)`,
  };
}
