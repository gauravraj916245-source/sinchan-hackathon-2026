import { Router } from 'express';
import { storage } from '../services/storageService.js';
import { fetchPublicUrl, createSourceFromText } from '../services/sourceService.js';
import { analyzeResearchProject } from '../services/aiService.js';
import { ResearchProject, SourceItem } from '../types.js';

export const apiRouter = Router();

// GET all research projects
apiRouter.get('/research', (req, res) => {
  try {
    const projects = storage.getAll();
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to fetch research projects' });
  }
});

// GET single research project by ID
apiRouter.get('/research/:id', (req, res) => {
  try {
    const project = storage.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Research project not found' });
    }
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// CREATE new research project
apiRouter.post('/research', (req, res) => {
  try {
    const { title, researchQuestion, sources } = req.body;
    if (!title || !researchQuestion) {
      return res.status(400).json({ success: false, error: 'Project title and research question are required.' });
    }

    const newProject: ResearchProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      researchQuestion: researchQuestion.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: Array.isArray(sources) ? sources : [],
      status: 'draft',
      isDemo: false,
    };

    const saved = storage.save(newProject);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// DELETE research project
apiRouter.delete('/research/:id', (req, res) => {
  try {
    const deleted = storage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Research project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// TOGGLE checklist item status
apiRouter.patch('/research/:id/checklist', (req, res) => {
  try {
    const { taskId, isCompleted } = req.body;
    if (!taskId || typeof isCompleted !== 'boolean') {
      return res.status(400).json({ success: false, error: 'taskId and isCompleted boolean are required.' });
    }

    const updated = storage.toggleChecklistItem(req.params.id, taskId, isCompleted);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project or checklist task not found.' });
    }

    const project = storage.getById(req.params.id);
    res.json({ success: true, data: project?.analysis?.verificationChecklist });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// FETCH public web source with SSRF protection
apiRouter.post('/sources/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid URL is required.' });
    }

    const sourceItem = await fetchPublicUrl(url.trim());
    res.json({ success: true, data: sourceItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// PARSE manual text or document content
apiRouter.post('/sources/parse-text', (req, res) => {
  try {
    const { title, content, type, cycleInfo, publishedDate } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'Content is required.' });
    }

    const sourceItem = createSourceFromText(title || 'Custom Document', content, type || 'text', cycleInfo, publishedDate);
    res.json({ success: true, data: sourceItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// RUN AI Analysis Pipeline
apiRouter.post('/analyze', async (req, res) => {
  try {
    const { projectId, topic, researchQuestion, sources } = req.body;

    let targetProject: ResearchProject | undefined;
    let analyzeTopic = topic;
    let analyzeQuestion = researchQuestion;
    let analyzeSources: SourceItem[] = sources;

    if (projectId) {
      targetProject = storage.getById(projectId);
      if (targetProject) {
        analyzeTopic = targetProject.title;
        analyzeQuestion = targetProject.researchQuestion;
        analyzeSources = targetProject.sources;
        targetProject.status = 'analyzing';
        storage.save(targetProject);
      }
    }

    if (!analyzeSources || analyzeSources.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one source is required to conduct information-gap analysis.',
      });
    }

    // Execute multi-agent analysis
    const analysisResult = await analyzeResearchProject(
      analyzeTopic || 'Research Subject',
      analyzeQuestion || 'Key verification questions',
      analyzeSources
    );

    if (targetProject) {
      targetProject.analysis = analysisResult;
      targetProject.status = 'completed';
      storage.save(targetProject);
      return res.json({ success: true, data: targetProject });
    }

    // Or return created project
    const newProject: ResearchProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: analyzeTopic || 'Research Topic',
      researchQuestion: analyzeQuestion || 'Key verification questions',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: analyzeSources,
      analysis: analysisResult,
      status: 'completed',
      isDemo: false,
    };

    storage.save(newProject);
    res.json({ success: true, data: newProject });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Analysis failed. Check your sources and try again.',
    });
  }
});

// PRESET DEMONSTRATION SCENARIOS
apiRouter.get('/scenarios', (req, res) => {
  const scenarios = [
    {
      id: 'scholarship',
      title: 'National Merit Scholarship 2026–27',
      topic: 'National Merit Scholarship 2026–27 Verification',
      question: 'What should I verify before applying for this scholarship, and what critical renewal clauses are missing?',
      description: 'Features 3 sources: an official 2026 circular, an outdated 2024–25 advisory with obsolete income limits, and a contradictory university notice regarding postal vs digital uploads.',
      tags: ['Contradiction', 'Outdated Warning', 'Renewal Gap', 'Critical Impact'],
    },
    {
      id: 'admissions',
      title: 'B.Tech CS Admissions & Lateral Credit Transfer',
      topic: 'B.Tech Computer Science Admissions & Cutoff Verification',
      question: 'What are the required entrance exam cutoffs, fee refund regulations, and credit transfer options for direct 2nd-year admissions?',
      description: 'Features an official university prospectus vs an unconfirmed coaching blog cutoff rumor, plus an unaddressed dark spot regarding lateral credit transfer policies.',
      tags: ['Cutoff Conflict', 'Missing Credit Policy', 'Admissions'],
    },
    {
      id: 'internship',
      title: 'Software Engineering Summer Internship 2027',
      topic: 'Software Engineering Summer Internship Eligibility',
      question: 'What are the graduation batch restrictions, stipend disclosures, and intellectual property/bond requirements for applying?',
      description: 'Tests graduation year eligibility (2027 vs 2028 batch), remote vs in-person stipends, and flags the complete absence of intellectual property/non-compete clauses.',
      tags: ['Internship', 'Batch Mismatch', 'Missing IP Clause'],
    },
  ];

  res.json({ success: true, data: scenarios });
});

// LOAD PRESET SCENARIO INTO WORKSPACE
apiRouter.post('/scenarios/load', (req, res) => {
  try {
    const { scenarioId } = req.body;
    let demoProject: ResearchProject | undefined;

    if (scenarioId === 'scholarship' || scenarioId === 'demo-scholarship-2026') {
      demoProject = storage.getById('demo-scholarship-2026');
    } else if (scenarioId === 'admissions' || scenarioId === 'demo-admissions-2026') {
      demoProject = storage.getById('demo-admissions-2026');
    } else if (scenarioId === 'internship') {
      // Create internship demo
      const internshipProject: ResearchProject = {
        id: `demo-internship-${Date.now()}`,
        title: 'Software Engineering Summer Internship 2027',
        researchQuestion: 'What are the graduation batch restrictions, stipend disclosures, and intellectual property/bond requirements for applying?',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'completed',
        isDemo: true,
        sources: [
          {
            id: 'src-int-1',
            title: 'Global Tech Careers 2027 Internship Posting',
            url: 'https://careers.globaltech.example/internship-2027',
            type: 'url',
            publishedDate: '2026-09-01',
            cycleInfo: '2027 Cohort',
            extractedAt: new Date().toISOString(),
            wordCount: 650,
            status: 'valid',
            content: `SOFTWARE ENGINEER INTERN - SUMMER 2027
Eligibility: Currently pursuing B.Tech/B.S. in Computer Science or related STEM field graduating in Spring/Summer 2027. Minimum 8.0 CGPA or equivalent required.
Duration: 10 weeks in-person at Bangalore or Hyderabad office.
Stipend: INR 75,000 per month plus corporate housing allowance.
Requirements: Strong proficiency in Data Structures, Algorithms, and Modern Web Systems.`,
          },
          {
            id: 'src-int-2',
            title: 'Campus Placement Cell FAQ Guide',
            url: 'https://placement-portal.example/internships/faq',
            type: 'url',
            publishedDate: '2026-08-20',
            cycleInfo: '2026–27',
            extractedAt: new Date().toISOString(),
            wordCount: 420,
            status: 'valid',
            content: `CAMPUS PLACEMENT FAQ:
Global Tech permits both pre-final year (2027 passouts) and 2028 batch students to apply for summer positions. Remote internships may be granted upon department recommendation.`,
          },
        ],
        analysis: {
          overview: 'Analysis identifies batch eligibility conflict between official JD and campus placement FAQ, alongside a critical Information Gap: total omission of employee IP assignment and post-internship service bonds.',
          claims: [
            {
              id: 'int-clm-1',
              sourceId: 'src-int-1',
              sourceTitle: 'Global Tech Careers 2027',
              category: 'Eligibility',
              claim: 'Graduating in Summer 2027 with minimum 8.0 CGPA.',
              supportingText: 'graduating in Spring/Summer 2027. Minimum 8.0 CGPA or equivalent required.',
              date: '2027 Cohort',
              confidence: 'high',
            },
            {
              id: 'int-clm-2',
              sourceId: 'src-int-1',
              sourceTitle: 'Global Tech Careers 2027',
              category: 'Benefits',
              claim: 'Stipend of INR 75,000/month plus corporate housing.',
              supportingText: 'Stipend: INR 75,000 per month plus corporate housing allowance.',
              date: '2027 Cohort',
              confidence: 'high',
            },
            {
              id: 'int-clm-3',
              sourceId: 'src-int-2',
              sourceTitle: 'Campus Placement Cell FAQ',
              category: 'Eligibility',
              claim: 'States both 2027 and 2028 batch students can apply.',
              supportingText: 'Global Tech permits both pre-final year (2027 passouts) and 2028 batch students to apply.',
              date: '2026–27',
              confidence: 'medium',
            },
          ],
          gaps: [
            {
              id: 'int-gap-1',
              question: 'Are interns subject to intellectual property (IP) assignment or non-compete bond restrictions?',
              category: 'Important Limitations',
              status: 'unanswered',
              explanation: 'Neither source defines whether personal side projects built during off-hours belong to the company, or if a mandatory retention bond is enforced.',
              impact: 'Critical',
              suggestedWhereToLook: 'Standard Employee Offer Letter Terms & Proprietary Information Agreement (PIIA)',
            },
            {
              id: 'int-gap-2',
              question: 'What is the full-time pre-placement offer (PPO) conversion conversion rate and evaluation rubrics?',
              category: 'Renewal Conditions',
              status: 'unanswered',
              explanation: 'No metrics or milestones are detailed for securing a permanent post-graduation job offer.',
              impact: 'High',
              suggestedWhereToLook: 'HR Campus Relations Orientation Deck',
            },
          ],
          contradictions: [
            {
              id: 'int-contra-1',
              subject: 'Graduation Year Batch Eligibility Discrepancy (2027 only vs 2027 & 2028)',
              sourceA: {
                sourceId: 'src-int-1',
                sourceTitle: 'Official Job Description',
                claim: 'Restricted strictly to 2027 graduates.',
                supportingText: 'graduating in Spring/Summer 2027.',
                dateOrCycle: '2027 Cohort',
              },
              sourceB: {
                sourceId: 'src-int-2',
                sourceTitle: 'Placement Cell FAQ',
                claim: 'Claims 2028 batch (sophomores) are also permitted.',
                supportingText: 'permits both pre-final year (2027 passouts) and 2028 batch students to apply.',
                dateOrCycle: '2026–27',
              },
              reason: 'Contradiction between company recruitment policy and university placement cell notice. Risk of resume auto-rejection by ATS for 2028 applicants.',
              isCycleDifference: false,
              suggestedAction: 'Check the live application portal dropdown filter before applying to confirm allowed graduation years.',
            },
          ],
          outdatedWarnings: [
            {
              id: 'int-out-1',
              sourceId: 'src-int-1',
              sourceTitle: 'Global Tech Careers 2027',
              detectedDateOrCycle: '2027 Cohort (Published 2026-09-01)',
              status: 'current',
              explanation: 'Matches upcoming recruitment season.',
              recommendation: 'Check closing date for initial screening rounds.',
            },
          ],
          completeness: {
            totalQuestions: 5,
            answeredQuestions: 2,
            partiallyAnsweredQuestions: 1,
            unansweredQuestions: 2,
            completenessPercentage: 50,
            explanation: '50% completeness reflects coverage of standard internship inquiries across 2 reviewed documents.',
          },
          verificationChecklist: [
            {
              id: 'int-task-1',
              title: 'Reconcile Batch Eligibility in Portal Dropdown',
              description: 'Open company careers form to check if 2028 graduation year appears in candidate dropdown list.',
              priority: 'high',
              category: 'Contradiction Resolution',
              isCompleted: false,
            },
            {
              id: 'int-task-2',
              title: 'Request Copy of IP & Side Project Assignment Policy',
              description: 'Clarify with talent team whether student GitHub repositories or pre-existing startup projects are encumbered.',
              priority: 'high',
              category: 'Legal Limitations',
              isCompleted: false,
            },
          ],
          researchLimitations: [
            'Sample demonstration dataset for multi-source information verification.',
          ],
          analyzedAt: new Date().toISOString(),
          modelUsed: 'Digital Dark Spot Intelligence Engine (Benchmark Mode)',
        },
      };
      demoProject = storage.save(internshipProject);
    }

    if (!demoProject) {
      demoProject = storage.getById('demo-scholarship-2026');
    }

    res.json({ success: true, data: demoProject });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
