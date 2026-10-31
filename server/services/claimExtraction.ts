import { ExtractedClaim, SourceItem } from '../types.js';

export const CLAIM_PROMPT_SYSTEM = `You are the Claim Extraction Engine of Digital Dark Spot, a research verification system.
Extract factual claims from the provided source document.
Rules:
1. ONLY extract claims actually present in the source text. NEVER invent or hallucinate claims.
2. For each claim, provide:
   - "category": MUST be one of: "Eligibility", "Requirements", "Documents", "Deadlines", "Application Procedures", "Benefits", "Renewal Conditions", "Important Limitations".
   - "claim": A concise, clear factual statement of what the source states.
   - "supportingText": The direct quotation or sentence from the source text supporting this claim.
   - "date": Any specific date, year, or application cycle mentioned for this claim, or null if unspecified.
3. Return valid JSON matching the specified schema.`;

export function extractClaimsHeuristically(source: SourceItem): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  const text = source.content;
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 20);

  // Search patterns for categories
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    
    // Eligibility
    if (lower.includes('eligib') || lower.includes('cgpa') || lower.includes('gpa') || lower.includes('minimum score') || lower.includes('age limit') || lower.includes('income limit') || lower.includes('who can apply')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Eligibility',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Documents
    else if (lower.includes('document') || lower.includes('certificate') || lower.includes('transcript') || lower.includes('affidavit') || lower.includes('id proof') || lower.includes('marksheet')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Documents',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Deadlines
    else if (lower.includes('deadline') || lower.includes('last date') || lower.includes('due date') || lower.includes('closing date') || lower.includes('submit before')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Deadlines',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Application Procedures
    else if (lower.includes('how to apply') || lower.includes('portal') || lower.includes('registration step') || lower.includes('procedure') || lower.includes('form')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Application Procedures',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Benefits
    else if (lower.includes('stipend') || lower.includes('amount') || lower.includes('grant') || lower.includes('award') || lower.includes('tuition waiver') || lower.includes('salary') || lower.includes('allowance')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Benefits',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Renewal Conditions
    else if (lower.includes('renew') || lower.includes('subsequent year') || lower.includes('maintain') || lower.includes('continuance') || lower.includes('retain')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Renewal Conditions',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
    // Important Limitations
    else if (lower.includes('not eligible') || lower.includes('disqualif') || lower.includes('restriction') || lower.includes('penalty') || lower.includes('limit') || lower.includes('bond')) {
      claims.push({
        id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceId: source.id,
        sourceTitle: source.title,
        sourceUrl: source.url,
        category: 'Important Limitations',
        claim: para.slice(0, 160) + (para.length > 160 ? '...' : ''),
        supportingText: para,
        date: source.publishedDate || source.cycleInfo || null,
        confidence: 'high',
      });
    }
  }

  // If no category matched, extract generic requirement claims from initial paragraphs
  if (claims.length === 0 && paragraphs.length > 0) {
    claims.push({
      id: `clm-${Date.now()}-gen`,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceUrl: source.url,
      category: 'Requirements',
      claim: paragraphs[0].slice(0, 150),
      supportingText: paragraphs[0],
      date: source.publishedDate || source.cycleInfo || null,
      confidence: 'medium',
    });
  }

  return claims.slice(0, 15); // Return up to 15 key claims per source
}
