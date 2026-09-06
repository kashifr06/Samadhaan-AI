import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAction } from './actions';
import { ProblemStatus, ProjectStatus } from '../types';

describe('Backend Actions - Adversarial', () => {
  let memoryDb: any = {};
  
  beforeEach(() => {
    memoryDb = {
        'samadhaan_users': {
            'u-cit': { role: 'CITIZEN' },
            'u-gov': { role: 'GOVERNMENT' },
            'u-uni1': { role: 'UNIVERSITY', entityId: 'UNI-1' },
            'u-uni2': { role: 'UNIVERSITY', entityId: 'UNI-2' },
            'u-ind': { role: 'INDUSTRY', entityId: 'IND-1' },
        },
        'samadhaan_problems': {},
        'samadhaan_projects': {},
        'samadhaan_universities': {
            'UNI-1': { id: 'UNI-1', name: 'Valid Uni' }
        }
    };
  });

  const mockDb = {
    collection: (col: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: !!memoryDb[col]?.[id], id, data: () => memoryDb[col]?.[id] }),
        set: async (data: any, options: any) => { 
            if (!memoryDb[col]) memoryDb[col] = {};
            if (options?.merge) {
                memoryDb[col][id] = { ...memoryDb[col][id], ...data };
            } else {
                memoryDb[col][id] = data;
            }
        }
      }),
      where: (field: string, op: string, val: string) => ({
          get: async () => {
              const docs = Object.values(memoryDb[col] || {}).filter((d: any) => {
                  if (op === '==') return d[field] === val;
                  return false;
              });
              return { empty: docs.length === 0, docs: docs.map(d => ({ data: () => d })) };
          }
      }),
      get: async () => ({
          docs: Object.values(memoryDb[col] || {}).map((d: any) => ({ data: () => d, id: d.id }))
      })
    }),
    batch: () => ({
        set: (ref: any, data: any, options: any) => {},
        commit: async () => {}
    })
  };

  const mockAi: any = {
      models: {
          generateContent: async () => ({ text: JSON.stringify({ category: 'Test', priority: 'HIGH', confidence: 85 }) })
      }
  };

  const getCit = () => ({ uid: 'u-cit' });
  const getGov = () => ({ uid: 'u-gov' });
  const getUni1 = () => ({ uid: 'u-uni1' });
  const getUni2 = () => ({ uid: 'u-uni2' });

  it('1. unauthenticated actions rejected', async () => {
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p1' }, null)).rejects.toThrow();
  });

  it('2. Citizen cannot validate problem', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.PENDING_GOVERNMENT };
    await expect(handleAction(mockDb, mockAi, 'validateProblem', { id: 'p1' }, getCit())).rejects.toThrow('Unauthorized');
  });

  it('2b. client payload cannot elevate a citizen role', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.PENDING_GOVERNMENT };
    await expect(handleAction(mockDb, mockAi, 'validateProblem', { id: 'p1', role: 'GOVERNMENT' }, getCit())).rejects.toThrow('Unauthorized');
    expect(memoryDb['samadhaan_problems']['p1'].status).toBe(ProblemStatus.PENDING_GOVERNMENT);
  });

  it('3. Citizen cannot deploy project', async () => {
    memoryDb['samadhaan_projects']['proj1'] = { id: 'proj1', status: ProjectStatus.READY_FOR_DEPLOYMENT };
    await expect(handleAction(mockDb, mockAi, 'deployProject', { projectId: 'proj1' }, getCit())).rejects.toThrow('Unauthorized');
  });

  it('4. Government can validate valid pending problem', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.PENDING_GOVERNMENT };
    await handleAction(mockDb, mockAi, 'validateProblem', { id: 'p1' }, getGov());
    expect(memoryDb['samadhaan_problems']['p1'].status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
  });

  it('5. University identity cannot accept another university invitation', async () => {
    memoryDb['samadhaan_problems']['p1'] = { 
        id: 'p1', 
        status: ProblemStatus.GOVERNMENT_VALIDATED,
        invitations: [{ id: 'inv1', universityId: 'UNI-1', status: 'PENDING' }]
    };
    await expect(handleAction(mockDb, mockAi, 'acceptInvitation', { invitationId: 'inv1' }, getUni2())).rejects.toThrow('Unauthorized for this invitation');
  });

  it('6. fake university invitation rejected', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.GOVERNMENT_VALIDATED };
    await expect(handleAction(mockDb, mockAi, 'inviteUniversity', { problemId: 'p1', universityId: 'FAKE' }, getGov())).rejects.toThrow('Invalid university ID');
  });

  it('7. duplicate invitation rejected', async () => {
    memoryDb['samadhaan_problems']['p1'] = { 
        id: 'p1', status: ProblemStatus.GOVERNMENT_VALIDATED,
        invitations: [{ id: 'inv1', universityId: 'UNI-1', status: 'PENDING' }]
    };
    await expect(handleAction(mockDb, mockAi, 'inviteUniversity', { problemId: 'p1', universityId: 'UNI-1' }, getGov())).rejects.toThrow('Duplicate invitation');
  });

  it('8. project creation without accepted invitation rejected', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.UNIVERSITY_ACCEPTED, invitations: [] };
    await expect(handleAction(mockDb, mockAi, 'createProject', { problemId: 'p1', universityId: 'UNI-1' }, getUni1())).rejects.toThrow('No accepted invitation found');
  });

  it('9. project creation with fake university rejected', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.UNIVERSITY_ACCEPTED, 
        invitations: [{ status: 'ACCEPTED', universityId: 'UNI-1' }] };
    await expect(handleAction(mockDb, mockAi, 'createProject', { problemId: 'p1', universityId: 'FAKE' }, getUni1())).rejects.toThrow('Unauthorized university payload');
  });

  it('10. direct project status injection rejected', async () => {
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.UNIVERSITY_ACCEPTED, 
        invitations: [{ status: 'ACCEPTED', universityId: 'UNI-1' }] };
    
    await handleAction(mockDb, mockAi, 'createProject', { id: 'proj1', problemId: 'p1', universityId: 'UNI-1', status: 'DEPLOYED' }, getUni1());
    expect(memoryDb['samadhaan_projects']['proj1'].status).toBe(ProjectStatus.PROJECT_CREATED);
  });

  it('11. milestone completion out of order rejected', async () => {
    memoryDb['samadhaan_projects']['proj1'] = { 
        id: 'proj1', status: ProjectStatus.IN_PROGRESS, universityId: 'UNI-1',
        milestones: [{ id: 'm1', status: 'PENDING' }, { id: 'm2', status: 'PENDING' }]
    };
    await expect(handleAction(mockDb, mockAi, 'updateMilestone', { projectId: 'proj1', milestoneId: 'm2', updates: { status: 'COMPLETED' } }, getUni1()))
        .rejects.toThrow('Previous milestones not completed');
  });

  it('12. deployment before READY_FOR_DEPLOYMENT rejected', async () => {
    memoryDb['samadhaan_projects']['proj1'] = { id: 'proj1', status: ProjectStatus.IN_PROGRESS };
    await expect(handleAction(mockDb, mockAi, 'deployProject', { projectId: 'proj1' }, getGov())).rejects.toThrow('Invalid state');
  });

  it('13. malformed Gemini output handled safely', async () => {
    const badAi: any = { models: { generateContent: async () => { throw new Error('Network error'); } } };
    memoryDb['samadhaan_problems']['p1'] = { id: 'p1', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, badAi, 'analyzeProblem', { id: 'p1' }, getCit());
    expect(memoryDb['samadhaan_problems']['p1'].status).toBe(ProblemStatus.AI_ANALYZED);
    expect(memoryDb['samadhaan_problems']['p1'].aiAnalysis.isFallback).toBe(true);
  });

  it('14. addProblem rejects missing/whitespace fields', async () => {
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: '  ', description: 'desc', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing title');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: '   ', category: 'cat', location: 'loc' }, getCit())).rejects.toThrow('Missing description');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: '', location: 'loc' }, getCit())).rejects.toThrow('Missing category');
    await expect(handleAction(mockDb, mockAi, 'addProblem', { id: 'p2', title: 'title', description: 'desc', category: 'cat', location: '   \n ' }, getCit())).rejects.toThrow('Missing location');
  });

  it('15. Gemini strict validation (priority and confidence)', async () => {
    const badAiConf: any = { models: { generateContent: async () => ({ text: JSON.stringify({ category: 'Test', priority: 'HIGH', confidence: 150 }) }) } };
    memoryDb['samadhaan_problems']['p3'] = { id: 'p3', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, badAiConf, 'analyzeProblem', { id: 'p3' }, getCit());
    expect(memoryDb['samadhaan_problems']['p3'].aiAnalysis.isFallback).toBe(true);

    const badAiPri: any = { models: { generateContent: async () => ({ text: JSON.stringify({ category: 'Test', priority: 'SUPER_HIGH', confidence: 90 }) }) } };
    memoryDb['samadhaan_problems']['p4'] = { id: 'p4', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, badAiPri, 'analyzeProblem', { id: 'p4' }, getCit());
    expect(memoryDb['samadhaan_problems']['p4'].aiAnalysis.isFallback).toBe(true);
    
    const goodAi: any = { models: { generateContent: async () => ({ text: JSON.stringify({ category: 'Test', priority: 'HIGH', confidence: 90 }) }) } };
    memoryDb['samadhaan_problems']['p5'] = { id: 'p5', status: ProblemStatus.SUBMITTED, submittedBy: 'u-cit' };
    await handleAction(mockDb, goodAi, 'analyzeProblem', { id: 'p5' }, getCit());
    expect(memoryDb['samadhaan_problems']['p5'].aiAnalysis.isFallback).toBeUndefined();
    expect(memoryDb['samadhaan_problems']['p5'].aiAnalysis.confidence).toBe(90);
  });
});
