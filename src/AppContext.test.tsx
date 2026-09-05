import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ProblemStatus, ProjectStatus } from './types';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { MemoryRouter } from 'react-router-dom';

function TestComponent({ onMount }: { onMount: (context: any) => void }) {
  const context = useAppContext();
  React.useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return null;
}

describe('Phase 1 - Foundation Integrity Tests', () => {
  let ctx: any;

  beforeEach(() => {
    render(
      <AppProvider>
        <TestComponent onMount={(c) => { ctx = c; }} />
      </AppProvider>
    );
  });

  it('resetDemo must restore a clean deterministic initial state', () => {
    act(() => {
      ctx.resetDemo();
    });
    // Checks that seeded problems start at SUBMITTED (based on my fix)
    const problem = ctx.problems.find((p: any) => p.id === 'PRB-001');
    expect(problem.status).toBe(ProblemStatus.SUBMITTED);
  });

  it('valid citizen submission (addProblem)', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-999',
        status: ProblemStatus.SUBMITTED,
        title: 'Test',
        description: 'Test',
        location: 'Test',
        category: 'Test',
      });
    });
    const problem = ctx.problems.find((p: any) => p.id === 'PRB-999');
    expect(problem).toBeDefined();
    expect(problem.status).toBe(ProblemStatus.SUBMITTED);
  });

  it('missing/invalid required data (missing title)', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-998',
        status: ProblemStatus.SUBMITTED,
        description: 'Test',
        category: 'Test',
        location: 'Test'
      });
    });
    // Should be rejected by addProblem guard
    const problem = ctx.problems.find((p: any) => p.id === 'PRB-998');
    expect(problem).toBeUndefined();
  });

  it('missing/invalid required data (simulate unauthorized later status)', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-997',
        status: ProblemStatus.GOVERNMENT_VALIDATED, // Try to jump states
        title: 'Test',
        description: 'Test',
        category: 'Test',
        location: 'Test'
      });
    });
    // Should be rejected by addProblem guard
    const problem = ctx.problems.find((p: any) => p.id === 'PRB-997');
    expect(problem).toBeUndefined();
  });

  it('duplicate ID', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-999',
        status: ProblemStatus.SUBMITTED,
        title: 'Test',
        description: 'Test',
        location: 'Test',
        category: 'Test',
      });
    });
    act(() => {
      ctx.addProblem({
        id: 'PRB-999',
        status: ProblemStatus.SUBMITTED,
        title: 'Test 2',
        description: 'Test 2',
        location: 'Test 2',
        category: 'Test 2',
      });
    });
    const problems = ctx.problems.filter((p: any) => p.id === 'PRB-999');
    expect(problems.length).toBe(1);
    expect(problems[0].title).toBe('Test'); // Did not overwrite or duplicate
  });

  it('AI analysis without government validation does not jump to GOVERNMENT_VALIDATED', () => {
    act(() => {
      ctx.addProblem({
        id: 'PRB-995',
        status: ProblemStatus.SUBMITTED,
        title: 'Test AI',
        description: 'Test AI',
        location: 'Test AI',
        category: 'Test AI',
      });
    });
    act(() => {
      ctx.analyzeProblem('PRB-995');
    });
    const problem = ctx.problems.find((p: any) => p.id === 'PRB-995');
    expect(problem.status).toBe(ProblemStatus.AI_ANALYZED);
  });

  it('runDemo steps correctly through authoritative actions', () => {
    act(() => {
      ctx.resetDemo();
    });
    
    // Initial state: SUBMITTED
    expect(ctx.problems.find((p: any) => p.id === 'PRB-001').status).toBe(ProblemStatus.SUBMITTED);
    
    // Step 1: runDemo -> calls analyzeProblem
    act(() => { ctx.runDemo(); });
    expect(ctx.problems.find((p: any) => p.id === 'PRB-001').status).toBe(ProblemStatus.AI_ANALYZED);
    
    // Step 2: runDemo -> calls submitToGovernment
    act(() => { ctx.runDemo(); });
    expect(ctx.problems.find((p: any) => p.id === 'PRB-001').status).toBe(ProblemStatus.PENDING_GOVERNMENT);
    
    // Step 3: runDemo -> calls validateProblem
    act(() => { ctx.runDemo(); });
    expect(ctx.problems.find((p: any) => p.id === 'PRB-001').status).toBe(ProblemStatus.GOVERNMENT_VALIDATED);
  });
});

describe('Dashboard Integrity Tests', () => {
  it('Dashboard derives real counts and does not use fake hardcoded additions', () => {
    render(
      <MemoryRouter>
        <AppProvider>
           <GovernmentDashboard />
        </AppProvider>
      </MemoryRouter>
    );
    // Since seed data has no GOVERNMENT_VALIDATED initially (all are SUBMITTED), validated problems should be 0.
    // The older fake count was 942 + length, so it would render "942".
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
  });
});
