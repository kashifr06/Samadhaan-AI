import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Circle, ArrowRight, Building2, Users, FileText, CheckSquare, GraduationCap, MapPin, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProblemStatus, ProjectStatus, isProjectReadyForDeployment } from '../types';

export function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, problems, universities, industryPartners, teams, role, updateMilestone, createTeam, updateProject, deployProject } = useAppContext();
  const { isLoading } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'milestones' | 'impact'>('overview');
  const [milestoneDetail, setMilestoneDetail] = useState<string | null>(null);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);

  const project = projects.find(p => p.id === id);
  if (!project) {
    return <div className="p-12 text-center text-slate-400 font-bold uppercase">Project not found</div>;
  }

  const problem = problems.find(p => p.id === project.problemId);
  const university = universities.find(u => u.id === project.universityId);
  const industry = industryPartners.find(i => i.id === project.industryPartnerId);
  
  // Find or create demo team
  let team = teams.find(t => t.id === project.teamId);
  const hasTeam = !!team;

  const handleAddDemoTeam = () => {
    const newTeam = {
      id: `TEAM-${Date.now()}`,
      name: 'WaterSmart Solutions',
      universityId: project.universityId,
      members: [
        { id: '1', name: 'Aarav Sharma', discipline: 'Civil Engineering', role: 'Team Lead', demoData: true },
        { id: '2', name: 'Priya Singh', discipline: 'Environmental Engineering', role: 'Researcher', demoData: true },
        { id: '3', name: 'Rahul Kumar', discipline: 'IoT / Electronics', role: 'Hardware Dev', demoData: true },
        { id: '4', name: 'Ananya Verma', discipline: 'Urban Planning', role: 'Analyst', demoData: true },
      ],
      expertise: ['Civil Engineering', 'Environmental Engineering', 'IoT', 'Urban Planning']
    };
    createTeam(project.id, newTeam);
    setActiveTab('team');
  };

  const handleCompleteMilestone = (milestoneId: string) => {
    if (window.confirm("Mark this milestone as complete?")) {
      updateMilestone(project.id, milestoneId, { status: 'COMPLETED' });
      
      // Auto-start next milestone
      const mIdx = project.milestones.findIndex(m => m.id === milestoneId);
      if (mIdx >= 0 && mIdx < project.milestones.length - 1) {
        updateMilestone(project.id, project.milestones[mIdx + 1].id, { status: 'IN_PROGRESS' });
      }
      setMilestoneDetail(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 pb-20">
      {/* Header */}
      <div className="glass p-6 rounded-2xl border-slate-800 space-y-6 relative overflow-hidden">
        {project.status === ProjectStatus.DEPLOYED && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                Project Workspace
              </span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-widest">
                {project.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{project.title}</h1>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Status</span>
              <span className={cn(
                "text-sm font-bold px-3 py-1 rounded-lg border",
                project.status === ProjectStatus.DEPLOYED ? "text-green-400 bg-green-500/10 border-green-500/20" :
                project.status === ProjectStatus.READY_FOR_DEPLOYMENT ? "text-green-400 bg-green-500/10 border-green-500/20" :
                project.status === ProjectStatus.IN_PROGRESS ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                "text-slate-300 bg-slate-800 border-slate-700"
              )}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            
            {project.status === 'INDUSTRY_JOINED' as any && hasTeam && (
              <button 
                onClick={() => updateProject(project.id, { status: ProjectStatus.IN_PROGRESS })}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
              >
                Start Development
              </button>
            )}
          </div>
        </div>

        {/* High-level workflow viz */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
          <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Gov Validated</span>
          <ArrowRight className="w-3 h-3 text-slate-700" />
          <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Univ Accepted</span>
          <ArrowRight className="w-3 h-3 text-slate-700" />
          <span className={hasTeam ? "text-green-400 flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}><CheckCircle2 className="w-3 h-3" /> Team Formed</span>
          <ArrowRight className="w-3 h-3 text-slate-700" />
          <span className={industry ? "text-green-400 flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}><CheckCircle2 className="w-3 h-3" /> Industry Mentor</span>
          <ArrowRight className="w-3 h-3 text-slate-700" />
          <span className={project.status === ProjectStatus.DEPLOYED ? "text-green-400 flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}><Circle className="w-3 h-3" /> Deployment</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        {(['overview', 'team', 'milestones', 'impact'] as const).map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative",
              activeTab === t ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {t === 'impact' ? 'Deployment & Impact' : t}
            {activeTab === t && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="glass p-6 rounded-2xl border-slate-800 space-y-6">
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Project Objective</h3>
                  <p className="text-slate-200 leading-relaxed">{project.objective}</p>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Original Problem Statement</h3>
                  <div className="bg-[#0B0E14] border border-slate-800 p-4 rounded-xl flex items-start gap-4">
                    <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-300 italic mb-2">"{problem?.description}"</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {problem?.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">Expected Outcome</h3>
                  <p className="text-slate-300 text-sm">
                    Develop a practical solution that can address the core issues and support faster intervention in affected areas, ready for government pilot deployment.
                  </p>
                </div>
              </div>

              {industry && (
                <div className="glass p-6 rounded-2xl border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xs uppercase font-bold tracking-widest text-blue-400">Industry Collaboration</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Partner</p>
                      <p className="text-slate-200 font-bold">{industry.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Focus</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {industry.expertise.slice(0,3).map(e => (
                          <span key={e} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-blue-500/10">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Contribution</p>
                    <p className="text-sm text-slate-300">{industry.contribution}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="glass p-6 rounded-2xl border-slate-800 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">Student Team</h3>
                {hasTeam && <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Prototype / Demo Team</span>}
              </div>

              {!hasTeam ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-300 mb-2">Team Not Formed</h4>
                  <p className="text-sm text-slate-500 mb-6">The university has not assigned a student team to this project yet.</p>
                  {(role === 'University' || role === 'Government') && (
                    <button 
                      onClick={handleAddDemoTeam}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                    >
                      Form Student Team (Demo)
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-slate-200">{team?.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">From: {university?.name}</p>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">Required Expertise Covered</h5>
                    <div className="flex flex-wrap gap-2">
                      {team?.expertise.map(e => (
                        <span key={e} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold uppercase tracking-widest">{e}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Team Members</h5>
                    {team?.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-[#0B0E14] border border-slate-800 rounded-lg">
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.discipline}</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MILESTONES TAB */}
          {activeTab === 'milestones' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 glass p-6 rounded-2xl border-slate-800">
                <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-6">Project Roadmap</h3>
                
                <div className="relative space-y-4 pl-6 border-l border-slate-800">
                  {project.milestones.map((milestone, idx) => {
                    const isCompleted = milestone.status === 'COMPLETED';
                    const isInProgress = milestone.status === 'IN_PROGRESS';
                    const isPending = milestone.status === 'PENDING';
                    
                    return (
                      <div 
                        key={milestone.id} 
                        className={cn(
                          "relative cursor-pointer transition-colors p-3 -ml-3 rounded-lg hover:bg-white/[0.02]",
                          milestoneDetail === milestone.id && "bg-white/[0.05]"
                        )}
                        onClick={() => setMilestoneDetail(milestone.id)}
                      >
                        <div className={cn(
                          "absolute -left-[35px] top-4 w-4 h-4 rounded-full flex items-center justify-center border-2 bg-[#0B0E14]",
                          isCompleted ? "border-green-500 text-green-500" :
                          isInProgress ? "border-blue-500 text-blue-500 ring-4 ring-blue-500/20" :
                          "border-slate-700 text-slate-700"
                        )}>
                          {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isInProgress ? <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> : null}
                        </div>
                        <div className={cn(isPending && "opacity-50")}>
                          <p className={cn(
                            "text-[11px] font-bold uppercase tracking-widest mb-1",
                            isCompleted ? "text-green-400" : isInProgress ? "text-blue-400" : "text-slate-400"
                          )}>
                            Milestone {idx + 1}
                          </p>
                          <p className="text-sm font-bold text-slate-200">{milestone.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{milestone.responsibleGroup}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Detail Panel */}
              <div className="flex-1">
                {milestoneDetail ? (() => {
                  const m = project.milestones.find(x => x.id === milestoneDetail)!;
                  const idx = project.milestones.findIndex(x => x.id === milestoneDetail);
                  const nextM = project.milestones[idx + 1];

                  return (
                    <div className="glass p-6 rounded-2xl border-slate-700 sticky top-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{m.title}</h3>
                        <span className={cn(
                          "text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border",
                          m.status === 'COMPLETED' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          m.status === 'IN_PROGRESS' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Description</p>
                          <p className="text-sm text-slate-300">{m.description}</p>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Responsible</p>
                          <p className="text-sm text-slate-300 font-medium">{m.responsibleGroup}</p>
                        </div>
                        
                        {m.status === 'COMPLETED' && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Next Milestone</p>
                            <p className="text-sm text-slate-400">{nextM?.title || 'None (Project Complete)'}</p>
                          </div>
                        )}

                        {m.status === 'IN_PROGRESS' && (
                          <div className="pt-4 border-t border-slate-800">
                            <button 
                              onClick={() => handleCompleteMilestone(m.id)}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="glass p-6 rounded-2xl border-slate-800 flex items-center justify-center h-full min-h-[200px] text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Select a milestone<br/>to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IMPACT TAB */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              {project.status !== ProjectStatus.READY_FOR_DEPLOYMENT && project.status !== ProjectStatus.DEPLOYED && (
                <div className="glass p-12 rounded-2xl border-slate-800 text-center relative overflow-hidden">
                  <Target className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">Impact Tracking Locked</h3>
                  <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">Impact tracking and deployment metrics will become available once the solution is fully deployed.</p>
                  <span className="bg-slate-900 text-slate-500 text-[10px] px-3 py-1.5 rounded border border-slate-800 uppercase tracking-widest font-bold">
                    Not Available
                  </span>
                </div>
              )}

              {project.status === ProjectStatus.READY_FOR_DEPLOYMENT && !showDeployConfirm && (
                <div className="glass p-8 rounded-2xl border-green-500/20 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50"></div>
                  <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Ready for Deployment</h3>
                  <div className="flex justify-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-8">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400"/> Gov Pilot Completed</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400"/> Prototype Tested</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400"/> Solution Ready</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowDeployConfirm(true)}
                    className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                  >
                    Mark as Deployed
                  </button>
                </div>
              )}

              {showDeployConfirm && project.status === ProjectStatus.READY_FOR_DEPLOYMENT && (
                <div className="glass p-8 rounded-2xl border-orange-500/30 text-center relative">
                  <h3 className="text-2xl font-bold text-white mb-2">Deploy Solution?</h3>
                  <p className="text-slate-300 mb-8">Mark this project as deployed and begin impact tracking?</p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => setShowDeployConfirm(false)}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        deployProject(project.id);
                        setShowDeployConfirm(false);
                      }}
                      className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    >
                      Confirm Deployment
                    </button>
                  </div>
                </div>
              )}

              {project.status === ProjectStatus.DEPLOYED && project.deployment && project.impactMetrics && (
                <div className="space-y-6">
                  <div className="glass p-6 rounded-2xl border-green-500/30 bg-green-500/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                        <div>
                          <h3 className="text-xl font-bold text-white">Solution Deployed</h3>
                          <p className="text-sm text-green-400">{project.title}</p>
                        </div>
                      </div>
                      <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Prototype / Demo Data</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-green-500/10">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Deployment Location</p>
                        <p className="text-sm font-bold text-slate-200">{project.deployment.location}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Deployment Type</p>
                        <p className="text-sm font-bold text-slate-200">{project.deployment.deploymentType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Technology</p>
                        <p className="text-sm font-bold text-cyan-400">{project.deployment.technology}</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Impact Overview</h3>
                      <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Prototype / Demo Data</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-[#0B0E14] p-4 rounded-xl border border-slate-800 text-center">
                        <p className="text-3xl font-bold text-white mb-1">{project.impactMetrics.peopleImpacted}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">People Impacted</p>
                      </div>
                      <div className="bg-[#0B0E14] p-4 rounded-xl border border-slate-800 text-center">
                        <p className="text-3xl font-bold text-green-400 mb-1">{project.impactMetrics.incidentsAfter < project.impactMetrics.incidentsBefore ? Math.round(((project.impactMetrics.incidentsBefore - project.impactMetrics.incidentsAfter) / project.impactMetrics.incidentsBefore) * 100) : 0}%</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Incident Reduction</p>
                      </div>
                      <div className="bg-[#0B0E14] p-4 rounded-xl border border-slate-800 text-center">
                        <p className="text-3xl font-bold text-blue-400 mb-1">{project.impactMetrics.responseTimeAfter < project.impactMetrics.responseTimeBefore ? Math.round(((project.impactMetrics.responseTimeBefore - project.impactMetrics.responseTimeAfter) / project.impactMetrics.responseTimeBefore) * 100) : 0}%</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Faster Response</p>
                      </div>
                      <div className="bg-[#0B0E14] p-4 rounded-xl border border-slate-800 text-center">
                        <p className="text-3xl font-bold text-orange-400 mb-1">₹{project.impactMetrics.costSavings}L</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Annual Savings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0B0E14] p-5 rounded-xl border border-red-500/20 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30 rounded-t-xl"></div>
                        <h4 className="text-xs uppercase font-bold tracking-widest text-red-400 mb-4">Before Deployment</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Recurring waterlogging ({project.impactMetrics.incidentsBefore}/month)</li>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Delayed identification</li>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Manual reporting</li>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Slower response (~{project.impactMetrics.responseTimeBefore} min)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-[#0B0E14] p-5 rounded-xl border border-green-500/20 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/30 rounded-t-xl"></div>
                        <h4 className="text-xs uppercase font-bold tracking-widest text-green-400 mb-4">After Deployment</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Water-level monitoring ({project.impactMetrics.incidentsAfter}/month)</li>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Earlier detection</li>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Structured government response</li>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Faster intervention (~{project.impactMetrics.responseTimeAfter} min)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl border-slate-800">
            <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-widest">Project Health</h4>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-cyan-400">{project.progress}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Complete</span>
              </div>
              <div className="h-2 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">University</p>
                  <p className="text-slate-300 font-bold">{university?.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Industry Mentor</p>
                  {industry ? (
                    <p className="text-cyan-400 font-bold">{industry.name}</p>
                  ) : (
                    <p className="text-slate-500 italic">Not yet joined</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <h4 className="text-green-400 font-bold text-xs uppercase tracking-widest">Government Oversight</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-slate-200">✓ Validated</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Govt Note</p>
                <p className="text-xs text-slate-400 italic bg-[#0B0E14] p-3 rounded-lg border border-slate-800">
                  "Proceeding as high priority community project. Require regular milestone updates."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
