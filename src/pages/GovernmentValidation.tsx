import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, FileText, Target, AlertTriangle } from 'lucide-react';
import { ProblemStatus, canEnterUniversityMatching } from '../types';
import { cn } from '../lib/utils';

export function GovernmentValidation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, validateProblem, rejectProblem, requestClarification } = useAppContext();
  
  const [actionModal, setActionModal] = useState<'VALIDATE' | 'CLARIFY' | 'REJECT' | null>(null);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Insufficient information');

  const problem = problems.find(p => p.id === id) || problems[0]; // fallback for demo

  if (!problem) {
    return <div className="text-slate-400">Problem not found.</div>;
  }

  const handleValidate = () => {
    validateProblem(problem.id, note);
    setActionModal(null);
    alert('Problem validated successfully.');
  };

  const handleClarify = () => {
    requestClarification(problem.id, note);
    setActionModal(null);
    alert('Clarification request sent to citizen.');
  };

  const handleReject = () => {
    rejectProblem(problem.id, `${rejectionReason}: ${note}`);
    setActionModal(null);
    alert('Problem report rejected.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 relative">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">GOVERNMENT VALIDATION</h1>
          <p className="text-sm text-slate-400">Review AI-assisted citizen reports before they proceed to solution matching.</p>
        </div>
        <div className="flex items-center gap-2">
          {problem.status === ProblemStatus.PENDING_GOVERNMENT && (
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-sm font-bold">
              PENDING VALIDATION
            </span>
          )}
          {problem.status === ProblemStatus.GOVERNMENT_VALIDATED && (
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              GOVERNMENT VALIDATED
            </span>
          )}
          {problem.status === ProblemStatus.CLARIFICATION_REQUESTED && (
            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              CLARIFICATION REQUESTED
            </span>
          )}
          {problem.status === ProblemStatus.REJECTED && (
            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              REJECTED
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Problem Details */}
          <div className="glass border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-bold text-slate-200">Problem Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Problem Title</h4>
                <p className="text-slate-200 font-medium">{problem.title}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Description</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{problem.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Category</h4>
                  <p className="text-sm text-slate-300">{problem.category}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Location</h4>
                  <p className="text-sm text-slate-300">{problem.location}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Affected Area</h4>
                  <p className="text-sm text-slate-300">{problem.affectedArea || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Estimated Population Affected</h4>
                  <p className="text-sm text-slate-300">{problem.estimatedPeopleAffected || 'N/A'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Supporting Evidence</h4>
                <div className="h-40 w-full rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500">
                  <FileText className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">No Image Attached</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Only visible if PENDING */}
          {problem.status === ProblemStatus.PENDING_GOVERNMENT && (
            <div className="glass border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-200 mb-4 uppercase tracking-widest text-xs">GOVERNMENT DECISION</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Optional Government Note</label>
                  <textarea 
                    rows={3}
                    placeholder="Add an official review note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => setActionModal('VALIDATE')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20 uppercase tracking-widest text-xs"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    VALIDATE REPORT
                  </button>
                  <button 
                    onClick={() => setActionModal('CLARIFY')}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl border border-slate-700 transition-colors uppercase tracking-widest text-xs"
                  >
                    <HelpCircle className="w-5 h-5" />
                    REQUEST CLARIFICATION
                  </button>
                  <button 
                    onClick={() => setActionModal('REJECT')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold px-4 py-3 rounded-xl transition-colors uppercase tracking-widest text-xs"
                  >
                    <XCircle className="w-5 h-5" />
                    REJECT REPORT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Validated State */}
          {canEnterUniversityMatching(problem) && (
            <div className="glass border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <h3 className="font-bold text-green-400 mb-2 uppercase tracking-widest text-xs">Verified by Government</h3>
              
              {problem.governmentReview?.comments && (
                <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-300 italic">"{problem.governmentReview.comments}"</p>
                </div>
              )}

              <div className="mb-6">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Validated At: </span>
                <span className="text-sm text-slate-400">{new Date(problem.governmentReview?.reviewedAt || '').toLocaleString()}</span>
              </div>
              
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">NEXT STAGE</h4>
                <p className="text-sm text-white font-bold mb-4">University / Expertise Matching</p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate(`/matching/${problem.id}`)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Proceed to University Matching →
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-lg transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clarification/Rejected States */}
          {(problem.status === ProblemStatus.CLARIFICATION_REQUESTED || problem.status === ProblemStatus.REJECTED) && (
            <div className="glass border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-200 mb-2 uppercase tracking-widest text-xs">
                {problem.status === ProblemStatus.CLARIFICATION_REQUESTED ? 'Clarification Requested' : 'Problem Rejected'}
              </h3>
              
              {problem.status === ProblemStatus.REJECTED && problem.governmentReview?.rejectionReason && (
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Reason</span>
                  <p className="text-sm text-red-400 font-bold">{problem.governmentReview.rejectionReason}</p>
                </div>
              )}

              {problem.governmentReview?.comments && (
                <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-300">"{problem.governmentReview.comments}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Analysis Sidebar */}
        <div className="space-y-6">
          <div className="glass border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">AI ASSESSMENT</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-200 leading-tight">
                  AI recommendations are advisory. Government validation is required before this problem can proceed.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Category</h4>
                <p className="text-sm text-slate-200 font-medium">{problem.category}</p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">AI Confidence</h4>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${problem.aiAnalysis?.confidence || 0}%` }}></div>
                  </div>
                  <span className="text-sm text-cyan-400 font-bold font-mono">{problem.aiAnalysis?.confidence}%</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Priority</h4>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border",
                  problem.aiAnalysis?.priority === 'HIGH' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                  problem.aiAnalysis?.priority === 'MEDIUM' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-slate-800 text-slate-300 border-slate-700"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", problem.aiAnalysis?.priority === 'HIGH' ? "bg-orange-500" : "bg-blue-400")}></span>
                  {problem.aiAnalysis?.priority || 'UNRATED'}
                </span>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Duplicate Check</h4>
                <p className="text-sm text-green-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {problem.aiAnalysis?.duplicateCheck || 'No duplicates found'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">AI Summary</h4>
                <p className="text-sm text-slate-300 italic bg-[#0B0E14] p-3 rounded-lg border border-slate-800">
                  "{problem.aiAnalysis?.summary || problem.description}"
                </p>
              </div>
              
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Suggested Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {problem.aiAnalysis?.suggestedExpertise?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[11px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {actionModal && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            
            {actionModal === 'VALIDATE' && (
              <>
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="font-bold text-white text-lg">Validate this problem?</h3>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-300">
                    By validating this report, the government confirms that the reported problem is eligible to proceed to the next stage.
                  </p>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setActionModal(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleValidate}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Confirm Validation
                    </button>
                  </div>
                </div>
              </>
            )}

            {actionModal === 'CLARIFY' && (
              <>
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="font-bold text-white text-lg">Request Clarification</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Reason for Clarification</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Please provide a more precise location..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setActionModal(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleClarify}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Send Clarification Request
                    </button>
                  </div>
                </div>
              </>
            )}

            {actionModal === 'REJECT' && (
              <>
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="font-bold text-white text-lg">Reject Problem Report</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Rejection Reason</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                    >
                      <option>Insufficient information</option>
                      <option>Duplicate / Existing Case</option>
                      <option>Outside Government Jurisdiction</option>
                      <option>Invalid Report</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Optional Note</label>
                    <textarea 
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setActionModal(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
