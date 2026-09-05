import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, XCircle, Search, Mail, ExternalLink, GraduationCap } from 'lucide-react';
import { ProblemStatus, ProjectStatus, Project, Milestone } from '../types';

export function UniversityOpportunities() {
  const { problems, universities, acceptInvitation, declineInvitation, createProject, projects } = useAppContext();
  const navigate = useNavigate();
  
  const [actionModal, setActionModal] = useState<{ type: 'ACCEPT' | 'DECLINE', invitationId: string } | null>(null);

  // For prototype, simulate as BIT Mesra (UNI-001)
  const currentUniversityId = 'UNI-001';
  const university = universities.find(u => u.id === currentUniversityId);

  const invitations = problems.flatMap(p => 
    (p.invitations || [])
      .filter(inv => inv.universityId === currentUniversityId)
      .map(inv => ({ problem: p, invitation: inv }))
  );

  const pendingInvitations = invitations.filter(i => i.invitation.status === 'PENDING');
  const acceptedInvitations = invitations.filter(i => i.invitation.status === 'ACCEPTED');
  const declinedInvitations = invitations.filter(i => i.invitation.status === 'DECLINED');

  const handleAction = () => {
    if (actionModal) {
      if (actionModal.type === 'ACCEPT') {
        acceptInvitation(actionModal.invitationId);
      } else if (actionModal.type === 'DECLINE') {
        declineInvitation(actionModal.invitationId);
      }
      setActionModal(null);
    }
  };

  const handleCreateProject = (problem: any) => {
    const newProject: Project = {
      id: `SAM-${Math.floor(1000 + Math.random() * 9000)}`,
      problemId: problem.id,
      universityId: currentUniversityId,
      title: `${problem.category} Mitigation System`,
      objective: `Design and pilot a low-cost smart solution for ${problem.title.toLowerCase()}.`,
      status: ProjectStatus.PROJECT_CREATED,
      progress: 0,
      milestones: [
        {
          id: 'M1',
          projectId: 'TEMP', // will be overwritten, but we just use Project.id
          title: 'Problem Validation',
          description: 'Confirm on-ground details and metrics.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M2',
          projectId: 'TEMP',
          title: 'Field Survey',
          description: 'Conduct field observations and collect data.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M3',
          projectId: 'TEMP',
          title: 'Solution Design',
          description: 'Draft the technical architecture.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M4',
          projectId: 'TEMP',
          title: 'Prototype Development',
          description: 'Build initial prototype.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M5',
          projectId: 'TEMP',
          title: 'Prototype Testing',
          description: 'Test prototype under simulated conditions.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M6',
          projectId: 'TEMP',
          title: 'Government Pilot',
          description: 'Deploy pilot with government supervision.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        },
        {
          id: 'M7',
          projectId: 'TEMP',
          title: 'Deployment',
          description: 'Final full-scale deployment.',
          status: 'PENDING',
          responsibleGroup: 'Student Team',
          completionPercentage: 0
        }
      ]
    };
    
    // update milestone projectIds
    newProject.milestones = newProject.milestones.map(m => ({...m, projectId: newProject.id}));
    // first milestone is in progress
    newProject.milestones[0].status = 'IN_PROGRESS';
    
    createProject(newProject);
    navigate(`/project/${newProject.id}`);
  };

  const universityDeployedProjects = projects.filter(p => p.universityId === currentUniversityId && p.status === ProjectStatus.DEPLOYED);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">University Opportunities</h1>
          <p className="text-sm text-slate-400">Manage government invitations for {university?.name}.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-3 rounded-xl border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Active Projects</p>
            <p className="text-2xl font-bold text-slate-200">{projects.filter(p => p.universityId === currentUniversityId && p.status !== ProjectStatus.DEPLOYED).length}</p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-green-500/20">
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Solutions Deployed</p>
            <p className="text-2xl font-bold text-slate-200">{12 + universityDeployedProjects.length}</p>
          </div>
        </div>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Invitations Received</h2>
          
          {pendingInvitations.map(({ problem, invitation }) => (
            <div key={invitation.id} className="glass p-6 rounded-2xl border-blue-500/30">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">{problem.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">From: Samadhaan AI / Government</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Match Score</span>
                      <p className="text-lg font-mono font-bold text-cyan-400">94%</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Expertise Match</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Civil Engineering</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Environmental Engineering</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">IoT</span>
                      </div>
                    </div>
                  </div>
                  
                  {invitation.message && (
                    <div className="bg-[#0B0E14] border border-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-slate-400 italic">"{invitation.message}"</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded text-center mb-2">
                    Invitation Received
                  </span>
                  
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-lg transition-colors border border-slate-700">
                    View Opportunity
                  </button>
                  <button 
                    onClick={() => setActionModal({ type: 'ACCEPT', invitationId: invitation.id })}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Accept Invitation
                  </button>
                  <button 
                    onClick={() => setActionModal({ type: 'DECLINE', invitationId: invitation.id })}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-sm rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {acceptedInvitations.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Accepted Opportunities</h2>
          
          {acceptedInvitations.map(({ problem, invitation }) => (
            <div key={invitation.id} className="glass p-6 rounded-2xl border-green-500/20">
              <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                <div>
                  <h3 className="font-bold text-slate-200">{problem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">University Accepted</span>
                  </div>
                </div>
                
                {!projects.some(p => p.problemId === problem.id) ? (
                  <button 
                    onClick={() => handleCreateProject(problem)}
                    className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-green-500/20 whitespace-nowrap"
                  >
                    Create Project →
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/project/${projects.find(p => p.problemId === problem.id)?.id}`)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
                  >
                    View Project
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {declinedInvitations.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Declined Opportunities</h2>
          
          {declinedInvitations.map(({ problem, invitation }) => (
            <div key={invitation.id} className="glass p-6 rounded-2xl border-red-500/20 opacity-70">
              <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                <div>
                  <h3 className="font-bold text-slate-200">{problem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Invitation Declined</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {invitations.length === 0 && (
        <div className="glass p-12 rounded-2xl border-slate-800 text-center">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">No Active Invitations</h3>
          <p className="text-slate-500 text-sm">Your university currently has no pending invitations from the government.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-4">
              {actionModal.type === 'ACCEPT' ? 'Accept this innovation opportunity?' : 'Decline opportunity?'}
            </h3>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {actionModal.type === 'ACCEPT' 
                ? "By accepting, your institution agrees to participate in developing a potential solution for this validated societal problem."
                : "Are you sure you want to decline this invitation? The government will be notified to seek other partners."
              }
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              {actionModal.type === 'ACCEPT' ? (
                <button 
                  onClick={handleAction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  Accept & Form Project
                </button>
              ) : (
                <button 
                  onClick={handleAction}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  Decline
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
