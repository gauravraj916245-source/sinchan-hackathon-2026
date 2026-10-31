import { CompletenessMetrics, ContradictionItem, InformationGap, VerificationTask } from '../types.js';

export function generateCompletenessMetrics(gaps: InformationGap[]): CompletenessMetrics {
  const total = gaps.length;
  if (total === 0) {
    return {
      totalQuestions: 0,
      answeredQuestions: 0,
      partiallyAnsweredQuestions: 0,
      unansweredQuestions: 0,
      completenessPercentage: 0,
      explanation: 'No questions evaluated.',
    };
  }

  const answered = gaps.filter(g => g.status === 'answered').length;
  const partial = gaps.filter(g => g.status === 'partially_answered').length;
  const unanswered = gaps.filter(g => g.status === 'unanswered').length;

  // Answered counts as 1.0, partially answered counts as 0.5
  const effectiveScore = answered + partial * 0.5;
  const percentage = Math.round((effectiveScore / total) * 100);

  return {
    totalQuestions: total,
    answeredQuestions: answered,
    partiallyAnsweredQuestions: partial,
    unansweredQuestions: unanswered,
    completenessPercentage: percentage,
    explanation: `This completeness score of ${percentage}% reflects the coverage of ${total} benchmark research questions across your provided sources (${answered} fully answered, ${partial} partially addressed, ${unanswered} unaddressed). It measures source coverage, not a guarantee of factual completeness.`,
  };
}

export function generateVerificationChecklist(
  gaps: InformationGap[],
  contradictions: ContradictionItem[],
  topic: string
): VerificationTask[] {
  const tasks: VerificationTask[] = [];

  // Contradiction tasks are always HIGH priority
  for (const c of contradictions) {
    tasks.push({
      id: `task-c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Reconcile Contradiction: ${c.subject}`,
      description: `Discrepancy detected between "${c.sourceA.sourceTitle}" and "${c.sourceB.sourceTitle}". Action: ${c.suggestedAction}`,
      priority: 'high',
      category: 'Contradiction Resolution',
      isCompleted: false,
      relatedContradictionId: c.id,
    });
  }

  // Critical/High impact gaps become HIGH priority tasks
  for (const g of gaps.filter(g => g.status === 'unanswered' && (g.impact === 'Critical' || g.impact === 'High'))) {
    tasks.push({
      id: `task-g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Investigate Dark Spot: ${g.category}`,
      description: `Unanswered: "${g.question}". Look here: ${g.suggestedWhereToLook}`,
      priority: 'high',
      category: g.category,
      isCompleted: false,
      relatedGapId: g.id,
    });
  }

  // Partially answered or Medium impact gaps become MEDIUM priority tasks
  for (const g of gaps.filter(g => (g.status === 'partially_answered') || (g.status === 'unanswered' && g.impact === 'Medium'))) {
    tasks.push({
      id: `task-m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Clarify Incomplete Information: ${g.category}`,
      description: `Partially documented: "${g.question}". ${g.explanation}`,
      priority: 'medium',
      category: g.category,
      isCompleted: false,
      relatedGapId: g.id,
    });
  }

  // Low impact gaps or routine checks become LOW priority tasks
  for (const g of gaps.filter(g => g.status === 'unanswered' && g.impact === 'Low')) {
    tasks.push({
      id: `task-l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Verify Supplementary Detail: ${g.category}`,
      description: `Optional or secondary: "${g.question}".`,
      priority: 'low',
      category: g.category,
      isCompleted: false,
      relatedGapId: g.id,
    });
  }

  // Add routine verification tasks if list is small
  if (tasks.length < 3) {
    tasks.push({
      id: `task-default-1`,
      title: `Confirm latest gazette / circular release`,
      description: `Ensure no recent amendment was published after the source publication date.`,
      priority: 'medium',
      category: 'General Verification',
      isCompleted: false,
    });
    tasks.push({
      id: `task-default-2`,
      title: `Verify helpline phone numbers & official email endpoints`,
      description: `Double-check contact coordinates on the root domain.`,
      priority: 'low',
      category: 'General Verification',
      isCompleted: false,
    });
  }

  return tasks;
}

export function generateResearchLimitations(topic: string, sourceCount: number): string[] {
  return [
    `Analysis is strictly bounded by the ${sourceCount} source(s) provided. Digital Dark Spot identifies what is missing from these specific documents, not what does not exist in the universe.`,
    `Web sources behind paywalls, client-rendered JavaScript single-page apps, or CAPTCHA-protected authentication portals may require manual text pasting.`,
    `Legal policies, statutory acts, and government benefits undergo periodic gazette amendments. Information deemed 'current' reflects dates stated in the text and requires independent official confirmation before legal or financial commitments.`,
    `AI-assisted extraction assists human research; all flagged contradictions and dark spots must be corroborated by direct source inspection.`,
  ];
}
