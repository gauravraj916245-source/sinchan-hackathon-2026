import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResearchProject } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'projects.json');

class StorageService {
  private projects: Map<string, ResearchProject> = new Map();

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw.trim()) {
          const list: ResearchProject[] = JSON.parse(raw);
          for (const item of list) {
            this.projects.set(item.id, item);
          }
          console.log(`[Database] Loaded ${this.projects.size} research projects from ${DB_FILE}`);
          return;
        }
      }
    } catch (err) {
      console.warn('[Database] Could not read existing database file, will initialize defaults:', err);
    }

    // Seed default projects if database is empty or new
    this.seedDemonstrationProjects();
    this.persistToDisk();
  }

  private persistToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const array = Array.from(this.projects.values());
      fs.writeFileSync(DB_FILE, JSON.stringify(array, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to persist data to disk:', err);
    }
  }

  public getAll(): ResearchProject[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getById(id: string): ResearchProject | undefined {
    return this.projects.get(id);
  }

  public save(project: ResearchProject): ResearchProject {
    project.updatedAt = new Date().toISOString();
    this.projects.set(project.id, project);
    this.persistToDisk();
    return project;
  }

  public delete(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      this.persistToDisk();
    }
    return deleted;
  }

  public toggleChecklistItem(projectId: string, taskId: string, isCompleted: boolean): boolean {
    const project = this.projects.get(projectId);
    if (!project || !project.analysis) return false;

    const task = project.analysis.verificationChecklist.find(t => t.id === taskId);
    if (!task) return false;

    task.isCompleted = isCompleted;
    project.updatedAt = new Date().toISOString();
    this.persistToDisk();
    return true;
  }

  // Preload realistic benchmark scenarios
  private seedDemonstrationProjects() {
    const scholarshipProject: ResearchProject = {
      id: 'demo-scholarship-2026',
      title: 'National Merit STEM Scholarship 2026–27 Verification',
      researchQuestion: 'What should I verify before applying for this scholarship, and what critical information is missing from the guidelines?',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'completed',
      isDemo: true,
      sources: [
        {
          id: 'src-demo-1',
          title: 'Official Ministry of Education National Merit Scholarship 2026–27 Circular',
          url: 'https://scholarships.gov.example/merit-2026-circular.pdf',
          type: 'url',
          publishedDate: '2026-08-15',
          cycleInfo: '2026–27',
          extractedAt: new Date().toISOString(),
          wordCount: 840,
          status: 'valid',
          content: `MINISTRY OF HIGHER EDUCATION & RESEARCH
NATIONAL MERIT SCHOLARSHIP NOTIFICATION 2026-27
1. ELIGIBILITY CRITERIA:
Candidates must be enrolled in a full-time Bachelor degree program in Science or Engineering in an accredited institution. Minimum academic performance: 7.5 CGPA or 75% equivalent in Senior Secondary exams. Annual parental income must not exceed INR 4,50,000 per annum from all sources.
2. APPLICATION DEADLINE:
The National Scholarship Portal will accept online applications until 30th November 2026, 11:59 PM IST. Late submissions will not be entertained under any circumstances.
3. BENEFITS:
Selected scholars receive an annual stipend of INR 50,000 disbursed directly into their Aadhaar-seeded savings bank account via Direct Benefit Transfer (DBT).
4. SUBMISSION METHOD:
All certified physical documents, including the original signed income certificate from a competent revenue authority, must be posted via registered post to the Central Directorate Office after portal registration.
5. CONCURRENT BENEFITS:
Candidates cannot draw any other central or state government scholarship simultaneously.`,
        },
        {
          id: 'src-demo-2',
          title: 'State Student Welfare Advisory (Archived 2024–25 Circular)',
          url: 'https://welfare.state.example/advisory-scholarship-2024.html',
          type: 'url',
          publishedDate: '2024-07-10',
          cycleInfo: '2024–25',
          extractedAt: new Date().toISOString(),
          wordCount: 520,
          status: 'valid',
          content: `DEPARTMENT OF STUDENT WELFARE - SCHOLARSHIP ADVISORY
Cycle: 2024–25 Academic Year
Income limit for National Merit Scholarship candidates is strictly capped at INR 2,50,000 per annum.
Candidates with family income exceeding 2.5 Lakhs are automatically disqualified.
Submission is entirely physical; postal packets must be delivered to District Collectorate by 15th October 2024.`,
        },
        {
          id: 'src-demo-3',
          title: 'University Financial Aid Cell Application Guidelines 2026',
          url: 'https://univ-finaid.example/scholarships/merit-portal-guide',
          type: 'url',
          publishedDate: '2026-09-02',
          cycleInfo: '2026–27',
          extractedAt: new Date().toISOString(),
          wordCount: 610,
          status: 'valid',
          content: `CAMPUS FINANCIAL AID CELL - STUDENT NOTICE (2026-27)
For National Merit Scholarship 2026 applicants:
- Do NOT send physical paper hardcopies by post. The Ministry has transitioned to 100% paperless e-verification.
- Upload self-attested PDF scans of your Marksheet, Aadhaar card, and Digital Income Certificate directly on the national portal.
- Renewal: Scholarship is subject to annual renewal, but students must refer to central guidelines for minimum year-on-year pass percentage.`,
        },
      ],
      analysis: {
        overview: 'Comprehensive cross-examination of 3 scholarship sources reveals 1 critical contradiction regarding document submission format, an outdated income threshold from 2024–25, and a high-impact Information Dark Spot regarding ongoing renewal criteria.',
        claims: [
          {
            id: 'demo-clm-1',
            sourceId: 'src-demo-1',
            sourceTitle: 'Official Ministry Circular 2026–27',
            sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
            category: 'Eligibility',
            claim: 'Minimum 7.5 CGPA / 75% score and family annual income limit below INR 4,50,000.',
            supportingText: 'Minimum academic performance: 7.5 CGPA or 75% equivalent in Senior Secondary exams. Annual parental income must not exceed INR 4,50,000 per annum.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'demo-clm-2',
            sourceId: 'src-demo-1',
            sourceTitle: 'Official Ministry Circular 2026–27',
            sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
            category: 'Deadlines',
            claim: 'Online application closes 30th November 2026 at 11:59 PM IST.',
            supportingText: 'The National Scholarship Portal will accept online applications until 30th November 2026, 11:59 PM IST.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'demo-clm-3',
            sourceId: 'src-demo-1',
            sourceTitle: 'Official Ministry Circular 2026–27',
            sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
            category: 'Documents',
            claim: 'Original signed physical income certificate must be sent by registered post.',
            supportingText: 'All certified physical documents, including the original signed income certificate... must be posted via registered post to the Central Directorate Office.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'demo-clm-4',
            sourceId: 'src-demo-3',
            sourceTitle: 'University Financial Aid Cell Notice 2026',
            sourceUrl: 'https://univ-finaid.example/scholarships/merit-portal-guide',
            category: 'Documents',
            claim: '100% paperless; self-attested digital uploads required, no physical post.',
            supportingText: 'Do NOT send physical paper hardcopies by post. The Ministry has transitioned to 100% paperless e-verification. Upload self-attested PDF scans.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'demo-clm-5',
            sourceId: 'src-demo-2',
            sourceTitle: 'State Student Welfare Advisory (Archived 2024–25)',
            sourceUrl: 'https://welfare.state.example/advisory-scholarship-2024.html',
            category: 'Eligibility',
            claim: 'Income ceiling capped at INR 2,50,000 per annum.',
            supportingText: 'Income limit for National Merit Scholarship candidates is strictly capped at INR 2,50,000 per annum.',
            date: '2024–25',
            confidence: 'high',
          },
          {
            id: 'demo-clm-6',
            sourceId: 'src-demo-1',
            sourceTitle: 'Official Ministry Circular 2026–27',
            sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
            category: 'Benefits',
            claim: 'INR 50,000 annual stipend disbursed via Aadhaar-linked DBT.',
            supportingText: 'Selected scholars receive an annual stipend of INR 50,000 disbursed directly into their Aadhaar-seeded savings bank account via Direct Benefit Transfer.',
            date: '2026–27',
            confidence: 'high',
          },
        ],
        gaps: [
          {
            id: 'demo-gap-1',
            question: 'What is the exact renewal procedure, minimum CGPA required in year 2 & 3, and failure/grace policy?',
            category: 'Renewal Conditions',
            status: 'unanswered',
            explanation: 'None of the 3 reviewed sources define the academic cutoff for retaining the scholarship in subsequent college years, creating a major financial blindspot for the applicant.',
            impact: 'Critical',
            suggestedWhereToLook: 'Official National Scholarship Portal Renewal FAQ or Central Scheme Operations Manual',
          },
          {
            id: 'demo-gap-2',
            question: 'Who is the official grievance redressal officer and escalation contact if DBT payment fails?',
            category: 'Application Procedures',
            status: 'unanswered',
            explanation: 'No email, telephone helpline, or nodal authority address is specified across the reviewed documents.',
            impact: 'Medium',
            suggestedWhereToLook: 'Ministry Portal Contact Directory / PFMS Helpdesk',
          },
          {
            id: 'demo-gap-3',
            question: 'What are the exact qualifying criteria and family income thresholds?',
            category: 'Eligibility',
            status: 'answered',
            explanation: 'Detailed in Ministry 2026–27 Circular (7.5 CGPA and INR 4.5 Lakhs income ceiling).',
            impact: 'Critical',
            suggestedWhereToLook: 'Ministry 2026–27 Circular',
          },
          {
            id: 'demo-gap-4',
            question: 'What is the final application submission deadline?',
            category: 'Deadlines',
            status: 'answered',
            explanation: 'Stated as 30th November 2026, 11:59 PM IST.',
            impact: 'Critical',
            suggestedWhereToLook: 'Section 2 of Ministry Notification',
          },
          {
            id: 'demo-gap-5',
            question: 'Can the scholar receive other concurrent institutional or corporate scholarships?',
            category: 'Important Limitations',
            status: 'partially_answered',
            explanation: 'Ministry states other government scholarships are prohibited, but does not clarify whether private or college-level merit prizes are allowed.',
            impact: 'High',
            suggestedWhereToLook: 'Disqualification annexure on national scholarship portal',
          },
        ],
        contradictions: [
          {
            id: 'demo-contra-1',
            subject: 'Conflicting Document Submission Mode (Postal Hardcopy vs Paperless Digital)',
            sourceA: {
              sourceId: 'src-demo-1',
              sourceTitle: 'Official Ministry Circular 2026–27',
              sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
              claim: 'Mandates original income certificate sent via registered postal packet to Delhi.',
              supportingText: 'All certified physical documents, including the original signed income certificate... must be posted via registered post to the Central Directorate Office.',
              dateOrCycle: '2026–27',
            },
            sourceB: {
              sourceId: 'src-demo-3',
              sourceTitle: 'University Financial Aid Cell Notice 2026',
              sourceUrl: 'https://univ-finaid.example/scholarships/merit-portal-guide',
              claim: 'Instructs students NOT to send physical mail; upload self-attested PDFs only.',
              supportingText: 'Do NOT send physical paper hardcopies by post. The Ministry has transitioned to 100% paperless e-verification. Upload self-attested PDF scans.',
              dateOrCycle: '2026–27',
            },
            reason: 'Direct procedural conflict between official circular and university advisory. Risk of disqualification if physical post is omitted when required, or wasted effort if postal mode is deprecated.',
            isCycleDifference: false,
            suggestedAction: 'Verify directly with the National Scholarship Portal Technical Helpdesk whether portal upload generates an e-acknowledgment that waives postal submission.',
          },
          {
            id: 'demo-contra-2',
            subject: 'Income Ceiling Discrepancy (INR 4.5 Lakhs vs INR 2.5 Lakhs)',
            sourceA: {
              sourceId: 'src-demo-1',
              sourceTitle: 'Ministry Circular 2026–27',
              sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
              claim: 'Parental income limit is INR 4,50,000 per annum.',
              supportingText: 'Annual parental income must not exceed INR 4,50,000 per annum.',
              dateOrCycle: '2026–27',
            },
            sourceB: {
              sourceId: 'src-demo-2',
              sourceTitle: 'State Advisory 2024–25',
              sourceUrl: 'https://welfare.state.example/advisory-scholarship-2024.html',
              claim: 'Income limit is capped at INR 2,50,000 per annum.',
              supportingText: 'Income limit for National Merit Scholarship candidates is strictly capped at INR 2,50,000 per annum.',
              dateOrCycle: '2024–25',
            },
            reason: 'Identified as an Application Cycle Difference rather than a contradiction. The 2024–25 advisory reflects the older threshold before the 2026 revision.',
            isCycleDifference: true,
            suggestedAction: 'Disregard the 2024–25 limit of 2.5 Lakhs; follow the official 2026–27 threshold of 4.5 Lakhs.',
          },
        ],
        outdatedWarnings: [
          {
            id: 'demo-outdate-1',
            sourceId: 'src-demo-2',
            sourceTitle: 'State Student Welfare Advisory (Archived 2024–25 Circular)',
            sourceUrl: 'https://welfare.state.example/advisory-scholarship-2024.html',
            detectedDateOrCycle: '2024–25',
            status: 'potentially_outdated',
            explanation: 'This advisory belongs to the 2024–25 academic cycle (2 years old). Relying on its income limit or October 15 deadline will result in erroneous planning.',
            recommendation: 'Filter search results to the current 2026–27 fiscal year and archive older circulars.',
          },
          {
            id: 'demo-outdate-2',
            sourceId: 'src-demo-1',
            sourceTitle: 'Official Ministry Circular 2026–27',
            sourceUrl: 'https://scholarships.gov.example/merit-2026-circular.pdf',
            detectedDateOrCycle: '2026–27 (Published 2026-08-15)',
            status: 'current',
            explanation: 'Matches the current academic session.',
            recommendation: 'Periodically check for corrigendum notifications before November 30.',
          },
          {
            id: 'demo-outdate-3',
            sourceId: 'src-demo-3',
            sourceTitle: 'University Financial Aid Cell Guidelines 2026',
            sourceUrl: 'https://univ-finaid.example/scholarships/merit-portal-guide',
            detectedDateOrCycle: '2026-09-02',
            status: 'current',
            explanation: 'Recently updated institutional guidance for 2026 applicants.',
            recommendation: 'Confirm if university verification window closes earlier than national deadline.',
          },
        ],
        completeness: {
          totalQuestions: 5,
          answeredQuestions: 2,
          partiallyAnsweredQuestions: 1,
          unansweredQuestions: 2,
          completenessPercentage: 50,
          explanation: 'This completeness score of 50% reflects coverage across 5 benchmark scholarship questions (2 fully answered, 1 partially answered, 2 completely unaddressed dark spots). It measures document coverage, not a factual guarantee.',
        },
        verificationChecklist: [
          {
            id: 'demo-task-1',
            title: 'Reconcile Postal vs Online Document Submission Mode',
            description: 'Call Central Directorate Helpline to clarify whether original income certificate must be physically mailed or if digital portal PDF upload is sufficient.',
            priority: 'high',
            category: 'Contradiction Resolution',
            isCompleted: false,
            relatedContradictionId: 'demo-contra-1',
          },
          {
            id: 'demo-task-2',
            title: 'Locate Official Renewal Policy & Minimum Retention CGPA',
            description: 'Investigate the critical information gap: verify what second-year CGPA is required to prevent scholarship cancellation.',
            priority: 'high',
            category: 'Renewal Conditions',
            isCompleted: false,
            relatedGapId: 'demo-gap-1',
          },
          {
            id: 'demo-task-3',
            title: 'Verify Aadhaar-Bank Account DBT Seeding Status',
            description: 'Check with your bank branch that NPCI mapper is active on your savings account to receive the INR 50,000 disbursement.',
            priority: 'medium',
            category: 'Benefits & Disbursement',
            isCompleted: true,
          },
          {
            id: 'demo-task-4',
            title: 'Clarify Concurrent Private/Institutional Scholarship Policy',
            description: 'Ask university financial aid officer whether departmental fee concessions violate the concurrent benefit limitation.',
            priority: 'medium',
            category: 'Important Limitations',
            isCompleted: false,
            relatedGapId: 'demo-gap-5',
          },
          {
            id: 'demo-task-5',
            title: 'Ensure Document Issuing Authority Matches Revenue Cadre',
            description: 'Check that income certificate is signed by an authorized Tehsildar or Sub-Divisional Magistrate.',
            priority: 'low',
            category: 'Documents',
            isCompleted: false,
          },
        ],
        researchLimitations: [
          'Analysis bounded by the 3 provided scholarship documents. The missing renewal criteria exists in external state government gazettes but was not provided in the analyzed corpus.',
        ],
        analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        modelUsed: 'Digital Dark Spot Intelligence Engine (Benchmark Mode)',
      },
    };

    // Scenario 2: College Admission Transfer & Cutoff Verification
    const admissionProject: ResearchProject = {
      id: 'demo-admissions-2026',
      title: 'B.Tech Computer Science Admissions & Cutoff Verification',
      researchQuestion: 'What are the required entrance exam cutoffs, fee refund regulations, and credit transfer options for direct 2nd-year admissions?',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'completed',
      isDemo: true,
      sources: [
        {
          id: 'src-adm-1',
          title: 'Institute of Engineering & Technology Prospectus 2026',
          url: 'https://iet.example.edu/admissions-2026-handbook.pdf',
          type: 'url',
          publishedDate: '2026-05-10',
          cycleInfo: '2026–27',
          extractedAt: new Date().toISOString(),
          wordCount: 920,
          status: 'valid',
          content: `IET ADMISSIONS 2026-27:
1. Cutoff: General category JEE percentile minimum 92.5 percentile.
2. Documents: Class 10 & 12 marksheets, Domicile certificate, Medical fitness certificate.
3. Fees: Total annual tuition fee INR 1,80,000. Refund policy: 100% refund if withdrawn 15 days before orientation; 50% if within 7 days.
4. Note on Transfer: Lateral entry from polytechnic diploma is recognized in Civil & Mech, but B.Tech CSE lateral seats are subject to Senate vacancy review.`,
        },
        {
          id: 'src-adm-2',
          title: 'Admissions Forum & Coaching Blog Cutoff Guide',
          url: 'https://shiksha-prep-forum.example/iet-cutoff-rumor',
          type: 'url',
          publishedDate: '2025-11-20',
          cycleInfo: '2025–26',
          extractedAt: new Date().toISOString(),
          wordCount: 410,
          status: 'valid',
          content: `According to recent counselling trends, IET CSE accepts candidates down to 87 percentile in spot round. Direct transfer from other state universities is routinely allowed after Year 1.`,
        },
      ],
      analysis: {
        overview: 'Analysis reveals an unconfirmed cutoff discrepancy (92.5 percentile in official handbook vs 87 percentile informal blog) and an unaddressed Information Dark Spot regarding formal credit equivalence transfer policies.',
        claims: [
          {
            id: 'adm-clm-1',
            sourceId: 'src-adm-1',
            sourceTitle: 'IET Prospectus 2026',
            category: 'Eligibility',
            claim: 'Minimum 92.5 percentile in JEE for General category CSE admissions.',
            supportingText: 'Cutoff: General category JEE percentile minimum 92.5 percentile.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'adm-clm-2',
            sourceId: 'src-adm-1',
            sourceTitle: 'IET Prospectus 2026',
            category: 'Benefits',
            claim: 'Fee is INR 1,80,000 per year with tiered refund rules.',
            supportingText: 'Total annual tuition fee INR 1,80,000. Refund policy: 100% refund if withdrawn 15 days before orientation.',
            date: '2026–27',
            confidence: 'high',
          },
          {
            id: 'adm-clm-3',
            sourceId: 'src-adm-2',
            sourceTitle: 'Admissions Forum Guide',
            category: 'Eligibility',
            claim: 'Claims CSE spot round cutoff drops to 87 percentile.',
            supportingText: 'IET CSE accepts candidates down to 87 percentile in spot round.',
            date: '2025–26',
            confidence: 'medium',
          },
        ],
        gaps: [
          {
            id: 'adm-gap-1',
            question: 'What is the precise syllabus credit mapping and GPA threshold for lateral university transfers?',
            category: 'Requirements',
            status: 'unanswered',
            explanation: 'The official prospectus states CSE transfers depend on Senate review without publishing any objective credit transfer formula or application deadline.',
            impact: 'Critical',
            suggestedWhereToLook: 'University Academic Council Ordinances on Credit Transfer / Equivalence Committee',
          },
          {
            id: 'adm-gap-2',
            question: 'What are the required physical reporting dates and document verification center locations?',
            category: 'Deadlines',
            status: 'partially_answered',
            explanation: 'Refund timelines are mentioned relative to orientation date, but the exact orientation date is omitted.',
            impact: 'High',
            suggestedWhereToLook: 'Central Counselling Seat Allocation Schedule',
          },
        ],
        contradictions: [
          {
            id: 'adm-contra-1',
            subject: 'Entrance Percentile Cutoff Disparity (92.5 vs 87)',
            sourceA: {
              sourceId: 'src-adm-1',
              sourceTitle: 'IET Official Prospectus 2026',
              claim: 'Official minimum JEE cutoff is 92.5 percentile.',
              supportingText: 'Cutoff: General category JEE percentile minimum 92.5 percentile.',
              dateOrCycle: '2026–27',
            },
            sourceB: {
              sourceId: 'src-adm-2',
              sourceTitle: 'Admissions Forum Blog',
              claim: 'Unofficial source claims 87 percentile spot round cutoff.',
              supportingText: 'IET CSE accepts candidates down to 87 percentile in spot round.',
              dateOrCycle: '2025–26',
            },
            reason: 'Unofficial forum blog presents speculative historical spot round data that conflicts with the officially mandated minimum cutoff.',
            isCycleDifference: true,
            suggestedAction: 'Rely strictly on the official prospectus 92.5 threshold; treat informal forum advice as high-risk speculation.',
          },
        ],
        outdatedWarnings: [
          {
            id: 'adm-out-1',
            sourceId: 'src-adm-2',
            sourceTitle: 'Admissions Forum & Coaching Blog Cutoff Guide',
            detectedDateOrCycle: '2025-11-20',
            status: 'potentially_outdated',
            explanation: 'Published during the 2025–26 admissions cycle before updated 2026 accreditation seat distributions.',
            recommendation: 'Check official counselling closing rank pdfs released by the state exam authority.',
          },
        ],
        completeness: {
          totalQuestions: 5,
          answeredQuestions: 2,
          partiallyAnsweredQuestions: 1,
          unansweredQuestions: 2,
          completenessPercentage: 50,
          explanation: '50% completeness reflects coverage of standard admission inquiries across the 2 provided sources.',
        },
        verificationChecklist: [
          {
            id: 'adm-task-1',
            title: 'Verify Senate Ordinance on CSE Credit Transfers',
            description: 'Request the registrar transfer regulations to inspect how previous college semester credits map to IET syllabus.',
            priority: 'high',
            category: 'Academic Transfer',
            isCompleted: false,
          },
          {
            id: 'adm-task-2',
            title: 'Confirm Official Round 1 Opening & Closing Ranks',
            description: 'Download the verified counselling rank PDF from the examination authority instead of relying on coaching blogs.',
            priority: 'high',
            category: 'Eligibility Cutoffs',
            isCompleted: false,
          },
        ],
        researchLimitations: [
          'Evaluates only the prospectus and coaching blog provided. Does not replace direct statutory counselling bulletins.',
        ],
        analyzedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        modelUsed: 'Digital Dark Spot Intelligence Engine (Benchmark Mode)',
      },
    };

    this.projects.set(scholarshipProject.id, scholarshipProject);
    this.projects.set(admissionProject.id, admissionProject);
  }
}

export const storage = new StorageService();
