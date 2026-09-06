import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Briefcase, Building2, GraduationCap, Users, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProblemStatus, ProjectStatus } from '../types';

export function ProjectList() {
  const { projects, problems, universities, industryPartners, teams, role } = useAppContext();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'READY_FOR_DEPLOYMENT' | 'DEPLOYED'>('ALL');

  // For Demo, filter if University or Industry
  let displayProjects = projects;
  if (role === 'UNIVERSITY') {
    displayProjects = projects.filter(p => p.universityId === 'UNI-001');
  } else if (role === 'INDUSTRY') {
    displayProjects = projects;
  }
  
  if (filter !== 'ALL') {
    displayProjects = displayProjects.filter(p => p.status === filter);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Oversight</h1>
          <p className="text-sm text-slate-400">Track and manage active civic innovation projects.</p>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          {(['ALL', 'IN_PROGRESS', 'READY_FOR_DEPLOYMENT', 'DEPLOYED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-colors",
                filter === f ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {displayProjects.map(project => {
          const problem = problems.find(p => p.id === project.problemId);
          const university = universities.find(u => u.id === project.universityId);
          const industry = industryPartners.find(i => i.id === project.industryPartnerId);
          const team = teams.find(t => t.id === project.teamId);
          
          return (
            <div key={project.id} className="glass p-6 rounded-2xl border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row gap-6 relative overflow-hidden">
              {project.status === ProjectStatus.DEPLOYED && (
                 <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              )}
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-slate-500 font-mono font-bold tracking-widest">{project.id}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {problem?.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 leading-tight">{project.title}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{university?.name || 'Unknown University'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{team?.name || 'No Team Assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className={!industry ? "text-slate-500 italic" : "text-cyan-400"}>
                        {industry?.name || 'No Industry Partner'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#0B0E14] border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-3">
                      <span className={cn(
                        "text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border",
                        project.status === ProjectStatus.DEPLOYED ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        project.status === ProjectStatus.READY_FOR_DEPLOYMENT ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        {project.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-cyan-400 font-bold text-sm">{project.progress}%</span>
                    </div>
                    
                    {project.status === ProjectStatus.DEPLOYED && project.impactMetrics && (
                      <div className="mt-2 pt-3 border-t border-slate-800 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                           <Target className="w-3 h-3 text-green-400" /> Impact Generated
                         </span>
                         <span className="text-sm font-bold text-white">{project.impactMetrics.peopleImpacted} People</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end md:w-32 shrink-0">
                <button 
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-lg transition-colors border border-slate-700"
                >
                  View Project
                </button>
              </div>
            </div>
          );
        })}

        {displayProjects.length === 0 && (
          <div className="glass p-12 rounded-2xl border-slate-800 text-center">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-2">No Active Projects</h3>
            <p className="text-slate-500 text-sm">There are no projects matching this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
