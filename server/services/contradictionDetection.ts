import { ContradictionItem, ExtractedClaim, SourceItem } from '../types.js';

export function detectContradictionsHeuristically(
  sources: SourceItem[],
  claims: ExtractedClaim[]
): ContradictionItem[] {
  const contradictions: ContradictionItem[] = [];

  // Group claims by category
  const categories = ['Eligibility', 'Requirements', 'Documents', 'Deadlines', 'Benefits'];

  for (const cat of categories) {
    const catClaims = claims.filter(c => c.category === cat);
    if (catClaims.length < 2) continue;

    // Cross-compare pairs from DIFFERENT sources
    for (let i = 0; i < catClaims.length; i++) {
      for (let j = i + 1; j < catClaims.length; j++) {
        const c1 = catClaims[i];
        const c2 = catClaims[j];

        if (c1.sourceId === c2.sourceId) continue; // Skip claims from same source

        const text1 = c1.claim.toLowerCase();
        const text2 = c2.claim.toLowerCase();

        // 1. Check for number or cutoff discrepancies (e.g. CGPA 7.5 vs 8.0, Income 2.5L vs 5.0L, Age 18 vs 21)
        const numbers1: string[] = text1.match(/\b\d+(?:\.\d+)?(?:\s*(?:%|lakh|lac|k|inr|usd|\$|cgpa|gpa|years|yrs|marks))?\b/g) || [];
        const numbers2: string[] = text2.match(/\b\d+(?:\.\d+)?(?:\s*(?:%|lakh|lac|k|inr|usd|\$|cgpa|gpa|years|yrs|marks))?\b/g) || [];

        // Check date/cycle comparison
        const s1 = sources.find(s => s.id === c1.sourceId);
        const s2 = sources.find(s => s.id === c2.sourceId);

        const cycle1 = s1?.cycleInfo || c1.date || null;
        const cycle2 = s2?.cycleInfo || c2.date || null;
        const isCycleMismatch = Boolean(cycle1 && cycle2 && cycle1 !== cycle2);

        // Check if both discuss a common keyword (e.g. income, marks, gpa, deadline, notarized)
        const commonSubjects = ['income', 'cgpa', 'gpa', 'percentage', 'marks', 'age', 'deadline', 'date', 'original', 'affidavit', 'fees', 'stipend', 'experience'];
        const matchedSubject = commonSubjects.find(sub => text1.includes(sub) && text2.includes(sub));

        if (matchedSubject) {
          // Compare if there's an actual divergence in requirement
          const isContradictory = 
            (numbers1.length > 0 && numbers2.length > 0 && numbers1.some(n => !numbers2.includes(n))) ||
            (text1.includes('mandatory') && text2.includes('optional')) ||
            (text1.includes('not required') && text2.includes('required')) ||
            (text1.includes('original') && text2.includes('photocopy')) ||
            (text1.includes('online only') && text2.includes('postal')) ||
            isCycleMismatch;

          if (isContradictory) {
            const reason = isCycleMismatch
              ? `Source A applies to cycle "${cycle1}", while Source B references cycle "${cycle2}". The discrepancy may stem from an updated policy in a newer application cycle rather than an outright error.`
              : `Discrepant ${matchedSubject} parameters detected between ${s1?.title || 'Source A'} and ${s2?.title || 'Source B'}.`;

            contradictions.push({
              id: `contra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              subject: `Divergent ${matchedSubject.toUpperCase()} Specification in ${cat}`,
              sourceA: {
                sourceId: c1.sourceId,
                sourceTitle: c1.sourceTitle,
                sourceUrl: c1.sourceUrl,
                claim: c1.claim,
                supportingText: c1.supportingText,
                dateOrCycle: cycle1,
              },
              sourceB: {
                sourceId: c2.sourceId,
                sourceTitle: c2.sourceTitle,
                sourceUrl: c2.sourceUrl,
                claim: c2.claim,
                supportingText: c2.supportingText,
                dateOrCycle: cycle2,
              },
              reason,
              isCycleDifference: isCycleMismatch,
              suggestedAction: isCycleMismatch
                ? 'Check the current official portal (2026–27) to verify if the latest notification supersedes previous guidelines.'
                : 'Directly contact the program helpline or cross-examine against the Gazette notification before committing.',
            });
          }
        }
      }
    }
  }

  // Deduplicate contradictions by subject
  const seenSubjects = new Set<string>();
  return contradictions.filter(item => {
    if (seenSubjects.has(item.subject)) return false;
    seenSubjects.add(item.subject);
    return true;
  }).slice(0, 8);
}
