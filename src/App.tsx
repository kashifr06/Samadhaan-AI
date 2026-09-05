/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Shell } from './components/Shell';
import { CitizenHome } from './pages/CitizenHome';
import { ReportProblem } from './pages/ReportProblem';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { MyReports } from './pages/MyReports';
import { GovernmentValidation } from './pages/GovernmentValidation';
import { UniversityMatching } from './pages/UniversityMatching';
import { UniversityOpportunities } from './pages/UniversityOpportunities';
import { IndustryOpportunities } from './pages/IndustryOpportunities';
import { ProjectList } from './pages/ProjectList';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { ImpactDashboard } from './pages/ImpactDashboard';

function RoleBasedRouter() {
  const { role } = useAppContext();
  
  if (role === 'Citizen') {
    return (
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<CitizenHome />} />
          <Route path="report" element={<ReportProblem />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="project/:id" element={<ProjectWorkspace />} />
          <Route path="impact" element={<ImpactDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }
  
  if (role === 'Government') {
    return (
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<GovernmentDashboard />} />
          <Route path="validation/:id" element={<GovernmentValidation />} />
          <Route path="matching/:id" element={<UniversityMatching />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="project/:id" element={<ProjectWorkspace />} />
          <Route path="impact" element={<ImpactDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  if (role === 'University') {
    return (
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<UniversityOpportunities />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="project/:id" element={<ProjectWorkspace />} />
          <Route path="impact" element={<ImpactDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  if (role === 'Industry') {
    return (
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<IndustryOpportunities />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="project/:id" element={<ProjectWorkspace />} />
          <Route path="impact" element={<ImpactDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={<Shell />}>
        <Route index element={<div className="p-8 text-center text-slate-400 font-bold text-sm uppercase tracking-widest mt-20">Not implemented for {role} role yet.</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RoleBasedRouter />
      </BrowserRouter>
    </AppProvider>
  );
}
