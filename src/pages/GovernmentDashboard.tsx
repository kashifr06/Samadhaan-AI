import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ProblemStatus, ProjectStatus, canEnterUniversityMatching } from '../types';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, ArrowRight } from 'lucide-react';

export function GovernmentDashboard() {
  const { problems, projects } = useAppContext();
  const navigate = useNavigate();

  const pendingProblems = problems.filter(p => p.status === ProblemStatus.PENDING_GOVERNMENT);
  const validatedProblems = problems.filter(p => p.status === ProblemStatus.GOVERNMENT_VALIDATED);
  const clarifiedProblems = problems.filter(p => p.status === ProblemStatus.CLARIFICATION_REQUESTED);
  const rejectedProblems = problems.filter(p => p.status === ProblemStatus.REJECTED);
  
  const deployedProjects = projects.filter(p => p.status === ProjectStatus.DEPLOYED);
  const activeProjectsCount = projects.length - deployedProjects.length;

  return (
    <div className="grid grid-cols-12 gap-6 content-start max-w-none">
      <section className="col-span-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-200">SAMADHAAN <span className="text-blue-400">GOV</span> PANEL</h1>
          <p className="text-slate-400 text-sm">Reviewing civic problems for official university & industry matching.</p>
        </div>
      </section>

      <section className="col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass px-4 py-3 rounded-xl border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Validated Problems</p>
            <p className="text-2xl font-bold text-slate-200">{validatedProblems.length}</p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-cyan-500/20">
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Active Projects</p>
            <p className="text-2xl font-bold text-slate-200">{activeProjectsCount}</p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-green-500/20 bg-green-500/5">
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Solutions Deployed</p>
            <p className="text-2xl font-bold text-green-400">{deployedProjects.length}</p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-orange-500/20">
            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">People Impacted</p>
            <p className="text-2xl font-bold text-slate-200">
              {deployedProjects.reduce((acc, p) => acc + (p.impactMetrics?.peopleBenefited || 0), 0)}
            </p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-purple-500/20 hidden md:block">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Estimated Savings</p>
            <p className="text-2xl font-bold text-slate-200">
              ₹{deployedProjects.reduce((acc, p) => acc + (p.impactMetrics?.costSaved || 0), 0)}
            </p>
          </div>
      </section>

      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="glass rounded-2xl overflow-hidden border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-wide text-slate-200">PROBLEMS REQUIRING VALIDATION</h3>
            <div className="flex gap-2">
              <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-1 rounded font-bold border border-orange-500/20">
                {pendingProblems.filter(p => p.aiAnalysis?.priority === 'HIGH').length} High Priority
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] uppercase text-slate-500 bg-slate-900/20 font-bold">
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3">Problem Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">AI Confidence</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendingProblems.map((problem) => (
                  <tr key={problem.id} className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span>{problem.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{problem.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[11px] border",
                        problem.category.includes('Water') ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                        problem.category.includes('Waste') ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        {problem.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-cyan-400">
                      {problem.aiAnalysis?.confidence}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          problem.aiAnalysis?.priority === 'HIGH' ? "bg-orange-500" :
                          problem.aiAnalysis?.priority === 'MEDIUM' ? "bg-blue-400" : "bg-slate-400"
                        )}></span>
                        {problem.aiAnalysis?.priority || 'UNRATED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/validation/${problem.id}`)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                
                {pendingProblems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      No problems pending validation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingProblems.length > 0 && (
            <div className="p-4 bg-slate-900/50 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors">
              View All {pendingProblems.length} Pending Cases
            </div>
          )}
        </div>

        {/* RECENTLY VALIDATED SECTION */}
        {(validatedProblems.length > 0 || clarifiedProblems.length > 0 || rejectedProblems.length > 0) && (
          <div className="glass rounded-2xl overflow-hidden border-slate-800">
             <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-bold text-sm tracking-wide text-slate-200">RECENTLY REVIEWED PROBLEMS</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] uppercase text-slate-500 bg-slate-900/20 font-bold">
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3">Problem Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[...validatedProblems, ...clarifiedProblems, ...rejectedProblems].map((problem) => (
                    <tr key={problem.id} className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {problem.title}
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[11px] text-slate-400">
                          {problem.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            problem.aiAnalysis?.priority === 'HIGH' ? "bg-orange-500" :
                            problem.aiAnalysis?.priority === 'MEDIUM' ? "bg-blue-400" : "bg-slate-400"
                          )}></span>
                          {problem.aiAnalysis?.priority || 'UNRATED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-cyan-400">
                         {problem.status === ProblemStatus.GOVERNMENT_VALIDATED && (
                          <span className="flex items-center gap-1.5 text-green-400 text-[11px] font-bold tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> VALIDATED
                          </span>
                        )}
                        {problem.status === ProblemStatus.CLARIFICATION_REQUESTED && (
                          <span className="flex items-center gap-1.5 text-yellow-500 text-[11px] font-bold tracking-wider">
                            <HelpCircle className="w-3 h-3" /> CLARIFICATION
                          </span>
                        )}
                        {problem.status === ProblemStatus.REJECTED && (
                          <span className="flex items-center gap-1.5 text-red-500 text-[11px] font-bold tracking-wider">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canEnterUniversityMatching(problem) ? (
                          <button 
                            onClick={() => navigate(`/matching/${problem.id}`)}
                            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-cyan-600/20"
                          >
                            Find Matches
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate(`/validation/${problem.id}`)}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* RECENTLY DEPLOYED SOLUTIONS */}
        {deployedProjects.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden border-green-500/20">
             <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-bold text-sm tracking-wide text-green-400">RECENTLY DEPLOYED SOLUTIONS</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] uppercase text-slate-500 bg-slate-900/20 font-bold">
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3">Project Title</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Impact</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {deployedProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {project.title}
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-400">
                        {project.deployment?.location || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-[10px] font-bold">
                          {project.impactMetrics?.peopleImpacted} Impacted
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          View Impact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-2xl border-cyan">
          <h4 className="text-cyan-400 font-bold text-xs uppercase mb-4 tracking-widest">AI Intelligence Insight</h4>
          <div className="space-y-4">
            <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
              <p className="text-xs text-slate-300 mb-2 font-medium italic">
                "AI has detected a cluster of similar reports regarding waterlogging in Jharkhand Sector 4. Recommending immediate infrastructure audit."
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-cyan-500 font-bold uppercase">Auto-Grouping Active</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-500">Required Expertise Matched</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">Hydrology</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">Civ. Engineering</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">GIS Mapping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-slate-800">
          <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-widest">Process Overview</h4>
          <div className="relative space-y-4 pl-6 border-l border-slate-800">
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-500/10"></div>
              <p className="text-[11px] font-bold leading-none text-slate-200">01 Report Filed</p>
              <p className="text-[9px] text-slate-500">Citizen input received</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-500/10"></div>
              <p className="text-[11px] font-bold leading-none text-slate-200">02 AI Analysis</p>
              <p className="text-[9px] text-slate-500">Insights & matching ready</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-blue-600 rounded-full -ml-1 border-2 border-[#0B0E14]"></div>
              <p className="text-[11px] font-bold leading-none text-blue-400">03 GOVT VALIDATION</p>
              <p className="text-[9px] text-blue-400/70">Current Stage: Manual Check</p>
            </div>
            <div className="relative opacity-40">
              <div className="absolute -left-[31px] top-0.5 w-2 h-2 bg-slate-700 rounded-full"></div>
              <p className="text-[11px] font-bold leading-none text-slate-200">04 Expertise Match</p>
              <p className="text-[9px] text-slate-500">University Outreach</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
