import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ProblemStatus, ProjectStatus } from '../types';
import { HelpCircle, XCircle } from 'lucide-react';
import { ProblemJourney } from '../components/ProblemJourney';

export function MyReports() {
  const { problems, projects } = useAppContext();
  const navigate = useNavigate();

  // Show all problems for demo purposes
  const userProblems = problems;

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Reports</h1>
        <p className="text-sm text-slate-400">Track the lifecycle of problems you have submitted.</p>
      </div>

      <div className="space-y-6">
        {userProblems.map(problem => {
          const project = projects.find(p => p.problemId === problem.id);
          const isDeployed = project?.status === ProjectStatus.DEPLOYED;

          return (
            <div key={problem.id} className="glass p-6 md:p-8 rounded-2xl border-slate-800">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Problem Details */}
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-2 block">
                        ID: {problem.id}
                      </span>
                      <h2 className="text-xl font-bold text-slate-200">{problem.title}</h2>
                      <p className="text-slate-400 text-sm mt-2 max-w-2xl">{problem.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Location</p>
                      <p className="text-sm font-medium text-slate-300">{problem.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Date Reported</p>
                      <p className="text-sm font-medium text-slate-300">{new Date(problem.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {problem.status === ProblemStatus.REJECTED && problem.governmentReview?.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-200">{problem.governmentReview.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  
                  {problem.status === ProblemStatus.CLARIFICATION_REQUESTED && problem.governmentReview?.comments && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-1">Clarification Needed</p>
                        <p className="text-sm text-yellow-200">{problem.governmentReview.comments}</p>
                        <button className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg transition-colors">
                          Provide Information
                        </button>
                      </div>
                    </div>
                  )}

                  {isDeployed && (
                    <div className="pt-6 border-t border-green-500/20">
                        <p className="text-[10px] uppercase font-bold text-green-400 tracking-widest mb-3">Solution Deployed</p>
                       <button 
                          onClick={() => navigate('/impact')}
                          className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        >
                          View Impact Dashboard
                        </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Problem Journey */}
                <div className="w-full lg:w-64 shrink-0">
                  <ProblemJourney problemId={problem.id} />
                </div>
              </div>
            </div>
          );
        })}

        {userProblems.length === 0 && (
          <div className="glass border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-400 mb-4">You haven't reported any problems yet.</p>
            <button 
              onClick={() => navigate('/report')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition-colors"
            >
              Report a Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
