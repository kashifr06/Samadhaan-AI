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

describe('Phase 1.1 - Foundation Adversarial Tests', () => {
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

  it('2-7. Rejects missing, empty, or whitespace-only required fields', () => {
    const originalLength = ctx.problems.length;
    
    // Missing title
    act(() => { ctx.addProblem({ id: 'P-1', description: 'D', category: 'C', location: 'L' }); });
    // Empty title
    act(() => { ctx.addProblem({ id: 'P-2', title: '', description: 'D', category: 'C', location: 'L' }); });
    // Whitespace title
    act(() => { ctx.addProblem({ id: 'P-3', title: '   ', description: 'D', category: 'C', location: 'L' }); });
    // Missing description
    act(() => { ctx.addProblem({ id: 'P-4', title: 'T', category: 'C', location: 'L' }); });
    // Missing category
    act(() => { ctx.addProblem({ id: 'P-5', title: 'T', description: 'D', location: 'L' }); });
    // Missing location
    act(() => { ctx.addProblem({ id: 'P-6', title: 'T', description: 'D', category: 'C' }); });
    
    expect(ctx.problems.length).toBe(originalLength); // No partial mutations
  });

  it('8-10. Rejects null, undefined, or empty payload', () => {
    const originalLength = ctx.problems.length;
    
    act(() => { ctx.addProblem(null); });
    act(() => { ctx.addProblem(undefined); });
    act(() => { ctx.addProblem({}); });
    
    expect(ctx.problems.length).toBe(originalLength);
  });

  it('12-19. Rejects attempt to inject privileged workflow state', () => {
    const originalLength = ctx.problems.length;
    const forbiddenStates = [
      ProblemStatus.AI_ANALYZED,
      ProblemStatus.PENDING_GOVERNMENT,
      ProblemStatus.GOVERNMENT_VALIDATED,
      ProblemStatus.REJECTED,
      ProblemStatus.UNIVERSITY_ACCEPTED,
      ProjectStatus.PROJECT_CREATED,
      ProjectStatus.DEPLOYED
    ];
    
    forbiddenStates.forEach((state, i) => {
      act(() => {
        ctx.addProblem({
          id: `BAD-STATE-${i}`,
          title: 'T', description: 'D', category: 'C', location: 'L',
          status: state
        });
      });
    });
    
    expect(ctx.problems.length).toBe(originalLength);
  });

  it('20. Strips injected privileged fields (governmentReview, etc.)', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-PRIV',
        title: 'T', description: 'D', category: 'C', location: 'L',
        governmentReview: { status: 'APPROVED' },
        aiAnalysis: { confidence: 100 },
        invitations: [{ universityId: 'U-1' }]
      });
    });
    
    const p = ctx.problems.find((x: any) => x.id === 'PRB-PRIV');
    expect(p.governmentReview).toBeUndefined();
    expect(p.aiAnalysis).toBeUndefined();
    expect(p.invitations).toBeUndefined();
  });

  it('24. Prevents external mutation through object reference after addProblem', () => {
    const mutablePayload = {
      id: 'PRB-MUTABLE',
      title: 'T', description: 'D', category: 'C', location: 'L',
    };
    
    act(() => { ctx.addProblem(mutablePayload); });
    
    // Attempt mutation
    (mutablePayload as any).status = ProblemStatus.GOVERNMENT_VALIDATED;
    mutablePayload.title = 'Hacked';
    
    const p = ctx.problems.find((x: any) => x.id === 'PRB-MUTABLE');
    expect(p.status).toBe(ProblemStatus.SUBMITTED);
    expect(p.title).toBe('T');
  });

  it('analyzeProblem rejects nonexistent IDs and does not jump states', () => {
    const originalLength = ctx.problems.length;
    act(() => { ctx.analyzeProblem('NONEXISTENT_ID'); });
    expect(ctx.problems.length).toBe(originalLength);
  });

  it('analyzeProblem cannot directly produce GOVERNMENT_VALIDATED or jump states', () => {
    act(() => {
      ctx.addProblem({ id: 'P-ANALYZE', title: 'T', description: 'D', category: 'C', location: 'L' });
    });
    act(() => {
      ctx.analyzeProblem('P-ANALYZE', { status: ProblemStatus.GOVERNMENT_VALIDATED }); 
    });
    const p = ctx.problems.find((x: any) => x.id === 'P-ANALYZE');
    expect(p.status).toBe(ProblemStatus.AI_ANALYZED); // Should ignore the injected status payload
  });
});
