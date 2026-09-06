import { FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import { ProjectStatus, ProblemStatus, normalizeUserRole } from '../types';

export const handleAction = async (db: any, ai: GoogleGenAI, action: string, payload: any, user: any) => {
  const safeWrite = async (collection: string, id: string, data: any) => {
    await db.collection(`samadhaan_${collection}`).doc(id).set(data, { merge: true });
  };
  const getDoc = async (collection: string, id: string) => {
    const doc = await db.collection(`samadhaan_${collection}`).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  };
  
  // Role authorization
  const userRecord = await getDoc('users', user.uid);
  const role = normalizeUserRole(userRecord?.role) || 'CITIZEN';
  const entityId = userRecord?.entityId || user.uid; // e.g. universityId or partnerId

  if (action === 'addProblem') {
    if (role !== 'CITIZEN') throw new Error('Unauthorized');
    if (!payload.id || typeof payload.id !== 'string') throw new Error('Invalid ID');
    const existing = await getDoc('problems', payload.id);
    if (existing) throw new Error('Duplicate ID');
    if (payload.status && payload.status !== ProblemStatus.SUBMITTED) throw new Error('Invalid status');

    const title = String(payload.title || '').trim();
    const description = String(payload.description || '').trim();
    const category = String(payload.category || '').trim();
    const location = String(payload.location || '').trim();
    
    if (!title) throw new Error('Missing title');
    if (!description) throw new Error('Missing description');
    if (!category) throw new Error('Missing category');
    if (!location) throw new Error('Missing location');

    const newProblem = {
        status: ProblemStatus.SUBMITTED,
        title,
        description,
        category,
        location,
        submittedBy: user.uid,
        submittedAt: payload.submittedAt || new Date().toISOString(),
    };
    await safeWrite('problems', payload.id, newProblem);
    return { success: true };
  }

  if (action === 'updateProblem') {
    if (role !== 'CITIZEN') throw new Error('Unauthorized');
    const p = await getDoc('problems', payload.id);
    if (!p) throw new Error('Not found');
    if (p.submittedBy !== user.uid) throw new Error('Unauthorized'); // Must own problem
    if (p.status !== ProblemStatus.SUBMITTED && p.status !== ProblemStatus.CLARIFICATION_REQUESTED) throw new Error('Invalid state');

    const safeUpdates = { ...payload.updates };
    delete safeUpdates.status;
    delete safeUpdates.aiAnalysis;
    delete safeUpdates.governmentReview;
    delete safeUpdates.invitations;
    await safeWrite('problems', p.id, safeUpdates);
    return { success: true };
  }

  if (action === 'analyzeProblem') {
    // Only citizen who owns it, or maybe anyone for demo? Let's say CITIZEN who owns it.
    const p = await getDoc('problems', payload.id);
    if (!p) throw new Error('Not found');
    if (role === 'CITIZEN' && p.submittedBy !== user.uid) throw new Error('Unauthorized');
    if (p.status !== ProblemStatus.SUBMITTED && p.status !== ProblemStatus.CLARIFICATION_REQUESTED) throw new Error('Invalid state');
    
    let analysisData: any = {};
    try {
        const prompt = `Analyze the following problem:
        Title: ${p.title}
        Description: ${p.description}`;
        
        // Use Gemini schema structured output
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        category: { type: 'STRING' },
                        subCategory: { type: 'STRING' },
                        priority: { type: 'STRING', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        confidence: { type: 'NUMBER' },
                        summary: { type: 'STRING' },
                        duplicateCheck: { type: 'BOOLEAN' },
                        suggestedExpertise: { type: 'ARRAY', items: { type: 'STRING' } }
                    },
                    required: ['category', 'subCategory', 'priority', 'confidence', 'summary', 'duplicateCheck', 'suggestedExpertise']
                }
            }
        });
        
        const text = response.text || '{}';
        analysisData = JSON.parse(text);
        
        // Validate structured output
        if (typeof analysisData.category !== 'string') analysisData.category = 'General';
        if (typeof analysisData.subCategory !== 'string') analysisData.subCategory = 'General';
        if (typeof analysisData.summary !== 'string') analysisData.summary = '';
        if (typeof analysisData.duplicateCheck !== 'boolean') analysisData.duplicateCheck = false;
        if (!Array.isArray(analysisData.suggestedExpertise)) analysisData.suggestedExpertise = [];
        
        if (typeof analysisData.confidence !== 'number' || 
            !isFinite(analysisData.confidence) || 
            analysisData.confidence < 0 || 
            analysisData.confidence > 100) {
            throw new Error('Invalid confidence score');
        }
        
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        if (!validPriorities.includes(analysisData.priority)) {
            throw new Error('Invalid priority');
        }
        
    } catch (e) {
        // Fallback for demo
        analysisData = {
            category: p.category || 'General',
            subCategory: 'Assessed',
            priority: 'MEDIUM',
            confidence: 60,
            summary: 'Fallback analysis due to error.',
            duplicateCheck: false,
            suggestedExpertise: ['General'],
            isFallback: true
        };
    }

    await safeWrite('problems', p.id, {
        status: ProblemStatus.AI_ANALYZED,
        aiAnalysis: analysisData
    });
    return { success: true };
  }

  if (action === 'submitToGovernment') {
    const p = await getDoc('problems', payload.id);
    if (!p) throw new Error('Not found');
    if (role === 'CITIZEN' && p.submittedBy !== user.uid) throw new Error('Unauthorized');
    if (p.status !== ProblemStatus.AI_ANALYZED) throw new Error('Invalid state');
    await safeWrite('problems', p.id, { status: ProblemStatus.PENDING_GOVERNMENT });
    return { success: true };
  }

  if (action === 'validateProblem') {
    if (role !== 'GOVERNMENT') throw new Error('Unauthorized');
    const p = await getDoc('problems', payload.id);
    if (!p || p.status !== ProblemStatus.PENDING_GOVERNMENT) throw new Error('Invalid state');
    await safeWrite('problems', p.id, {
        status: ProblemStatus.GOVERNMENT_VALIDATED,
        governmentReview: { status: 'APPROVED', comments: String(payload.comments || ''), reviewedAt: new Date().toISOString() }
    });
    return { success: true };
  }

  if (action === 'rejectProblem') {
    if (role !== 'GOVERNMENT') throw new Error('Unauthorized');
    const p = await getDoc('problems', payload.id);
    if (!p || p.status !== ProblemStatus.PENDING_GOVERNMENT) throw new Error('Invalid state');
    await safeWrite('problems', p.id, {
        status: ProblemStatus.REJECTED,
        governmentReview: { status: 'REJECTED', rejectionReason: String(payload.reason || ''), reviewedAt: new Date().toISOString() }
    });
    return { success: true };
  }

  if (action === 'requestClarification') {
    if (role !== 'GOVERNMENT') throw new Error('Unauthorized');
    const p = await getDoc('problems', payload.id);
    if (!p || p.status !== ProblemStatus.PENDING_GOVERNMENT) throw new Error('Invalid state');
    await safeWrite('problems', p.id, {
        status: ProblemStatus.CLARIFICATION_REQUESTED,
        governmentReview: { status: 'REQUEST_INFO', comments: String(payload.comments || ''), reviewedAt: new Date().toISOString() }
    });
    return { success: true };
  }

  if (action === 'inviteUniversity') {
    if (role !== 'GOVERNMENT') throw new Error('Unauthorized');
    const p = await getDoc('problems', payload.problemId);
    if (!p || p.status !== ProblemStatus.GOVERNMENT_VALIDATED) throw new Error('Invalid state');
    
    // Verify university exists
    const u = await getDoc('universities', payload.universityId);
    if (!u) throw new Error('Invalid university ID');
    
    // Reject duplicate
    const invitations = p.invitations || [];
    if (invitations.some((i: any) => i.universityId === payload.universityId && (i.status === 'PENDING' || i.status === 'ACCEPTED'))) {
        throw new Error('Duplicate invitation');
    }

    const newInvitation = {
        id: `INV-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        problemId: p.id,
        universityId: payload.universityId,
        universityName: u.name,
        matchScore: u.matchScore || 85, // derived from university record if applicable
        status: 'PENDING',
        sentAt: new Date().toISOString(),
        message: String(payload.message || '').trim()
    };
    await safeWrite('problems', p.id, {
        status: ProblemStatus.GOVERNMENT_VALIDATED, // Preserve status
        invitations: FieldValue.arrayUnion(newInvitation)
    });
    return { success: true, invitationId: newInvitation.id };
  }

  if (action === 'acceptInvitation') {
    if (role !== 'UNIVERSITY') throw new Error('Unauthorized');
    
    // We only have invitationId locally. Find the problem.
    const problemsDocs = await db.collection('samadhaan_problems').get();
    let targetProblem = null;
    let invIndex = -1;
    for (const doc of problemsDocs.docs) {
        const pData = doc.data();
        if (pData.invitations) {
            invIndex = pData.invitations.findIndex((i: any) => i.id === payload.invitationId);
            if (invIndex !== -1) {
                targetProblem = { id: doc.id, ...pData };
                break;
            }
        }
    }
    
    if (!targetProblem) throw new Error('Invalid invite');
    if (targetProblem.status !== ProblemStatus.GOVERNMENT_VALIDATED) throw new Error('Invalid state');
    
    const invitations = targetProblem.invitations || [];
    if (invitations[invIndex].status !== 'PENDING') throw new Error('Invalid invite');
    
    // Ensure university identity matches
    if (invitations[invIndex].universityId !== entityId) throw new Error('Unauthorized for this invitation');

    invitations[invIndex].status = 'ACCEPTED';
    invitations[invIndex].respondedAt = new Date().toISOString();
    
    await safeWrite('problems', targetProblem.id, {
        status: ProblemStatus.UNIVERSITY_ACCEPTED,
        invitations
    });
    return { success: true };
  }

  if (action === 'declineInvitation') {
    if (role !== 'UNIVERSITY') throw new Error('Unauthorized');
    
    const problemsDocs = await db.collection('samadhaan_problems').get();
    let targetProblem = null;
    let invIndex = -1;
    for (const doc of problemsDocs.docs) {
        const pData = doc.data();
        if (pData.invitations) {
            invIndex = pData.invitations.findIndex((i: any) => i.id === payload.invitationId);
            if (invIndex !== -1) {
                targetProblem = { id: doc.id, ...pData };
                break;
            }
        }
    }
    
    if (!targetProblem) throw new Error('Invalid invite');
    if (targetProblem.status !== ProblemStatus.GOVERNMENT_VALIDATED) throw new Error('Invalid state');
    
    const invitations = targetProblem.invitations || [];
    if (invitations[invIndex].status !== 'PENDING') throw new Error('Invalid invite');
    
    // Ensure university identity matches
    if (invitations[invIndex].universityId !== entityId) throw new Error('Unauthorized for this invitation');

    invitations[invIndex].status = 'DECLINED';
    invitations[invIndex].respondedAt = new Date().toISOString();
    
    await safeWrite('problems', targetProblem.id, { invitations });
    return { success: true };
  }

  if (action === 'createProject') {
    if (role !== 'UNIVERSITY') throw new Error('Unauthorized');
    
    const p = await getDoc('problems', payload.problemId);
    if (!p || p.status !== ProblemStatus.UNIVERSITY_ACCEPTED) throw new Error('Invalid problem state');
    
    // Verify accepted invitation
    const invitations = p.invitations || [];
    const hasAccepted = invitations.some((i: any) => i.status === 'ACCEPTED' && i.universityId === entityId);
    if (!hasAccepted) throw new Error('No accepted invitation found');
    
    // Ensure university matches payload
    if (payload.universityId !== entityId) throw new Error('Unauthorized university payload');

    // Duplicate project check
    const existingProjects = await db.collection('samadhaan_projects').where('problemId', '==', p.id).get();
    if (!existingProjects.empty) throw new Error('Duplicate project for problem');

    const projectId = payload.id || `PROJ-${Date.now()}`;
    const safeProject = {
        problemId: p.id,
        universityId: entityId,
        title: String(payload.title || '').trim(),
        objective: String(payload.objective || '').trim(),
        status: ProjectStatus.PROJECT_CREATED,
        progress: 0,
        milestones: Array.isArray(payload.milestones) ? payload.milestones.map((m: any) => ({
            id: m.id,
            title: String(m.title),
            status: 'PENDING',
            completionPercentage: 0
        })) : [],
        createdAt: new Date().toISOString()
    };
    await safeWrite('projects', projectId, safeProject);
    return { success: true, projectId };
  }

  if (action === 'updateProject') {
    if (role !== 'UNIVERSITY' && role !== 'GOVERNMENT') throw new Error('Unauthorized'); // Just restrict
    const p = await getDoc('projects', payload.id);
    if (!p) throw new Error('Not found');
    if (role === 'UNIVERSITY' && p.universityId !== entityId) throw new Error('Unauthorized');
    
    const safeUpdates = { ...payload.updates };
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
    await safeWrite('projects', payload.id, safeUpdates);
    return { success: true };
  }

  if (action === 'createTeam') {
    if (role !== 'UNIVERSITY') throw new Error('Unauthorized');
    const p = await getDoc('projects', payload.projectId);
    if (!p || p.teamId) throw new Error('Invalid project or team exists');
    if (p.universityId !== entityId) throw new Error('Unauthorized');

    const newTeam = {
        name: payload.team.name || 'New Team',
        universityId: entityId,
        members: Array.isArray(payload.team.members) ? payload.team.members : [],
        expertise: Array.isArray(payload.team.expertise) ? payload.team.expertise : []
    };
    const teamId = payload.team.id || `TEAM-${Date.now()}`;
    const batch = db.batch();
    batch.set(db.collection('samadhaan_teams').doc(teamId), newTeam, { merge: true });
    batch.set(db.collection('samadhaan_projects').doc(p.id), { teamId }, { merge: true });
    await batch.commit();
    return { success: true, teamId };
  }

  if (action === 'joinIndustry') {
    if (role !== 'INDUSTRY') throw new Error('Unauthorized');
    const p = await getDoc('projects', payload.projectId);
    if (!p || (p.status !== ProjectStatus.PROJECT_CREATED && p.status !== ProjectStatus.IN_PROGRESS && p.status !== ProjectStatus.INDUSTRY_JOINED)) {
      throw new Error('Invalid project state');
    }
    if (p.industryPartnerId) throw new Error('Already joined');
    if (payload.partnerId !== entityId) throw new Error('Unauthorized partner ID');
    
    const newCollab = {
        projectId: p.id,
        partnerId: entityId,
        status: 'JOINED',
        joinedAt: new Date().toISOString(),
        contribution: 'Financial & Mentorship'
    };
    await safeWrite('projects', p.id, {
        industryPartnerId: entityId,
        status: p.status === ProjectStatus.PROJECT_CREATED ? ProjectStatus.INDUSTRY_JOINED : p.status,
        collaborations: FieldValue.arrayUnion(newCollab)
    });
    return { success: true };
  }

  if (action === 'updateMilestone') {
    if (role !== 'UNIVERSITY') throw new Error('Unauthorized'); // Student teams normally, but University acts as proxy for now
    const p = await getDoc('projects', payload.projectId);
    if (!p || p.status === ProjectStatus.PROJECT_CREATED) throw new Error('Invalid state');
    if (p.universityId !== entityId) throw new Error('Unauthorized');

    let milestones = p.milestones || [];
    const targetIndex = milestones.findIndex((m: any) => m.id === payload.milestoneId);
    if (targetIndex === -1) throw new Error('Milestone not found');
    
    if (payload.updates.status === 'COMPLETED' && targetIndex > 0) {
        const previousMilestones = milestones.slice(0, targetIndex);
        const allPreviousCompleted = previousMilestones.every((m: any) => m.status === 'COMPLETED');
        if (!allPreviousCompleted) throw new Error('Previous milestones not completed');
    }
    
    milestones[targetIndex] = { ...milestones[targetIndex], ...payload.updates };
    const completedCount = milestones.filter((m: any) => m.status === 'COMPLETED').length;
    const progress = Math.round((completedCount / (milestones.length || 1)) * 100);
    
    let newStatus = p.status;
    if (p.status === ProjectStatus.INDUSTRY_JOINED && milestones.some((m: any) => m.status === 'COMPLETED' || m.status === 'IN_PROGRESS')) {
        newStatus = ProjectStatus.IN_PROGRESS;
    }
    
    const isReady = milestones.length > 0 && milestones.every((m: any) => m.title === 'Deployment' || m.status === 'COMPLETED');
    if (newStatus === ProjectStatus.IN_PROGRESS && isReady) {
        newStatus = ProjectStatus.READY_FOR_DEPLOYMENT;
    }
    
    await safeWrite('projects', p.id, { progress, status: newStatus, milestones });
    return { success: true };
  }

  if (action === 'deployProject') {
    if (role !== 'GOVERNMENT') throw new Error('Unauthorized');
    const p = await getDoc('projects', payload.projectId);
    if (!p || p.status !== ProjectStatus.READY_FOR_DEPLOYMENT) throw new Error('Invalid state');
    
    const updatedMilestones = p.milestones.map((m: any) => m.title === 'Deployment' ? { ...m, status: 'COMPLETED', completionPercentage: 100 } : m);
    
    const impactMetrics = {
        projectId: p.id,
        peopleImpacted: 850,
        incidentsBefore: 12,
        incidentsAfter: 5,
        costSavings: 4.8,
        isDemoData: true
    };
    
    const deployment = {
        id: `DEP-${Date.now()}`,
        projectId: p.id,
        deploymentStatus: 'LIVE',
        deploymentDate: new Date().toISOString(),
        governmentVerified: true
    };
    
    await safeWrite('projects', p.id, {
        progress: 100,
        status: ProjectStatus.DEPLOYED,
        milestones: updatedMilestones,
        deployment,
        impactMetrics
    });
    return { success: true };
  }

  throw new Error('Unknown action: ' + action);
};
