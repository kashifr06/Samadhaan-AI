import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ProjectStatus } from './types';
import { MemoryRouter } from 'react-router-dom';

function TestComponent({ onMount }: { onMount: (context: any) => void }) {
  const context = useAppContext();
  React.useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return null;
}

describe('Phase 5 - Deployment & Impact Hardening', () => {
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

  it('1. deployProject fails from PROJECT_CREATED', () => {
    setupProject('P1', 'CREATED');
    act(() => { ctx.deployProject('P1'); });
    const p = ctx.projects.find((x:any) => x.id === 'P1');
    expect(p.status).toBe(ProjectStatus.PROJECT_CREATED);
    expect(p.deployment).toBeUndefined();
  });

  it('2. deployProject fails from INDUSTRY_JOINED', () => {
    setupProject('P2', 'INDUSTRY');
    act(() => { ctx.deployProject('P2'); });
    const p = ctx.projects.find((x:any) => x.id === 'P2');
    expect(p.status).toBe(ProjectStatus.INDUSTRY_JOINED);
    expect(p.deployment).toBeUndefined();
  });

  it('3. deployProject fails from IN_PROGRESS', () => {
    setupProject('P3', 'PROGRESS');
    act(() => { ctx.deployProject('P3'); });
    const p = ctx.projects.find((x:any) => x.id === 'P3');
    expect(p.status).toBe(ProjectStatus.IN_PROGRESS);
    expect(p.deployment).toBeUndefined();
  });

  it('4. deployProject ignores invalid arguments', () => {
    setupProject('P4', 'READY');
    act(() => { ctx.deployProject({ id: 'P4' }); });
    act(() => { ctx.deployProject(null); });
    act(() => { ctx.deployProject(''); });
    const p = ctx.projects.find((x:any) => x.id === 'P4');
    expect(p.status).toBe(ProjectStatus.READY_FOR_DEPLOYMENT);
  });

  it('5. updateProject strips deployment payload injection', () => {
    setupProject('P5', 'CREATED');
    act(() => { 
      ctx.updateProject('P5', { 
        status: ProjectStatus.READY_FOR_DEPLOYMENT,
        progress: 100,
        deployment: { deploymentStatus: 'LIVE', governmentVerified: true },
        impactMetrics: { peopleImpacted: 999999 }
      } as any); 
    });
    const p = ctx.projects.find((x:any) => x.id === 'P5');
    expect(p.status).toBe(ProjectStatus.PROJECT_CREATED);
    expect(p.deployment).toBeUndefined();
    expect(p.impactMetrics).toBeUndefined();
  });

  it('6. deployProject atomic failure on fake project ID', () => {
    setupProject('P6', 'READY');
    act(() => { ctx.deployProject('FAKE-ID'); });
    const p = ctx.projects.find((x:any) => x.id === 'P6');
    expect(p.status).toBe(ProjectStatus.READY_FOR_DEPLOYMENT);
  });

  it('7. deployment object integrity check', () => {
    setupProject('P7', 'READY');
    act(() => { ctx.deployProject('P7'); });
    const p = ctx.projects.find((x:any) => x.id === 'P7');
    expect(p.status).toBe(ProjectStatus.DEPLOYED);
    expect(p.deployment.projectId).toBe('P7');
    expect(p.deployment.governmentVerified).toBe(true);
    expect(p.impactMetrics).toBeDefined();
    expect(p.impactMetrics.projectId).toBe('P7');
    expect(p.impactMetrics.isDemoData).toBe(true);
  });

  it('8. multiple deployments fail (idempotency)', () => {
    setupProject('P8', 'READY');
    act(() => { ctx.deployProject('P8'); });
    const p = ctx.projects.find((x:any) => x.id === 'P8');
    const firstDeploymentId = p.deployment.id;
    
    // Attempt duplicate
    act(() => { ctx.deployProject('P8'); });
    const pAfter = ctx.projects.find((x:any) => x.id === 'P8');
    expect(pAfter.deployment.id).toBe(firstDeploymentId);
  });
  
  it('9. object-reference attack on deployment fails (strict mode frozen)', () => {
    setupProject('P9', 'READY');
    act(() => { ctx.deployProject('P9'); });
    
    let p = ctx.projects.find((x:any) => x.id === 'P9');
    // mutate the returned object - should fail or not affect the true state
    try {
        p.deployment.governmentVerified = false;
        p.deployment.projectId = 'HACKED';
        p.impactMetrics.peopleImpacted = 999999999;
    } catch (e) {
        // Expected in strict mode with frozen objects
    }
    
    // check if it affected the state array
    let pState = ctx.projects.find((x:any) => x.id === 'P9');
    expect(pState.deployment.governmentVerified).toBe(true);
    expect(pState.deployment.projectId).toBe('P9');
    expect(pState.impactMetrics.peopleImpacted).toBe(850);
  });

  it('10. resetDemo deep clears everything', () => {
    setupProject('P10', 'READY');
    act(() => { ctx.deployProject('P10'); });
    
    act(() => { ctx.resetDemo(); });
    
    expect(ctx.projects.length).toBe(0); // Because seededProjects is []
    expect(ctx.teams.length).toBe(0); // Because seededTeams is []
    expect(ctx.problems.length).toBeGreaterThan(0); // seededProblems
    // Check that problem PRB-P10 doesn't exist, and seeded PRB-001 is back to SUBMITTED
    const p10 = ctx.problems.find((x:any) => x.id === 'PROB-P10');
    expect(p10).toBeUndefined();
    const p001 = ctx.problems.find((x:any) => x.id === 'PRB-001');
    expect(p001.status).toBe('SUBMITTED');
  });

  it('11. Direct status bypass via addProblem fails', () => {
    act(() => { ctx.addProblem({ id: 'P11', title: 'T', description: 'D', category: 'C', location: 'L', status: 'DEPLOYED' }); });
    expect(ctx.problems.find((x:any) => x.id === 'P11')).toBeUndefined();
  });

  it('12. runDemo executes securely through domain actions', () => {
    act(() => { ctx.runDemo(); }); // Submit
    act(() => { ctx.runDemo(); }); // Analyze
    act(() => { ctx.runDemo(); }); // Submit Gov
    act(() => { ctx.runDemo(); }); // Validate
    act(() => { ctx.runDemo(); }); // Invite Uni
    act(() => { ctx.runDemo(); }); // Accept Uni
    act(() => { ctx.runDemo(); }); // Create Proj
    act(() => { ctx.runDemo(); }); // Create Team
    act(() => { ctx.runDemo(); }); // Join Ind
    // Complete milestones
    for(let i=0; i<6; i++) {
        act(() => { ctx.runDemo(); });
    }
    act(() => { ctx.runDemo(); }); // Deploy
    const proj = ctx.projects.find((p:any) => p.problemId === 'PRB-001');
    expect(proj.status).toBe(ProjectStatus.DEPLOYED);
    expect(proj.deployment.governmentVerified).toBe(true);
  });
});

