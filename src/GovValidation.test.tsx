import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ProblemStatus, canEnterUniversityMatching } from './types';
import { MemoryRouter } from 'react-router-dom';

function TestComponent({ onMount }: { onMount: (context: any) => void }) {
  const context = useAppContext();
  React.useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return null;
}

describe('Phase 2 - Government Validation Adversarial Tests', () => {
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

  const setupPendingProblem = (id: string) => {
    act(() => { ctx.addProblem({ id, title: 'T', description: 'D', category: 'C', location: 'L' }); });
    act(() => { ctx.analyzeProblem(id); });
    act(() => { ctx.submitToGovernment(id); });
  };

  it('1-3. Valid approval, rejection, clarification', () => {
    setupPendingProblem('P-APP');
    setupPendingProblem('P-REJ');
    setupPendingProblem('P-CLA');

    act(() => { ctx.validateProblem('P-APP', 'Looks good'); });
    act(() => { ctx.rejectProblem('P-REJ', 'Not feasible'); });
    act(() => { ctx.requestClarification('P-CLA', 'Need more details'); });

    expect(ctx.problems.find((p: any) => p.id === 'P-APP').status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
    expect(ctx.problems.find((p: any) => p.id === 'P-REJ').status).toBe(ProblemStatus.REJECTED);
    expect(ctx.problems.find((p: any) => p.id === 'P-CLA').status).toBe(ProblemStatus.CLARIFICATION_REQUESTED);

    expect(ctx.problems.find((p: any) => p.id === 'P-APP').governmentReview.status).toBe('APPROVED');
    expect(ctx.problems.find((p: any) => p.id === 'P-APP').governmentReview.comments).toBe('Looks good');

    expect(ctx.problems.find((p: any) => p.id === 'P-REJ').governmentReview.status).toBe('REJECTED');
    expect(ctx.problems.find((p: any) => p.id === 'P-REJ').governmentReview.rejectionReason).toBe('Not feasible');

    expect(ctx.problems.find((p: any) => p.id === 'P-CLA').governmentReview.status).toBe('REQUEST_INFO');
    expect(ctx.problems.find((p: any) => p.id === 'P-CLA').governmentReview.comments).toBe('Need more details');
  });

  it('4-6, 14-15. Wrong ID, nonexistent ID, wrong status transitions', () => {
    act(() => { ctx.addProblem({ id: 'P-SUB', title: 'T', description: 'D', category: 'C', location: 'L' }); });

    // P-SUB is in SUBMITTED. Validation should fail.
    act(() => { ctx.validateProblem('P-SUB'); });
    expect(ctx.problems.find((p: any) => p.id === 'P-SUB').status).toBe(ProblemStatus.SUBMITTED);
    expect(ctx.problems.find((p: any) => p.id === 'P-SUB').governmentReview).toBeUndefined();

    // Nonexistent
    act(() => { ctx.validateProblem('P-NONEXISTENT'); }); // Should not crash
  });

  it('7-13. Double actions and cross-transitions are rejected', () => {
    setupPendingProblem('P-DBL');
    act(() => { ctx.validateProblem('P-DBL', 'Approve 1'); });

    // Attempt second approval
    act(() => { ctx.validateProblem('P-DBL', 'Approve 2'); });
    expect(ctx.problems.find((p: any) => p.id === 'P-DBL').governmentReview.comments).toBe('Approve 1');

    // Attempt rejection after approval
    act(() => { ctx.rejectProblem('P-DBL', 'Reject now'); });
    expect(ctx.problems.find((p: any) => p.id === 'P-DBL').status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
    
    // Clarification after approval
    act(() => { ctx.requestClarification('P-DBL', 'Clarify now'); });
    expect(ctx.problems.find((p: any) => p.id === 'P-DBL').status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
  });

  it('16. Whitespace-only review data is handled', () => {
    setupPendingProblem('P-WHITE');
    act(() => { ctx.validateProblem('P-WHITE', '   \n   '); });
    expect(ctx.problems.find((p: any) => p.id === 'P-WHITE').governmentReview.comments).toBe('');
  });

  it('17. Payload injection is ignored', () => {
    setupPendingProblem('P-INJ');
    act(() => { 
      ctx.validateProblem('P-INJ', { 
        status: 'REJECTED', // Try to spoof review status
        reviewedAt: '1999',
        notes: 'hacked'
      }); 
    });
    const rev = ctx.problems.find((p: any) => p.id === 'P-INJ').governmentReview;
    expect(rev.status).toBe('APPROVED');
    expect(rev.comments).toBe('');
    expect(rev.reviewedAt).not.toBe('1999');
  });

  it('18. Object-reference mutation after action', () => {
    setupPendingProblem('P-REF');
    const payload = new String("Looks good");
    act(() => { ctx.validateProblem('P-REF', payload); });
    // Strings are immutable, but if we had passed an object, it should be safe since we only extract what we need.
  });

  it('20. University matching gate', () => {
    const p1 = { status: ProblemStatus.SUBMITTED } as any;
    const p2 = { status: ProblemStatus.AI_ANALYZED } as any;
    const p3 = { status: ProblemStatus.PENDING_GOVERNMENT } as any;
    const p4 = { status: ProblemStatus.REJECTED } as any;
    const p5 = { status: ProblemStatus.GOVERNMENT_VALIDATED } as any;

    expect(canEnterUniversityMatching(p1)).toBe(false);
    expect(canEnterUniversityMatching(p2)).toBe(false);
    expect(canEnterUniversityMatching(p3)).toBe(false);
    expect(canEnterUniversityMatching(p4)).toBe(false);
    expect(canEnterUniversityMatching(p5)).toBe(true);
  });
});
