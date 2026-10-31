import { ExtractedClaim, InformationGap, SourceItem } from '../types.js';

export interface ExpectedTopicQuestion {
  question: string;
  category: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestedWhereToLook: string;
}

// Domain-specific standard inquiry checklists to detect dark spots
export function getDomainQuestions(topic: string, researchQuestion: string): ExpectedTopicQuestion[] {
  const combined = (topic + ' ' + researchQuestion).toLowerCase();

  if (combined.includes('scholarship') || combined.includes('fellowship') || combined.includes('grant') || combined.includes('financial aid')) {
    return [
      {
        question: 'What are the exact eligibility criteria (academic score/CGPA, family income ceiling, nationality)?',
        category: 'Eligibility',
        impact: 'Critical',
        suggestedWhereToLook: 'Official Scholarship Notification PDF or Department of Higher Education portal',
      },
      {
        question: 'What specific documents and certified affidavits are required at the time of submission?',
        category: 'Documents',
        impact: 'High',
        suggestedWhereToLook: 'Document checklist section on application submission portal',
      },
      {
        question: 'What is the hard application deadline for the current academic year/cycle?',
        category: 'Deadlines',
        impact: 'Critical',
        suggestedWhereToLook: 'Important dates bulletin or notification circular',
      },
      {
        question: 'Is the scholarship renewable in subsequent academic years, and what are the renewal conditions (e.g. minimum CGPA, attendance)?',
        category: 'Renewal Conditions',
        impact: 'High',
        suggestedWhereToLook: 'Terms & Conditions handbook or Renewal Guidelines annexure',
      },
      {
        question: 'What is the exact disbursement procedure, schedule, and bank account linking requirements (e.g., Aadhaar DBT)?',
        category: 'Application Procedures',
        impact: 'Medium',
        suggestedWhereToLook: 'Payment FAQs or Public Financial Management System (PFMS) guidelines',
      },
      {
        question: 'Can the recipient hold another concurrent scholarship or government benefit simultaneously?',
        category: 'Important Limitations',
        impact: 'High',
        suggestedWhereToLook: 'Disqualification clauses in official scholarship charter',
      },
      {
        question: 'Who is the official nodal grievance officer or contact desk for application discrepancies?',
        category: 'Application Procedures',
        impact: 'Low',
        suggestedWhereToLook: 'Contact Us or Helpdesk Directory on ministry/foundation website',
      },
    ];
  }

  if (combined.includes('admission') || combined.includes('college') || combined.includes('university') || combined.includes('course')) {
    return [
      {
        question: 'What are the minimum qualifying exam cutoffs and standardized entrance test percentiles?',
        category: 'Eligibility',
        impact: 'Critical',
        suggestedWhereToLook: 'Admissions Brochure or Prospectus Academic Section',
      },
      {
        question: 'What are the exact seat reservation categories, quotas, and quota-specific seat matrices?',
        category: 'Eligibility',
        impact: 'High',
        suggestedWhereToLook: 'Central Seat Allocation Board / Counselling notification',
      },
      {
        question: 'What is the full fee structure, caution deposit, hostel charges, and refund policy upon withdrawal?',
        category: 'Benefits & Costs',
        impact: 'Critical',
        suggestedWhereToLook: 'Approved Fee Structure circular from Fee Regulatory Committee',
      },
      {
        question: 'What is the credit transfer or lateral entry policy for students changing institutions?',
        category: 'Important Limitations',
        impact: 'Medium',
        suggestedWhereToLook: 'Academic Council Ordinances or Registrar academic regulations',
      },
      {
        question: 'What are the strict document verification deadlines and in-person reporting dates?',
        category: 'Deadlines',
        impact: 'High',
        suggestedWhereToLook: 'Counselling Round 1-3 Calendar',
      },
    ];
  }

  if (combined.includes('internship') || combined.includes('job') || combined.includes('career') || combined.includes('placement')) {
    return [
      {
        question: 'What are the graduation year restrictions, batch eligibility, and degree requirements?',
        category: 'Eligibility',
        impact: 'Critical',
        suggestedWhereToLook: 'Job Description (JD) qualifications and graduation year filter',
      },
      {
        question: 'What is the exact compensation, stipend amount, and travel/housing allowance offered?',
        category: 'Benefits',
        impact: 'High',
        suggestedWhereToLook: 'Offer breakdown or Human Resources compensation FAQ',
      },
      {
        question: 'Is this an in-person, hybrid, or fully remote opportunity, and where is the work location?',
        category: 'Requirements',
        impact: 'High',
        suggestedWhereToLook: 'Workplace policy note in candidate bulletin',
      },
      {
        question: 'Is there a conversion path to a Full-Time Equivalent (FTE) role and what are the performance benchmarks?',
        category: 'Renewal Conditions',
        impact: 'Medium',
        suggestedWhereToLook: 'Campus hiring policy or Recruiter introductory brief',
      },
      {
        question: 'What are the non-compete agreements, IP assignment, or bond obligations required?',
        category: 'Important Limitations',
        impact: 'High',
        suggestedWhereToLook: 'Standard employment agreement terms and NDA annexures',
      },
    ];
  }

  // General default questions for any research topic
  return [
    {
      question: `What are the core qualifying requirements or baseline criteria for "${topic || 'this subject'}"?`,
      category: 'Eligibility',
      impact: 'Critical',
      suggestedWhereToLook: 'Official program overview or regulatory framework',
    },
    {
      question: 'What authoritative documentation, evidence, or records are mandatory?',
      category: 'Documents',
      impact: 'High',
      suggestedWhereToLook: 'Document checklist and official portal verification guidelines',
    },
    {
      question: 'What are the effective dates, review timelines, or submission deadlines?',
      category: 'Deadlines',
      impact: 'Critical',
      suggestedWhereToLook: 'Time schedule section or announcements board',
    },
    {
      question: 'What limitations, exceptions, penalties, or disqualification rules apply?',
      category: 'Important Limitations',
      impact: 'High',
      suggestedWhereToLook: 'Terms of service, exclusions clause, or FAQ page',
    },
    {
      question: 'What are the ongoing compliance, maintenance, or renewal obligations?',
      category: 'Renewal Conditions',
      impact: 'Medium',
      suggestedWhereToLook: 'Post-selection guidelines or annual audit handbook',
    },
  ];
}

export function detectInformationGapsHeuristically(
  topic: string,
  researchQuestion: string,
  sources: SourceItem[],
  claims: ExtractedClaim[]
): InformationGap[] {
  const expectedQuestions = getDomainQuestions(topic, researchQuestion);
  const gaps: InformationGap[] = [];

  const combinedContent = sources.map(s => s.content.toLowerCase()).join(' ');

  for (const eq of expectedQuestions) {
    const qLower = eq.question.toLowerCase();
    
    // Check if any claim directly addresses this question category
    const relevantClaims = claims.filter(c => 
      c.category.toLowerCase().includes(eq.category.toLowerCase()) ||
      eq.category.toLowerCase().includes(c.category.toLowerCase())
    );

    // Look for keywords in content
    let keywordHits = 0;
    const keywords = eq.question
      .replace(/[?(),]/g, '')
      .split(' ')
      .filter(w => w.length > 4 && !['what', 'where', 'which', 'their', 'exact', 'these', 'those'].includes(w.toLowerCase()));

    for (const kw of keywords) {
      if (combinedContent.includes(kw.toLowerCase())) {
        keywordHits++;
      }
    }

    const hitRatio = keywords.length > 0 ? keywordHits / keywords.length : 0;

    if (relevantClaims.length === 0 && hitRatio < 0.25) {
      // Completely Unanswered
      gaps.push({
        id: `gap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: eq.question,
        category: eq.category,
        status: 'unanswered',
        explanation: `Not found in any of the ${sources.length} reviewed source(s). The documents do not mention or provide details regarding this vital inquiry.`,
        impact: eq.impact,
        suggestedWhereToLook: eq.suggestedWhereToLook,
      });
    } else if (relevantClaims.length === 0 || hitRatio < 0.6) {
      // Partially Answered
      gaps.push({
        id: `gap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: eq.question,
        category: eq.category,
        status: 'partially_answered',
        explanation: `Only briefly mentioned in the reviewed sources without complete procedural specifications or governing parameters.`,
        impact: eq.impact === 'Critical' ? 'High' : eq.impact,
        suggestedWhereToLook: eq.suggestedWhereToLook,
      });
    } else {
      // Answered
      gaps.push({
        id: `gap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: eq.question,
        category: eq.category,
        status: 'answered',
        explanation: `Substantively addressed across ${relevantClaims.length} extracted claim(s) from the provided sources.`,
        impact: eq.impact,
        suggestedWhereToLook: 'Refer to extracted claims in research report',
      });
    }
  }

  return gaps;
}
