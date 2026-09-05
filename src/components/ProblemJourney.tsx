import React from 'react';
import { ProblemStatus, ProjectStatus } from '../types';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

export function ProblemJourney({ problemId }: { problemId: string }) {
  const { problems, projects } = useAppContext();
  
  const problem = problems.find(p => p.id === problemId);
  const project = projects.find(p => p.problemId === problemId);
  
  if (!problem) return null;

  // Determine stage conditions based strictly on underlying data
  const isReported = true; // exists
  const isAIUnderstood = [ProblemStatus.AI_ANALYZED, ProblemStatus.PENDING_GOVERNMENT, ProblemStatus.GOVERNMENT_VALIDATED, ProblemStatus.UNIVERSITY_ACCEPTED].includes(problem.status) || !!project;
  const isGovValidated = [ProblemStatus.GOVERNMENT_VALIDATED, ProblemStatus.UNIVERSITY_ACCEPTED].includes(problem.status) || !!project;
  
  const hasInvitations = (problem.invitations || []).length > 0;
  const isExpertiseMatched = hasInvitations || !!project;
  
  const isUniAccepted = problem.status === ProblemStatus.UNIVERSITY_ACCEPTED || !!project;
  
  const isProjectCreated = !!project;
  const isTeamFormed = !!project?.teamId;
  const isIndustryJoined = !!project?.industryPartnerId;
  
  const isPrototypeBuilt = project?.milestones.some(m => m.title === 'Prototype Development' && m.status === 'COMPLETED') || false;
  const isPilotCompleted = project?.milestones.some(m => m.title === 'Government Pilot' && m.status === 'COMPLETED') || false;
  const isDeployed = project?.status === ProjectStatus.DEPLOYED;
  const isImpactMeasured = isDeployed && !!project?.impactMetrics;

  const sequence = [
    { label: 'Reported', completed: isReported },
    { label: 'AI Understood', completed: isAIUnderstood },
    { label: 'Government Validated', completed: isGovValidated },
    { label: 'Expertise Matched', completed: isExpertiseMatched },
    { label: 'University Accepted', completed: isUniAccepted },
    { label: 'Student Team Formed', completed: isTeamFormed },
    { label: 'Project Created', completed: isProjectCreated },
    { label: 'Industry Joined', completed: isIndustryJoined },
    { label: 'Prototype Built', completed: isPrototypeBuilt },
    { label: 'Government Pilot', completed: isPilotCompleted },
    { label: 'Deployed', completed: isDeployed },
    { label: 'Impact Measured', completed: isImpactMeasured }
  ];

  // Active index is the first uncompleted, or the last if all completed
  const activeIndex = sequence.findIndex(s => !s.completed);
  const currentActiveIdx = activeIndex === -1 ? sequence.length - 1 : activeIndex;

  return (
    <div className="glass p-6 rounded-2xl border-slate-800">
      <h4 className="text-slate-400 font-bold text-xs uppercase mb-6 tracking-widest">Problem Journey</h4>
      
      <div className="relative space-y-4 pl-6 border-l border-slate-800">
        {sequence.map((stage, idx) => {
          const isCompleted = stage.completed && idx !== currentActiveIdx;
          const isActive = stage.completed ? (idx === sequence.length -1) : (idx === currentActiveIdx);
          const isFuture = !stage.completed && idx > currentActiveIdx;

          return (
            <div key={stage.label} className={cn("relative", isFuture && "opacity-40")}>
              {/* Indicator */}
              {stage.completed && !isActive && (
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-green-500 rounded-full ring-4 ring-green-500/10 flex items-center justify-center -ml-1">
                    <CheckCircle2 className="w-3 h-3 text-[#0B0E14]" />
                </div>
              )}
              {isActive && (
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-cyan-400 rounded-full -ml-1 border-2 border-[#0B0E14] ring-4 ring-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
              )}
              {isFuture && (
                <div className="absolute -left-[31px] top-1 w-2 h-2 bg-slate-700 rounded-full"></div>
              )}

              {/* Text */}
              <p className={cn(
                  "text-[11px] font-bold leading-none mb-1",
                  stage.completed && !isActive ? "text-green-400" :
                  isActive ? "text-cyan-400" : "text-slate-300"
              )}>
                {(idx + 1).toString().padStart(2, '0')} {stage.label}
              </p>
              
              {isActive && (
                  <p className="text-[9px] text-cyan-400/70">Current Stage</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
