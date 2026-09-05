import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ProblemStatus, ProjectStatus } from './types';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

function TestComponent({ onMount }: { onMount: (context: any) => void }) {
  const context = useAppContext();
  React.useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return null;
}

describe('Phase 6 - Final Adversarial Certification', () => {
  let ctx: any;

  beforeEach(() => {
    render(
      <MemoryRouter>
        <AppProvider>
          <TestComponent onMount={(c) => { ctx = c; }} />
        </AppProvider>
      </MemoryRouter>
    );
  });

  const setupProject = (id: string, advanceTo: 'CREATED' | 'TEAM' | 'INDUSTRY' | 'PROGRESS' | 'READY' = 'CREATED') => {
    const probId = `PROB-${id}`;
    act(() => { ctx.addProblem({ id: probId, title: 'T', description: 'D', category: 'C', location: 'L', status: 'SUBMITTED' }); });
    act(() => { ctx.analyzeProblem(probId); });
    act(() => { ctx.submitToGovernment(probId); });
    act(() => { ctx.validateProblem(probId, 'Valid'); });
    act(() => { ctx.inviteUniversity(probId, 'UNI-001', 'MSG'); });
    
    const prob = ctx.problems.find((p: any) => p.id === probId);
    act(() => { ctx.acceptInvitation(prob.invitations[0].id); });
    
    act(() => { 
        ctx.createProject({ 
            id, 
            problemId: probId, 
            universityId: 'UNI-001', 
            title: 'T',
            objective: 'O',
            milestones: [
                {id: 'M1', title: 'Problem Validation', status: 'PENDING'}, 
                {id: 'M2', title: 'Field Survey', status: 'PENDING'},
                {id: 'M3', title: 'Solution Design', status: 'PENDING'},
                {id: 'M4', title: 'Prototype Development', status: 'PENDING'},
                {id: 'M5', title: 'Prototype Testing', status: 'PENDING'},
                {id: 'M6', title: 'Government Pilot', status: 'PENDING'},
            ]
        }); 
    });
    
    if (advanceTo === 'CREATED') return;
    
    act(() => { ctx.createTeam(id, { id: `TEAM-${id}`, name: 'Team', members: [] }); });
    if (advanceTo === 'TEAM') return;
    act(() => { ctx.joinIndustry(id, 'IND-001'); });
    if (advanceTo === 'INDUSTRY') return;
    
    act(() => { ctx.updateMilestone(id, 'M1', { status: 'COMPLETED' }); });
    if (advanceTo === 'PROGRESS') return;
    
    act(() => { ctx.updateMilestone(id, 'M2', { status: 'COMPLETED' }); });
    act(() => { ctx.updateMilestone(id, 'M3', { status: 'COMPLETED' }); });
    act(() => { ctx.updateMilestone(id, 'M4', { status: 'COMPLETED' }); });
    act(() => { ctx.updateMilestone(id, 'M5', { status: 'COMPLETED' }); });
    act(() => { ctx.updateMilestone(id, 'M6', { status: 'COMPLETED' }); });
  };

  it('1. updateProblem prevents bypassing authoritative actions', () => {
    act(() => { ctx.addProblem({ id: 'PRB-006', title: 'T', description: 'D', category: 'C', location: 'L' }); });
    act(() => { 
        ctx.updateProblem('PRB-006', { 
            status: 'DEPLOYED' as any,
            aiAnalysis: { category: 'Hacked' } as any,
            governmentReview: { status: 'APPROVED' } as any,
            invitations: [{ id: 'HACK', status: 'ACCEPTED' }] as any
        }); 
    });
    const p = ctx.problems.find((x:any) => x.id === 'PRB-006');
    expect(p.status).toBe(ProblemStatus.SUBMITTED);
    expect(p.aiAnalysis).toBeUndefined();
    expect(p.governmentReview).toBeUndefined();
    expect(p.invitations).toBeUndefined();
  });

  it('2. impossible problem state transitions are rejected', () => {
    act(() => { ctx.addProblem({ id: 'P2', title: 'T', description: 'D', category: 'C', location: 'L' }); });
    // SUBMITTED -> VALIDATED (invalid)
    act(() => { ctx.validateProblem('P2', 'Valid'); });
    expect(ctx.problems.find((x:any) => x.id === 'P2').status).toBe(ProblemStatus.SUBMITTED);

    act(() => { ctx.analyzeProblem('P2'); });
    // AI_ANALYZED -> VALIDATED (invalid)
    act(() => { ctx.validateProblem('P2', 'Valid'); });
    expect(ctx.problems.find((x:any) => x.id === 'P2').status).toBe(ProblemStatus.AI_ANALYZED);
  });

  it('3. rejectProblem only works from PENDING_GOVERNMENT', () => {
    act(() => { ctx.addProblem({ id: 'P3', title: 'T', description: 'D', category: 'C', location: 'L' }); });
    act(() => { ctx.rejectProblem('P3', 'No'); });
    expect(ctx.problems.find((x:any) => x.id === 'P3').status).toBe(ProblemStatus.SUBMITTED);
  });

  it('4. acceptInvitation requires valid problem and pending invite', () => {
    setupProject('P4'); // gets to project created, problem is UNIVERSITY_ACCEPTED
    const p = ctx.problems.find((x:any) => x.id === 'PROB-P4');
    act(() => { ctx.acceptInvitation(p.invitations[0].id); }); // Re-accepting should do nothing
    expect(ctx.problems.find((x:any) => x.id === 'PROB-P4').status).toBe(ProblemStatus.UNIVERSITY_ACCEPTED);
  });
  
  it('5. updateMilestone prevents completing out of order', () => {
    setupProject('P5', 'INDUSTRY');
    act(() => { ctx.updateMilestone('P5', 'M2', { status: 'COMPLETED' }); });
    // M1 is not complete, so M2 shouldn't complete
    const proj = ctx.projects.find((x:any) => x.id === 'P5');
    const m2 = proj.milestones.find((m:any) => m.id === 'M2');
    expect(m2.status).toBe('PENDING');
  });

  it('6. createTeam prevents duplicate team creation', () => {
    setupProject('P6', 'TEAM');
    const prevTeamsCount = ctx.teams.length;
    act(() => { ctx.createTeam('P6', { id: `TEAM-P6-2`, name: 'Team 2', members: [] }); });
    expect(ctx.teams.length).toBe(prevTeamsCount);
  });

  it('7. runDemo handles full journey without errors', () => {
    act(() => { ctx.resetDemo(); });
    // Execute multiple demo steps to reach completion
    for(let i=0; i<20; i++) {
        act(() => { ctx.runDemo(); });
    }
    const proj = ctx.projects.find((p:any) => p.problemId === 'PRB-001');
    expect(proj.status).toBe(ProjectStatus.DEPLOYED);
    expect(proj.deployment.governmentVerified).toBe(true);
  });
  
  it('8. malformed inputs do not crash context functions', () => {
    act(() => { ctx.addProblem(null); });
    act(() => { ctx.analyzeProblem(null as any); });
    act(() => { ctx.submitToGovernment({} as any); });
    act(() => { ctx.updateProblem('', undefined as any); });
    act(() => { ctx.createProject(null); });
    act(() => { ctx.deployProject(null); });
    expect(true).toBe(true); // Should not crash
  });
});
