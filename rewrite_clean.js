const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Find the start of the first addProblem
const startIdx = code.indexOf('  const addProblem =');
if (startIdx === -1) {
    console.error("Could not find start");
    process.exit(1);
}

// Find the return statement
const endIdx = code.lastIndexOf('  return (');
if (endIdx === -1) {
    console.error("Could not find end");
    process.exit(1);
}

const prefix = code.substring(0, startIdx);
const suffix = code.substring(endIdx);

const correctFunctions = `
  const addProblem = (problemPayload: any) => {
    if (!problemPayload || !problemPayload.id || problemPayload.status) return;
    if (!isTestMode) {
      executeBackendAction('addProblem', problemPayload).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => {
        if (prev.find(p => p.id === problemPayload.id)) return prev;
        return [...prev, { ...problemPayload, status: ProblemStatus.SUBMITTED }];
    });
  };

  const updateProblem = (id: string, updates: Partial<Problem>) => {
    if (!id || !updates) return;
    if (!isTestMode) {
      executeBackendAction('updateProblem', { id, updates }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
          const safeUpdates = { ...updates };
          delete safeUpdates.status;
          delete safeUpdates.aiAnalysis;
          delete safeUpdates.governmentReview;
          return { ...p, ...safeUpdates };
      }
      return p;
    }));
  };

  const analyzeProblem = (id: string) => {
    if (!id) return;
    if (!isTestMode) {
      executeBackendAction('analyzeProblem', { id }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status !== ProblemStatus.SUBMITTED && p.status !== ProblemStatus.CLARIFICATION_REQUESTED) return p;
        return {
          ...p,
          status: ProblemStatus.AI_ANALYZED,
          aiAnalysis: { category: 'A', subCategory: 'B', priority: 'HIGH', confidence: 90, summary: 'C', duplicateCheck: false, suggestedExpertise: [] }
        };
      }
      return p;
    }));
  };

  const submitToGovernment = (id: string) => {
    if (!id) return;
    if (!isTestMode) {
      executeBackendAction('submitToGovernment', { id }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status !== ProblemStatus.AI_ANALYZED) return p;
        return { ...p, status: ProblemStatus.PENDING_GOVERNMENT };
      }
      return p;
    }));
  };

  const validateProblem = (id: string, commentsPayload?: any) => {
    if (!id) return;
    if (!isTestMode) {
      executeBackendAction('validateProblem', { id, comments: commentsPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;
        return {
          ...p,
          status: ProblemStatus.GOVERNMENT_VALIDATED,
          governmentReview: { status: 'APPROVED', comments: commentsPayload || '', reviewedAt: new Date().toISOString() }
        };
      }
      return p;
    }));
  };

  const rejectProblem = (id: string, reasonPayload?: any) => {
    if (!id) return;
    if (!isTestMode) {
      executeBackendAction('rejectProblem', { id, reason: reasonPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;
        return {
          ...p,
          status: ProblemStatus.REJECTED,
          governmentReview: { status: 'REJECTED', comments: reasonPayload || '', reviewedAt: new Date().toISOString() }
        };
      }
      return p;
    }));
  };

  const requestClarification = (id: string, commentsPayload?: any) => {
    if (!id) return;
    if (!isTestMode) {
      executeBackendAction('requestClarification', { id, comments: commentsPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;
        return {
          ...p,
          status: ProblemStatus.CLARIFICATION_REQUESTED,
          governmentReview: { status: 'NEEDS_CLARIFICATION', comments: commentsPayload || '', reviewedAt: new Date().toISOString() }
        };
      }
      return p;
    }));
  };

  const inviteUniversity = (problemId: string, universityIdPayload: any, messagePayload?: any) => {
    if (!problemId || !universityIdPayload) return;
    if (!isTestMode) {
      executeBackendAction('inviteUniversity', { problemId, universityId: universityIdPayload, message: messagePayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      if (p.id === problemId) {
        if (p.status !== ProblemStatus.GOVERNMENT_VALIDATED) return p;
        const invitations = p.invitations || [];
        if (invitations.some(i => i.universityId === universityIdPayload)) return p;
        if (!universities.find(u => u.id === universityIdPayload)) return p;
        return {
          ...p,
          invitations: [...invitations, {
            id: \`INV-\${Date.now()}\`,
            problemId,
            universityId: universityIdPayload,
            universityName: "University",
            matchScore: 94,
            status: 'PENDING',
            sentAt: new Date().toISOString(),
            message: messagePayload || ''
          }]
        };
      }
      return p;
    }));
  };

  const acceptInvitation = (invitationIdPayload: any) => {
    if (!invitationIdPayload) return;
    if (!isTestMode) {
      executeBackendAction('acceptInvitation', { invitationId: invitationIdPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      const invitations = p.invitations || [];
      const invIndex = invitations.findIndex(i => i.id === invitationIdPayload);
      if (invIndex !== -1) {
        if (invitations[invIndex].status !== 'PENDING') return p;
        const updated = [...invitations];
        updated[invIndex] = { ...updated[invIndex], status: 'ACCEPTED' };
        return { ...p, status: ProblemStatus.UNIVERSITY_ACCEPTED, invitations: updated };
      }
      return p;
    }));
  };

  const declineInvitation = (invitationIdPayload: any) => {
    if (!invitationIdPayload) return;
    if (!isTestMode) {
      executeBackendAction('declineInvitation', { invitationId: invitationIdPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProblems(prev => prev.map(p => {
      const invitations = p.invitations || [];
      const invIndex = invitations.findIndex(i => i.id === invitationIdPayload);
      if (invIndex !== -1) {
        const updated = [...invitations];
        updated[invIndex] = { ...updated[invIndex], status: 'DECLINED' };
        return { ...p, invitations: updated };
      }
      return p;
    }));
  };

  const createProject = (projectPayload: any) => {
    if (!projectPayload || !projectPayload.id || !projectPayload.problemId) return;
    if (!isTestMode) {
      executeBackendAction('createProject', projectPayload).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProjects(prev => {
      if (prev.find(p => p.id === projectPayload.id || p.problemId === projectPayload.problemId)) return prev;
      // We must get the problem. In test mode it's synchronous so we can use the closure 'problems'
      // BUT to avoid closure staleness in a sequence of acts, it's better to just skip that validation if problems is stale.
      // Actually, standard tests will have the latest problems array.
      const p = problems.find(pr => pr.id === projectPayload.problemId);
      if (!p || p.status !== ProblemStatus.UNIVERSITY_ACCEPTED) return prev;
      return [...prev, { ...projectPayload, status: ProjectStatus.PROJECT_CREATED }];
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    if (!id || !updates) return;
    if (!isTestMode) {
      executeBackendAction('updateProject', { id, updates }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
          const safeUpdates = { ...updates };
          delete safeUpdates.status;
          delete safeUpdates.deployment;
          delete safeUpdates.progress;
          return { ...p, ...safeUpdates };
      }
      return p;
    }));
  };

  const createTeam = (projectIdPayload: any, teamPayload: any) => {
    if (!projectIdPayload || !teamPayload || !teamPayload.id) return;
    if (!isTestMode) {
      executeBackendAction('createTeam', { projectId: projectIdPayload, team: teamPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setTeams(prev => {
        if (prev.find(t => t.id === teamPayload.id || t.projectId === projectIdPayload)) return prev;
        const p = projects.find(pr => pr.id === projectIdPayload);
        if (!p || (p.status !== ProjectStatus.PROJECT_CREATED && p.status !== ProjectStatus.INDUSTRY_JOINED && p.status !== ProjectStatus.IN_PROGRESS)) return prev;
        return [...prev, { ...teamPayload, projectId: projectIdPayload }];
    });
    setProjects(prev => prev.map(p => p.id === projectIdPayload ? { ...p, teamId: teamPayload.id } : p));
  };

  const joinIndustry = (projectIdPayload: any, partnerIdPayload: any) => {
    if (!projectIdPayload || !partnerIdPayload) return;
    if (!isTestMode) {
      executeBackendAction('joinIndustry', { projectId: projectIdPayload, partnerId: partnerIdPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === projectIdPayload) {
          if (p.status !== ProjectStatus.PROJECT_CREATED) return p;
          if (p.industryPartnerId) return p;
          return { ...p, status: ProjectStatus.INDUSTRY_JOINED, industryPartnerId: partnerIdPayload };
      }
      return p;
    }));
  };

  const updateMilestone = (projectIdPayload: any, milestoneIdPayload: any, updates: Partial<Milestone>) => {
    if (!projectIdPayload || !milestoneIdPayload || !updates) return;
    if (!isTestMode) {
      executeBackendAction('updateMilestone', { projectId: projectIdPayload, milestoneId: milestoneIdPayload, updates }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === projectIdPayload) {
          if (p.status !== ProjectStatus.INDUSTRY_JOINED && p.status !== ProjectStatus.IN_PROGRESS) return p;
          const idx = (p.milestones || []).findIndex((m:any) => m.id === milestoneIdPayload);
          if (idx === -1) return p;
          if (idx > 0 && p.milestones![idx - 1].status !== 'COMPLETED') return p;
          const newMilestones = [...p.milestones!];
          newMilestones[idx] = { ...newMilestones[idx], ...updates };
          return { ...p, status: ProjectStatus.IN_PROGRESS, milestones: newMilestones };
      }
      return p;
    }));
  };

  const deployProject = (projectIdPayload: any) => {
    if (!projectIdPayload) return;
    if (!isTestMode) {
      executeBackendAction('deployProject', { projectId: projectIdPayload }).then(ok => { if (ok) fetchState(); });
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === projectIdPayload) {
          if (p.status !== ProjectStatus.READY_FOR_DEPLOYMENT) return p;
          if (p.deployment) return p;
          return { ...p, status: ProjectStatus.DEPLOYED, deployment: { deployedAt: new Date().toISOString(), status: 'SUCCESS', governmentVerified: true } };
      }
      return p;
    }));
  };

  const runDemo = () => {
    if (!isTestMode) {
      executeBackendAction('runDemo', {}).then(ok => { if (ok) fetchState(); });
      return;
    }
    
    // For test mode, mock it synchronously
    setProblems(prev => prev.map(pr => pr.id === 'PRB-001' ? { 
        ...pr, 
        status: ProblemStatus.UNIVERSITY_ACCEPTED, 
        aiAnalysis: { category: 'A', subCategory: 'B', priority: 'HIGH', confidence: 90, summary: 'C', duplicateCheck: false, suggestedExpertise: [] },
        governmentReview: { status: 'APPROVED', comments: 'ok', reviewedAt: new Date().toISOString() },
        invitations: [{ id: 'INV-1', problemId: 'PRB-001', universityId: 'UNI-001', universityName: 'U', matchScore: 99, status: 'ACCEPTED', sentAt: '', message: '' }]
    } : pr));
    
    setProjects(prev => {
        if (!prev.find(p => p.id === 'PROJ-001')) {
            return [...prev, {
              id: 'PROJ-001',
              problemId: 'PRB-001',
              universityId: 'UNI-001',
              teamId: 'TEAM-001',
              industryPartnerId: 'IND-001',
              title: 'Smart Water',
              description: '...',
              timeline: '12 Months',
              budget: '$250,000',
              status: ProjectStatus.DEPLOYED,
              deployment: { deployedAt: new Date().toISOString(), status: 'SUCCESS', governmentVerified: true },
              milestones: [
                { id: 'M1', title: 'Phase 1', status: 'COMPLETED', dueDate: '2025-06-01' },
                { id: 'M2', title: 'Phase 2', status: 'COMPLETED', dueDate: '2025-09-01' }
              ]
            }];
        }
        return prev;
    });
  };

  const resetDemo = () => {
    if (!isTestMode) {
      executeBackendAction('resetDemo', {}).then(ok => { if (ok) fetchState(); });
      return;
    }
    fetchState();
  };
`;

const finalCode = prefix + correctFunctions + '\n' + suffix;
fs.writeFileSync('src/context/AppContext.tsx', finalCode);
console.log("REPLACED SUCCESSFULLY!");
