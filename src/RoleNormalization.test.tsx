import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { getRoleLabel, normalizeUserRole, Role } from './types';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { CitizenHome } from './pages/CitizenHome';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { UniversityOpportunities } from './pages/UniversityOpportunities';
import { IndustryOpportunities } from './pages/IndustryOpportunities';

afterEach(() => {
  cleanup();
});

function RoleSetter({ role }: { role: Role }) {
  const ctx = useAppContext();
  React.useEffect(() => {
    ctx.setRole(role);
  }, [ctx, role]);
  return null;
}

function TestRouter({ role }: { role: Role }) {
  return (
    <MemoryRouter>
      <AppProvider>
        <RoleSetter role={role} />
        <Routes>
          <Route path="/" element={<Shell />}>
            {role === 'CITIZEN' && <Route index element={<CitizenHome />} />}
            {role === 'GOVERNMENT' && <Route index element={<GovernmentDashboard />} />}
            {role === 'UNIVERSITY' && <Route index element={<UniversityOpportunities />} />}
            {role === 'INDUSTRY' && <Route index element={<IndustryOpportunities />} />}
          </Route>
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

describe('canonical role normalization', () => {
  it.each([
    ['CITIZEN', 'Citizen', 'Report a real-world problem'],
    ['GOVERNMENT', 'Government', 'GOV'],
    ['UNIVERSITY', 'University', 'University Opportunities'],
    ['INDUSTRY', 'Industry', 'Industry Opportunities'],
  ] as const)('%s renders the %s UI and display label', async (role, label, visibleText) => {
    await act(async () => {
      render(<TestRouter role={role} />);
    });

    expect(document.body.textContent).toContain(visibleText);
    expect(screen.getByText(`${label} Access`)).toBeTruthy();
    expect(getRoleLabel(role)).toBe(label);
  });

  it('rejects unknown roles safely', () => {
    expect(normalizeUserRole('CITIZEN')).toBe('CITIZEN');
    expect(normalizeUserRole('Citizen')).toBe('CITIZEN');
    expect(normalizeUserRole('admin')).toBeNull();
    expect(normalizeUserRole(undefined)).toBeNull();
  });
});
