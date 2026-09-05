import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Building2, ExternalLink } from 'lucide-react';
import { ProblemStatus, ProjectStatus } from '../types';

export function IndustryOpportunities() {
  const { projects, industryPartners, joinIndustry } = useAppContext();
  const navigate = useNavigate();
  
  const [actionModal, setActionModal] = useState<{ projectId: string, partnerId: string } | null>(null);

  // For prototype, simulate as AquaSense Technologies (IND-001)
  const currentPartnerId = 'IND-001';
  const partner = industryPartners.find(i => i.id === currentPartnerId);

  // Industry can see projects that are created but have no partner yet
  const availableProjects = projects.filter(p => !p.industryPartnerId);
  const myProjects = projects.filter(p => p.industryPartnerId === currentPartnerId);
  const myActiveProjects = myProjects.filter(p => p.status !== ProjectStatus.DEPLOYED);
  const myDeployedProjects = myProjects.filter(p => p.status === ProjectStatus.DEPLOYED);

  const handleJoin = () => {
    if (actionModal) {
      joinIndustry(actionModal.projectId, actionModal.partnerId);
      setActionModal(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Industry Opportunities</h1>
          <p className="text-sm text-slate-400">Discover and mentor civic tech projects for {partner?.name}.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass px-4 py-3 rounded-xl border-cyan-500/20">
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Active Mentorships</p>
            <p className="text-2xl font-bold text-slate-200">{myActiveProjects.length}</p>
          </div>
          <div className="glass px-4 py-3 rounded-xl border-green-500/20">
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Solutions Deployed</p>
            <p className="text-2xl font-bold text-slate-200">{8 + myDeployedProjects.length}</p>
          </div>
        </div>
      </div>

      {availableProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Suggested Projects for Collaboration</h2>
          
          {availableProjects.map((project) => (
            <div key={project.id} className="glass p-6 rounded-2xl border-cyan-500/20">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200">{project.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{project.objective}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Industry Match Score</span>
                      <p className="text-lg font-mono font-bold text-cyan-400">88%</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Why Industry Collaboration?</span>
                      <ul className="text-xs text-slate-300 list-disc list-inside mt-1 space-y-1">
                        <li>Smart sensor deployment</li>
                        <li>IoT hardware</li>
                        <li>Field testing</li>
                        <li>Deployment support</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-[#0B0E14] border border-slate-800 p-4 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Your Potential Contribution</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">✓ IoT Sensors</span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">✓ Water Monitoring</span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">✓ Smart Infrastructure</span>
                    </div>
                    <p className="text-sm text-slate-300">{partner?.contribution}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px] justify-center border-l border-slate-800 pl-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 text-center mb-2">
                    Action Required
                  </span>
                  
                  <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-lg transition-colors border border-slate-700 w-full"
                  >
                    View Project
                  </button>
                  <button 
                    onClick={() => setActionModal({ projectId: project.id, partnerId: currentPartnerId })}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold text-sm rounded-lg transition-colors shadow-lg shadow-cyan-600/20 w-full"
                  >
                    Join as Mentor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {myProjects.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-500">Active Collaborations</h2>
          
          {myProjects.map((project) => (
            <div key={project.id} className="glass p-6 rounded-2xl border-green-500/20">
              <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                <div>
                  <h3 className="font-bold text-slate-200">{project.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Industry Mentor Joined</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  View Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {availableProjects.length === 0 && myProjects.length === 0 && (
        <div className="glass p-12 rounded-2xl border-slate-800 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">No Active Opportunities</h3>
          <p className="text-slate-500 text-sm">There are currently no projects matching your industry expertise.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-4">
              Join this project as an industry mentor?
            </h3>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              The industry partner will provide technical mentorship and relevant implementation support to the student team.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoin}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 rounded-lg font-bold text-sm transition-colors"
              >
                Join Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
