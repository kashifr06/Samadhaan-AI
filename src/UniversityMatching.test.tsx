import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ProblemStatus, ProjectStatus } from './types';
import { MemoryRouter } from 'react-router-dom';

function TestComponent({ onMount }: { onMount: (context: any) => void }) {
  const context = useAppContext();
  React.useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return null;
}

describe('Phase 3 - University Matching Adversarial Tests', () => {
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

  const setupProblem = (id: string, status: ProblemStatus) => {
    act(() => { ctx.addProblem({ id, title: 'T', description: 'D', category: 'C', location: 'L' }); });
    if (status === ProblemStatus.SUBMITTED) return;
    
    act(() => { ctx.analyzeProblem(id); });
    if (status === ProblemStatus.AI_ANALYZED) return;
    
    act(() => { ctx.submitToGovernment(id); });
    if (status === ProblemStatus.PENDING_GOVERNMENT) return;
    
    act(() => { ctx.validateProblem(id, 'Valid'); });
    if (status === ProblemStatus.GOVERNMENT_VALIDATED) return;
  };

  it('1-3. Matching gate: reject invite before GOVERNMENT_VALIDATED', () => {
    setupProblem('P-SUB', ProblemStatus.SUBMITTED);
    setupProblem('P-AI', ProblemStatus.AI_ANALYZED);
    setupProblem('P-PEND', ProblemStatus.PENDING_GOVERNMENT);

    act(() => { ctx.inviteUniversity('P-SUB', 'UNI-001', 'msg'); });
    act(() => { ctx.inviteUniversity('P-AI', 'UNI-001', 'msg'); });
    act(() => { ctx.inviteUniversity('P-PEND', 'UNI-001', 'msg'); });

    expect(ctx.problems.find((p: any) => p.id === 'P-SUB').invitations).toBeUndefined();
    expect(ctx.problems.find((p: any) => p.id === 'P-AI').invitations).toBeUndefined();
    expect(ctx.problems.find((p: any) => p.id === 'P-PEND').invitations).toBeUndefined();
  });

  it('4. Valid invitation creation', () => {
    setupProblem('P-VAL', ProblemStatus.GOVERNMENT_VALIDATED);
    
    act(() => { ctx.inviteUniversity('P-VAL', 'UNI-001', 'Please help'); });
    
    const p = ctx.problems.find((p: any) => p.id === 'P-VAL');
    expect(p.invitations.length).toBe(1);
    expect(p.invitations[0].status).toBe('PENDING');
    expect(p.invitations[0].universityId).toBe('UNI-001');
    expect(p.invitations[0].message).toBe('Please help');
  });

  it('6. Duplicate invitation protection', () => {
    setupProblem('P-DUP', ProblemStatus.GOVERNMENT_VALIDATED);
    
    act(() => { ctx.inviteUniversity('P-DUP', 'UNI-001', 'msg 1'); });
    act(() => { ctx.inviteUniversity('P-DUP', 'UNI-001', 'msg 2'); }); // duplicate
    
    const p = ctx.problems.find((p: any) => p.id === 'P-DUP');
    expect(p.invitations.length).toBe(1);
    expect(p.invitations[0].message).toBe('msg 1');
  });

  it('8. Accept invitation atomic transition', () => {
    setupProblem('P-ACC', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.inviteUniversity('P-ACC', 'UNI-001', 'msg'); });
    
    const p = ctx.problems.find((p: any) => p.id === 'P-ACC');
    const invId = p.invitations[0].id;
    
    act(() => { ctx.acceptInvitation(invId); });
    
    const updatedP = ctx.problems.find((p: any) => p.id === 'P-ACC');
    expect(updatedP.status).toBe(ProblemStatus.UNIVERSITY_ACCEPTED);
    expect(updatedP.invitations[0].status).toBe('ACCEPTED');
  });

  it('9. Decline invitation transition', () => {
    setupProblem('P-DEC', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.inviteUniversity('P-DEC', 'UNI-001', 'msg'); });
    
    const p = ctx.problems.find((p: any) => p.id === 'P-DEC');
    const invId = p.invitations[0].id;
    
    act(() => { ctx.declineInvitation(invId); });
    
    const updatedP = ctx.problems.find((p: any) => p.id === 'P-DEC');
    expect(updatedP.status).toBe(ProblemStatus.GOVERNMENT_VALIDATED); // Status does not change
    expect(updatedP.invitations[0].status).toBe('DECLINED');
  });

  it('12. University ID Integrity (fake university)', () => {
    setupProblem('P-FAKE', ProblemStatus.GOVERNMENT_VALIDATED);
    
    act(() => { ctx.inviteUniversity('P-FAKE', 'FAKE-UNI-999', 'msg'); });
    
    const p = ctx.problems.find((p: any) => p.id === 'P-FAKE');
    // Should reject creating invitation for nonexistent university
    expect(p.invitations).toBeUndefined();
  });

  it('14. Project Creation Gate (reject before acceptance)', () => {
    setupProblem('P-PROJ', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.inviteUniversity('P-PROJ', 'UNI-001', 'msg'); });
    
    act(() => { 
      ctx.createProject({ problemId: 'P-PROJ', universityId: 'UNI-001' }); 
    });
    
    expect(ctx.projects.find((p: any) => p.problemId === 'P-PROJ')).toBeUndefined();
  });

  it('15. Project Creation Success', () => {
    setupProblem('P-PROJ-S', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.inviteUniversity('P-PROJ-S', 'UNI-001', 'msg'); });
    const p = ctx.problems.find((p: any) => p.id === 'P-PROJ-S');
    act(() => { ctx.acceptInvitation(p.invitations[0].id); });
    
    act(() => { 
      ctx.createProject({ problemId: 'P-PROJ-S', universityId: 'UNI-001', title: 'New Proj' }); 
    });
    
    const proj = ctx.projects.find((p: any) => p.problemId === 'P-PROJ-S');
    expect(proj).toBeDefined();
    expect(proj.title).toBe('New Proj');
  });

  it('16. Duplicate project creation prevented', () => {
    setupProblem('P-DUP-PROJ', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.inviteUniversity('P-DUP-PROJ', 'UNI-001', 'msg'); });
    const p = ctx.problems.find((p: any) => p.id === 'P-DUP-PROJ');
    act(() => { ctx.acceptInvitation(p.invitations[0].id); });
    
    act(() => { ctx.createProject({ id: 'PRJ-1', problemId: 'P-DUP-PROJ', universityId: 'UNI-001' }); });
    act(() => { ctx.createProject({ id: 'PRJ-2', problemId: 'P-DUP-PROJ', universityId: 'UNI-001' }); });
    
    const projs = ctx.projects.filter((p: any) => p.problemId === 'P-DUP-PROJ');
    expect(projs.length).toBe(1); // Only 1 project created
  });

  it('17. Accept invalid invitation IDs', () => {
    setupProblem('P-INV', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.acceptInvitation('NON_EXISTENT'); });
    act(() => { ctx.acceptInvitation(null); });
    act(() => { ctx.acceptInvitation(undefined); });
    act(() => { ctx.acceptInvitation({ id: 'hacked' }); });

    const p = ctx.problems.find((p: any) => p.id === 'P-INV');
    expect(p.status).toBe(ProblemStatus.GOVERNMENT_VALIDATED); // State unchanged
  });
  
  it('18. Decline invalid invitation IDs', () => {
    setupProblem('P-INV2', ProblemStatus.GOVERNMENT_VALIDATED);
    act(() => { ctx.declineInvitation('NON_EXISTENT'); });
    act(() => { ctx.declineInvitation(null); });
    act(() => { ctx.declineInvitation(undefined); });
    act(() => { ctx.declineInvitation({ id: 'hacked' }); });
    
    const p = ctx.problems.find((p: any) => p.id === 'P-INV2');
    expect(p.status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
  });
});
