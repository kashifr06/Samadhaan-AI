import React, { createContext, useContext, useState } from 'react';
import { Problem, Role, University, UniversityInvitation, Project, StudentTeam, IndustryPartner, Milestone, ProblemStatus, ProjectStatus, isProjectReadyForDeployment } from '../types';
import { seededProblems, seededUniversities, seededIndustryPartners, seededProjects, seededTeams } from '../data/seed';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  problems: Problem[];
  addProblem: (problem: Problem) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  analyzeProblem: (id: string) => void;
  submitToGovernment: (id: string) => void;
  validateProblem: (id: string, commentsPayload?: any) => void;
  rejectProblem: (id: string, reasonPayload?: any) => void;
  requestClarification: (id: string, commentsPayload?: any) => void;
  universities: University[];
  inviteUniversity: (problemId: string, universityIdPayload: any, messagePayload?: any) => void;
  acceptInvitation: (invitationIdPayload: any) => void;
  declineInvitation: (invitationIdPayload: any) => void;
  
  projects: Project[];
  createProject: (projectPayload: any) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  teams: StudentTeam[];
  createTeam: (projectId: string, team: StudentTeam) => void;
  
  industryPartners: IndustryPartner[];
  joinIndustry: (projectId: string, partnerId: string) => void;
  
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deployProject: (projectId: string) => void;
  
  runDemo: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('Citizen');
  const [problems, setProblems] = useState<Problem[]>(seededProblems);
  const [universities] = useState<University[]>(seededUniversities);
  
  const [projects, setProjects] = useState<Project[]>(seededProjects);
  const [teams, setTeams] = useState<StudentTeam[]>(seededTeams);
  const [industryPartners] = useState<IndustryPartner[]>(seededIndustryPartners);

  const resetDemo = () => {
    setProblems(seededProblems);
    setProjects(seededProjects);
    setTeams(seededTeams);
  };

  const runDemo = () => {
    const pId = 'PRB-001';
    const problem = problems.find(p => p.id === pId);
    if (!problem) return;

    if (problem.status === ProblemStatus.SUBMITTED) {
      analyzeProblem(pId);
    } else if (problem.status === ProblemStatus.AI_ANALYZED) {
      submitToGovernment(pId);
    } else if (problem.status === ProblemStatus.PENDING_GOVERNMENT) {
      validateProblem(pId, 'Looks good. Assigned to BIT Mesra.');
    } else if (problem.status === ProblemStatus.GOVERNMENT_VALIDATED) {
      const invs = problem.invitations || [];
      if (invs.length === 0) {
        inviteUniversity(pId, 'UNI-001', 'Please help us with this issue.');
      } else if (invs[0].status === 'PENDING') {
        acceptInvitation(invs[0].id);
      }
    } else if (problem.status === ProblemStatus.UNIVERSITY_ACCEPTED) {
      // Check if project exists
      const project = projects.find(p => p.problemId === pId);
      if (!project) {
        const newProj: Project = {
          id: `PROJ-${Date.now()}`,
          problemId: pId,
          universityId: 'UNI-001',
          title: 'WaterSmart Solutions for Ranchi',
          objective: 'Develop a smart water-level monitoring and drainage system.',
          status: ProjectStatus.PROJECT_CREATED,
          progress: 0,
          milestones: [
            { id: 'M1', projectId: 'TEMP', title: 'Problem Validation', description: 'Confirm on-ground details.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M2', projectId: 'TEMP', title: 'Field Survey', description: 'Collect data.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M3', projectId: 'TEMP', title: 'Solution Design', description: 'Draft architecture.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M4', projectId: 'TEMP', title: 'Prototype Development', description: 'Build prototype.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M5', projectId: 'TEMP', title: 'Prototype Testing', description: 'Test prototype.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M6', projectId: 'TEMP', title: 'Government Pilot', description: 'Deploy pilot.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 },
            { id: 'M7', projectId: 'TEMP', title: 'Deployment', description: 'Final deployment.', status: 'PENDING' as const, responsibleGroup: 'Student Team', completionPercentage: 0 }
          ].map(m => ({ ...m, projectId: `PROJ-${Date.now()}` }))
        };
        createProject(newProj);
      } else if (project.status === ProjectStatus.DEPLOYED) {
        return; // Done
      } else if (!project.teamId) {
        const team: StudentTeam = {
          id: `TEAM-${Date.now()}`,
          name: 'WaterSmart Solutions',
          universityId: 'UNI-001',
          members: [],
          expertise: ['IoT', 'Data Analysis']
        };
        createTeam(project.id, team);
      } else if (!project.industryPartnerId) {
        joinIndustry(project.id, industryPartners[0].id);
      } else {
        const pendingMilestone = project.milestones.find(m => m.status === 'PENDING' || m.status === 'IN_PROGRESS');
        if (pendingMilestone) {
          if (pendingMilestone.title === 'Deployment' && project.status === ProjectStatus.READY_FOR_DEPLOYMENT) {
            deployProject(project.id);
          } else {
            updateMilestone(project.id, pendingMilestone.id, { status: 'COMPLETED' });
          }
        }
      }
    }
  };

  const addProblem = (problemPayload: any) => {
    if (!problemPayload || typeof problemPayload !== 'object') return;

    // Cannot add if duplicate ID
    if (!problemPayload.id || typeof problemPayload.id !== 'string' || !problemPayload.id.trim()) return;
    const id = problemPayload.id.trim();
    if (problems.some(p => p.id === id)) {
        return;
    }

    // Must be in SUBMITTED state initially
    if (problemPayload.status && problemPayload.status !== ProblemStatus.SUBMITTED) {
        return;
    }

    // Must have required fields, cannot be whitespace-only
    if (
        !problemPayload.title || typeof problemPayload.title !== 'string' || !problemPayload.title.trim() ||
        !problemPayload.description || typeof problemPayload.description !== 'string' || !problemPayload.description.trim() ||
        !problemPayload.category || typeof problemPayload.category !== 'string' || !problemPayload.category.trim() ||
        !problemPayload.location || typeof problemPayload.location !== 'string' || !problemPayload.location.trim()
    ) {
        return;
    }

    const newProblem: Problem = {
        id,
        status: ProblemStatus.SUBMITTED,
        title: problemPayload.title.trim(),
        description: problemPayload.description.trim(),
        category: problemPayload.category.trim(),
        location: problemPayload.location.trim(),
        submittedBy: typeof problemPayload.submittedBy === 'string' ? problemPayload.submittedBy.trim() : 'Unknown',
        submittedAt: typeof problemPayload.submittedAt === 'string' ? problemPayload.submittedAt : new Date().toISOString(),
        affectedArea: typeof problemPayload.affectedArea === 'string' ? problemPayload.affectedArea.trim() : undefined,
        estimatedPeopleAffected: typeof problemPayload.estimatedPeopleAffected === 'string' ? problemPayload.estimatedPeopleAffected.trim() : undefined,
        imageUrl: typeof problemPayload.imageUrl === 'string' ? problemPayload.imageUrl.trim() : undefined,
    };

    setProblems((prev) => [newProblem, ...prev]);
  };

  const analyzeProblem = (id: string, aiAnalysisData?: any) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status !== ProblemStatus.SUBMITTED) return p;
      
      const category = aiAnalysisData?.category && typeof aiAnalysisData.category === 'string' ? aiAnalysisData.category : p.category;
      const analysis = {
          category,
          subCategory: aiAnalysisData?.subCategory && typeof aiAnalysisData.subCategory === 'string' ? aiAnalysisData.subCategory : 'General',
          priority: aiAnalysisData?.priority && typeof aiAnalysisData.priority === 'string' ? aiAnalysisData.priority : 'MEDIUM',
          confidence: aiAnalysisData?.confidence && typeof aiAnalysisData.confidence === 'number' ? aiAnalysisData.confidence : 85,
          summary: aiAnalysisData?.summary && typeof aiAnalysisData.summary === 'string' ? aiAnalysisData.summary : 'Automatically analyzed problem report.',
          affectedPopulation: aiAnalysisData?.affectedPopulation && typeof aiAnalysisData.affectedPopulation === 'string' ? aiAnalysisData.affectedPopulation : 'Unknown',
          duplicateCheck: aiAnalysisData?.duplicateCheck && typeof aiAnalysisData.duplicateCheck === 'string' ? aiAnalysisData.duplicateCheck : 'No exact matches found',
          suggestedExpertise: Array.isArray(aiAnalysisData?.suggestedExpertise) ? aiAnalysisData.suggestedExpertise.filter((x: any) => typeof x === 'string') : ['General Administration']
      };

      return { 
          ...p, 
          status: ProblemStatus.AI_ANALYZED,
          aiAnalysis: analysis as any
      };
    }));
  };

  const submitToGovernment = (id: string) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status !== ProblemStatus.AI_ANALYZED) return p;
      return { ...p, status: ProblemStatus.PENDING_GOVERNMENT };
    }));
  };

  const validateProblem = (id: string, commentsPayload?: any) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      // Must come from PENDING_GOVERNMENT only
      if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;
      if (!p.aiAnalysis) return p; // Must have AI analysis

      const comments = typeof commentsPayload === 'string' ? commentsPayload.trim() : '';

      return { 
        ...p, 
        status: ProblemStatus.GOVERNMENT_VALIDATED,
        governmentReview: { 
            status: 'APPROVED', 
            comments,
            reviewedAt: new Date().toISOString()
        }
      };
    }));
  };

  const rejectProblem = (id: string, reasonPayload?: any) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;
      
      const rejectionReason = typeof reasonPayload === 'string' ? reasonPayload.trim() : '';

      return { 
        ...p, 
        status: ProblemStatus.REJECTED,
        governmentReview: { 
            status: 'REJECTED', 
            rejectionReason,
            reviewedAt: new Date().toISOString()
        }
      };
    }));
  };

  const requestClarification = (id: string, commentsPayload?: any) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status !== ProblemStatus.PENDING_GOVERNMENT) return p;

      const comments = typeof commentsPayload === 'string' ? commentsPayload.trim() : '';

      return { 
        ...p, 
        status: ProblemStatus.CLARIFICATION_REQUESTED,
        governmentReview: { 
            status: 'REQUEST_INFO', 
            comments,
            reviewedAt: new Date().toISOString()
        }
      };
    }));
  };

  const updateProblem = (id: string, updates: Partial<Problem>) => {
    setProblems(prev => prev.map(p => {
      if (p.id !== id) return p;
      const safeUpdates = { ...updates };
      // Prevent bypassing authoritative actions
      delete safeUpdates.status;
      delete safeUpdates.aiAnalysis;
      delete safeUpdates.governmentReview;
      delete safeUpdates.invitations;
      
      return { ...p, ...safeUpdates };
    }));
  };

  const inviteUniversity = (problemId: string, universityIdPayload: any, messagePayload?: any) => {
    if (typeof problemId !== 'string' || typeof universityIdPayload !== 'string') return;
    const universityId = universityIdPayload.trim();
    const message = typeof messagePayload === 'string' ? messagePayload.trim() : undefined;

    setProblems(prev => prev.map(p => {
      if (p.id !== problemId) return p;
      if (p.status !== ProblemStatus.GOVERNMENT_VALIDATED) return p; // Must be GOVERNMENT_VALIDATED
      
      const university = universities.find(u => u.id === universityId);
      if (!university) return p;

      const existingInvitations = p.invitations || [];
      // Prevent duplicate invitations
      if (existingInvitations.some(i => i.universityId === universityId && (i.status === 'PENDING' || i.status === 'ACCEPTED'))) {
        return p;
      }
      
      const newInvitation: UniversityInvitation = {
        id: `INV-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        problemId,
        universityId,
        universityName: university.name,
        matchScore: 94, // Using demo score as requested
        status: 'PENDING',
        sentAt: new Date().toISOString(),
        message
      };

      return {
        ...p,
        // Status remains GOVERNMENT_VALIDATED
        invitations: [...existingInvitations, newInvitation]
      };
    }));
  };

  const acceptInvitation = (invitationIdPayload: any) => {
    if (typeof invitationIdPayload !== 'string') return;
    const invitationId = invitationIdPayload.trim();
    
    setProblems(prev => {
      // Find problem and invitation
      const problem = prev.find(p => p.invitations?.some(i => i.id === invitationId));
      if (!problem) return prev;
      
      const invitation = problem.invitations?.find(i => i.id === invitationId);
      if (!invitation || invitation.problemId !== problem.id) return prev;
      
      if (invitation.status !== 'PENDING') return prev;
      if (problem.status !== ProblemStatus.GOVERNMENT_VALIDATED) return prev;

      return prev.map(p => {
        if (p.id !== problem.id) return p;
        
        const updatedInvitations = (p.invitations || []).map(inv => {
          if (inv.id === invitationId) {
            return { ...inv, status: 'ACCEPTED' as const, respondedAt: new Date().toISOString() };
          }
          return inv;
        });
        
        return {
          ...p,
          status: ProblemStatus.UNIVERSITY_ACCEPTED,
          invitations: updatedInvitations
        };
      });
    });
  };

  const declineInvitation = (invitationIdPayload: any) => {
    if (typeof invitationIdPayload !== 'string') return;
    const invitationId = invitationIdPayload.trim();

    setProblems(prev => {
      // Find problem and invitation
      const problem = prev.find(p => p.invitations?.some(i => i.id === invitationId));
      if (!problem) return prev;
      
      const invitation = problem.invitations?.find(i => i.id === invitationId);
      if (!invitation || invitation.problemId !== problem.id) return prev;
      
      if (invitation.status !== 'PENDING') return prev;
      if (problem.status !== ProblemStatus.GOVERNMENT_VALIDATED) return prev;

      return prev.map(p => {
        if (p.id !== problem.id) return p;
        
        const updatedInvitations = (p.invitations || []).map(inv => {
          if (inv.id === invitationId) {
            return { ...inv, status: 'DECLINED' as const, respondedAt: new Date().toISOString() };
          }
          return inv;
        });
        
        return {
          ...p,
          invitations: updatedInvitations
        };
      });
    });
  };
  
  const createProject = (projectPayload: any) => {
    if (!projectPayload || typeof projectPayload !== 'object') return;
    
    const problemId = projectPayload.problemId;
    const universityId = projectPayload.universityId;
    if (typeof problemId !== 'string' || typeof universityId !== 'string') return;

    // Prevent duplicate project creation for the same problem
    if (projects.some(p => p.problemId === problemId)) return;

    // Verify invitation is ACCEPTED
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;
    
    // Status must be exactly UNIVERSITY_ACCEPTED
    if (problem.status !== ProblemStatus.UNIVERSITY_ACCEPTED) return;

    const invitation = problem.invitations?.find(i => i.universityId === universityId);
    if (!invitation || invitation.status !== 'ACCEPTED') return;

    const milestones = Array.isArray(projectPayload.milestones) ? projectPayload.milestones.map((m: any) => ({
      id: typeof m.id === 'string' ? m.id : `M-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      projectId: typeof m.projectId === 'string' ? m.projectId : '',
      title: typeof m.title === 'string' ? m.title : '',
      description: typeof m.description === 'string' ? m.description : '',
      status: typeof m.status === 'string' ? m.status : 'PENDING',
      responsibleGroup: typeof m.responsibleGroup === 'string' ? m.responsibleGroup : '',
      completionPercentage: typeof m.completionPercentage === 'number' ? m.completionPercentage : 0
    })) : [];

    const newProject: Project = {
      id: typeof projectPayload.id === 'string' && projectPayload.id.trim() ? projectPayload.id.trim() : `PROJ-${Date.now()}`,
      problemId: problemId.trim(),
      universityId: universityId.trim(),
      title: typeof projectPayload.title === 'string' ? projectPayload.title.trim() : 'New Project',
      objective: typeof projectPayload.objective === 'string' ? projectPayload.objective.trim() : '',
      status: ProjectStatus.PROJECT_CREATED,
      progress: 0,
      milestones: milestones
    };

    setProjects(prev => [newProject, ...prev]);
  };
  
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const safeUpdates = { ...updates };
      // Prevent bypassing authoritative actions
      delete safeUpdates.status;
      delete safeUpdates.progress;
      delete safeUpdates.deployment;
      delete safeUpdates.impactMetrics;
      delete safeUpdates.milestones;
      delete safeUpdates.collaborations;
      delete safeUpdates.teamId;
      delete safeUpdates.industryPartnerId;
      delete safeUpdates.universityId;
      delete safeUpdates.problemId;
      
      return { ...p, ...safeUpdates };
    }));
  };
  
  const createTeam = (projectIdPayload: any, teamPayload: any) => {
    if (!teamPayload || typeof teamPayload !== 'object') return;
    if (typeof projectIdPayload !== 'string') return;
    const projectId = projectIdPayload.trim();

    setProjects(prev => {
      const project = prev.find(p => p.id === projectId);
      if (!project || project.teamId) return prev; // Prevent duplicate team creation for the same project
      
      const newTeam: StudentTeam = {
        id: typeof teamPayload.id === 'string' && teamPayload.id.trim() ? teamPayload.id.trim() : `TEAM-${Date.now()}`,
        name: typeof teamPayload.name === 'string' ? teamPayload.name.trim() : 'New Team',
        universityId: project.universityId,
        members: Array.isArray(teamPayload.members) ? teamPayload.members.map((s: any) => ({
          id: typeof s.id === 'string' ? s.id.trim() : `STU-${Math.random()}`,
          name: typeof s.name === 'string' ? s.name.trim() : 'Unknown',
          role: typeof s.role === 'string' ? s.role.trim() : 'Member',
          skills: Array.isArray(s.skills) ? s.skills.filter((sk: any) => typeof sk === 'string').map((sk: string) => sk.trim()) : []
        })) : [],
        expertise: Array.isArray(teamPayload.expertise) ? teamPayload.expertise.filter((e: any) => typeof e === 'string').map((e: string) => e.trim()) : []
      };

      setTeams(prevTeams => [newTeam, ...prevTeams]);
      
      return prev.map(p => p.id === projectId ? { ...p, teamId: newTeam.id } : p);
    });
  };
  
  const joinIndustry = (projectIdPayload: any, partnerIdPayload: any) => {
    if (typeof projectIdPayload !== 'string' || typeof partnerIdPayload !== 'string') return;
    const projectId = projectIdPayload.trim();
    const partnerId = partnerIdPayload.trim();

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      // Check valid states
      if (p.status !== ProjectStatus.PROJECT_CREATED && p.status !== ProjectStatus.IN_PROGRESS && p.status !== ProjectStatus.INDUSTRY_JOINED) return p;

      // Duplicate guard
      if (p.industryPartnerId === partnerId || p.collaborations?.some(c => c.partnerId === partnerId)) return p;
      
      const partner = industryPartners.find(i => i.id === partnerId);
      if (!partner) return p;
      
      const newCollab = {
        projectId,
        partnerId,
        status: 'JOINED' as const,
        joinedAt: new Date().toISOString(),
        contribution: partner.contribution
      };
      
      const collabs = p.collaborations || [];
      
      return {
        ...p,
        industryPartnerId: partnerId,
        status: p.status === ProjectStatus.PROJECT_CREATED ? ProjectStatus.INDUSTRY_JOINED : p.status,
        collaborations: [...collabs, newCollab]
      };
    }));
  };
  
  const updateMilestone = (projectIdPayload: any, milestoneIdPayload: any, updates: Partial<Milestone>) => {
    if (typeof projectIdPayload !== 'string' || typeof milestoneIdPayload !== 'string') return;
    if (!updates || typeof updates !== 'object') return;
    
    const projectId = projectIdPayload.trim();
    const milestoneId = milestoneIdPayload.trim();

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      // Enforce lifecycle: cannot start or complete milestones unless INDUSTRY_JOINED, IN_PROGRESS or READY_FOR_DEPLOYMENT
      if (p.status === ProjectStatus.PROJECT_CREATED) {
          return p; // Reject milestone update if industry hasn't joined yet
      }

      const safeUpdates: Partial<Milestone> = {};
      if (typeof updates.status === 'string' && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(updates.status)) {
         safeUpdates.status = updates.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      }
      if (typeof updates.completionPercentage === 'number') {
         safeUpdates.completionPercentage = Math.max(0, Math.min(100, updates.completionPercentage));
      }

      // Sequential milestone completion guard
      if (safeUpdates.status === 'COMPLETED') {
        const targetIndex = p.milestones.findIndex(m => m.id === milestoneId);
        if (targetIndex > 0) {
            const previousMilestones = p.milestones.slice(0, targetIndex);
            const allPreviousCompleted = previousMilestones.every(m => m.status === 'COMPLETED');
            if (!allPreviousCompleted) {
                // Reject invalid completion
                return p;
            }
        }
      }

      const updatedMilestones = p.milestones.map(m => 
        m.id === milestoneId ? { ...m, ...safeUpdates } : m
      );
      
      // Calculate progress based on completed milestones
      const completedCount = updatedMilestones.filter(m => m.status === 'COMPLETED').length;
      const totalMilestones = updatedMilestones.length || 1;
      const progress = Math.round((completedCount / totalMilestones) * 100);
      
      let newStatus = p.status;
      
      // IN_PROGRESS start when a milestone completes if it was just INDUSTRY_JOINED
      if (p.status === ProjectStatus.INDUSTRY_JOINED) {
        if (updatedMilestones.some(m => m.status === 'COMPLETED' || m.status === 'IN_PROGRESS')) {
            newStatus = ProjectStatus.IN_PROGRESS;
        }
      }

      const tempProject = { ...p, milestones: updatedMilestones, status: newStatus };
      if (tempProject.status === ProjectStatus.IN_PROGRESS && isProjectReadyForDeployment(tempProject as any)) {
          newStatus = ProjectStatus.READY_FOR_DEPLOYMENT;
      }

      return {
        ...p,
        progress,
        status: newStatus,
        milestones: updatedMilestones
      };
    }));
  };

  const deployProject = (projectIdPayload: any) => {
    if (typeof projectIdPayload !== 'string') return;
    const projectId = projectIdPayload.trim();

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      // Deployment readiness guard
      if (p.status !== ProjectStatus.READY_FOR_DEPLOYMENT) {
        return p;
      }
      
      if (p.status === ProjectStatus.DEPLOYED) {
        return p;
      }
      
      if (!isProjectReadyForDeployment(p as any)) {
        return p;
      }

      const updatedMilestones = p.milestones.map(m => 
        m.title === 'Deployment' ? { ...m, status: 'COMPLETED' as const, completionPercentage: 100 } : m
      );

      // Create impact metrics for demo
      const impactMetrics = Object.freeze({
        projectId,
        peopleImpacted: 850,
        incidentsBefore: 12,
        incidentsAfter: 5,
        responseTimeBefore: 120,
        responseTimeAfter: 45,
        costSavings: 4.8,
        deploymentCoverage: '3 locations',
        satisfactionScore: 82,
        measurementPeriod: '3 months',
        isDemoData: true
      });

      const deployment = Object.freeze({
        id: `DEP-${Date.now()}`,
        projectId,
        deploymentStatus: 'LIVE' as const,
        deploymentDate: new Date().toISOString(),
        location: 'College Road, Ranchi',
        deploymentType: 'Community Deployment',
        technology: 'Smart Water-Level Sensors + Drainage Monitoring',
        governmentVerified: true
      });
      
      return {
        ...p,
        progress: 100,
        status: ProjectStatus.DEPLOYED,
        milestones: updatedMilestones,
        deployment,
        impactMetrics
      };
    }));
  };

  return (
    <AppContext.Provider value={{ 
      role, setRole, 
      problems, addProblem, updateProblem, analyzeProblem, submitToGovernment, validateProblem, rejectProblem, requestClarification,
      universities, inviteUniversity, acceptInvitation, declineInvitation,
      projects, createProject, updateProject,
      teams, createTeam,
      industryPartners, joinIndustry,
      updateMilestone,
      deployProject,
      runDemo,
      resetDemo
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

