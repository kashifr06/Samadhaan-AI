import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ProblemStatus, University, UniversityMatch, canEnterUniversityMatching } from '../types';
import { ArrowLeft, CheckCircle2, MapPin, Building2, Users, GraduationCap, X, ChevronRight, Send, AlertCircle, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export function UniversityMatching() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { problems, universities, inviteUniversity } = useAppContext();
  
  const problem = problems.find(p => p.id === id);

  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [universityToInvite, setUniversityToInvite] = useState<University | null>(null);
  const [invitationToView, setInvitationToView] = useState<University | null>(null);

  const [filterExpertise, setFilterExpertise] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<'overall' | 'expertise' | 'team' | 'geographic'>('overall');

  if (!problem) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
        Problem not found
      </div>
    );
  }

  if (!canEnterUniversityMatching(problem)) {
    return (
      <div className="p-12 text-center text-red-400 font-bold uppercase tracking-widest text-sm">
        Problem is not eligible for University Matching. Current status: {problem.status.replace(/_/g, ' ')}
      </div>
    );
  }

  const matches = useMemo(() => {
    return universities.map(u => {
      // Demo matching logic
      let expertiseScore = 70;
      let researchScore = 70;
      let geographicScore = u.geographicRelevance === 'HIGH' ? 95 : u.geographicRelevance === 'MEDIUM' ? 85 : 70;
      let teamAvailabilityScore = u.availableTeams > 3 ? 90 : u.availableTeams > 1 ? 80 : 60;
      
      if (u.name.includes('Mesra')) {
        expertiseScore = 96;
        researchScore = 93;
        teamAvailabilityScore = 90;
        geographicScore = 95;
      } else if (u.name.includes('Jamshedpur')) {
        expertiseScore = 92;
        researchScore = 88;
        teamAvailabilityScore = 85;
        geographicScore = 90;
      } else if (u.name.includes('Sindri')) {
        expertiseScore = 89;
        researchScore = 84;
        teamAvailabilityScore = 82;
        geographicScore = 88;
      }

      const overallScore = Math.round((expertiseScore * 0.40) + (researchScore * 0.25) + (teamAvailabilityScore * 0.20) + (geographicScore * 0.15));

      const match: UniversityMatch = {
        universityId: u.id,
        overallScore,
        expertiseScore,
        researchScore,
        teamAvailabilityScore,
        geographicScore,
        reasons: [
          `Strong ${u.expertise[0]} expertise`,
          'Relevant research capabilities',
          'Suitable student team availability',
          'Geographic relevance'
        ]
      };
      
      return { university: u, match };
    });
  }, [universities]);

  const filteredAndSortedMatches = useMemo(() => {
    let result = [...matches];

    if (filterExpertise) {
      result = result.filter(r => 
        r.university.expertise.some(e => e.toLowerCase().includes(filterExpertise.toLowerCase()))
      );
    }
    
    if (filterLocation) {
      result = result.filter(r => 
        r.university.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    if (minScore > 0) {
      result = result.filter(r => r.match.overallScore >= minScore);
    }

    result.sort((a, b) => {
      if (sortBy === 'overall') return b.match.overallScore - a.match.overallScore;
      if (sortBy === 'expertise') return b.match.expertiseScore - a.match.expertiseScore;
      if (sortBy === 'team') return b.match.teamAvailabilityScore - a.match.teamAvailabilityScore;
      if (sortBy === 'geographic') return b.match.geographicScore - a.match.geographicScore;
      return 0;
    });

    return result;
  }, [matches, filterExpertise, filterLocation, minScore, sortBy]);

  const handleInvite = () => {
    if (universityToInvite && problem) {
      inviteUniversity(problem.id, universityToInvite.id, "Your institution has been identified as a strong expertise match for this validated societal problem.");
      setInviteModalOpen(false);
      setUniversityToInvite(null);
    }
  };

  const getInvitationStatus = (uId: string) => {
    const inv = problem.invitations?.find(i => i.universityId === uId);
    return inv ? inv.status : 'NOT_INVITED';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full glass border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-200">University & Expertise Matching</h1>
            <p className="text-slate-400 text-sm mt-1">Connect validated societal problems with institutions that have the expertise, teams and capabilities to develop solutions.</p>
          </div>
        </div>
      </div>

      {/* Problem Summary */}
      <div className="glass rounded-2xl p-6 border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2 text-right pointer-events-none">
           <span className="text-xs font-bold px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            GOVERNMENT VALIDATED
          </span>
          <span className="text-xs text-slate-500 italic">Ready for University Matching</span>
        </div>
        
        <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Project Opportunity</h2>
        <h3 className="text-2xl font-bold text-slate-200 mb-2">{problem.title}</h3>
        
        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {problem.location}</span>
          <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {problem.category}</span>
          <span className="flex items-center gap-1.5">
             <span className={cn(
                "w-2 h-2 rounded-full",
                problem.aiAnalysis?.priority === 'HIGH' ? "bg-orange-500" :
                problem.aiAnalysis?.priority === 'MEDIUM' ? "bg-blue-400" : "bg-slate-400"
              )}></span>
             Priority: {problem.aiAnalysis?.priority}
          </span>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex gap-3">
           <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
           <div>
             <h4 className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-1">Government Validation: Verified</h4>
             {problem.governmentReview?.comments ? (
               <p className="text-sm text-slate-300 italic">"{problem.governmentReview.comments}"</p>
             ) : (
               <p className="text-sm text-slate-400 italic">No additional comments provided.</p>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Expertise & Methodology */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI-Extracted Expertise */}
          <div className="glass rounded-2xl p-6 border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-bold text-slate-200 mb-1">AI-Extracted Expertise Requirements</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">Based on the validated problem, Samadhaan AI identifies the expertise required to develop a potential solution.</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-2xl font-bold text-cyan-400">94%</span>
                <p className="text-[9px] uppercase font-bold text-cyan-500/50 tracking-widest">AI Confidence</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Primary Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {problem.expertiseRequirements?.filter(e => e.type === 'PRIMARY').map(req => (
                    <span key={req.name} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">
                      {req.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Supporting Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {problem.expertiseRequirements?.filter(e => e.type === 'SUPPORTING').map(req => (
                    <span key={req.name} className="px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium">
                      {req.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Technical Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {problem.expertiseRequirements?.filter(e => e.type === 'TECHNICAL_AREA').map(req => (
                    <span key={req.name} className="px-3 py-1.5 bg-cyan-500/5 text-cyan-400 border border-cyan-500/10 rounded-lg text-[11px] font-mono">
                      {req.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* How Matching Works */}
          <div className="glass rounded-2xl p-6 border-slate-800">
            <h2 className="font-bold text-slate-200 mb-4">How Matching Works</h2>
            <div className="space-y-4">
              {[
                { label: 'Expertise Alignment', weight: '40%', color: 'bg-blue-500' },
                { label: 'Research / Project Relevance', weight: '25%', color: 'bg-cyan-500' },
                { label: 'Student Team Availability', weight: '20%', color: 'bg-teal-500' },
                { label: 'Geographic Relevance', weight: '15%', color: 'bg-emerald-500' }
              ].map(factor => (
                <div key={factor.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{factor.label}</span>
                    <span className="text-slate-400">{factor.weight}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${factor.color}`} style={{ width: factor.weight }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-2 text-[10px] text-blue-400/80 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <p>These values represent the AI's matching methodology for identifying optimal institutional partners.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Matches */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="font-bold text-slate-200">Ranked University Matches</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter expertise..." 
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 w-40 focus:outline-none focus:border-blue-500 transition-colors"
                  value={filterExpertise}
                  onChange={e => setFilterExpertise(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Location..." 
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 w-32 focus:outline-none focus:border-blue-500 transition-colors"
                  value={filterLocation}
                  onChange={e => setFilterLocation(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select 
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                >
                  <option value={0}>Any Score</option>
                  <option value={80}>Min 80%</option>
                  <option value={90}>Min 90%</option>
                  <option value={95}>Min 95%</option>
                </select>
              </div>
              <div className="relative">
                <SlidersHorizontal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select 
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="overall">Sort: Best Match</option>
                  <option value="expertise">Sort: Expertise</option>
                  <option value="team">Sort: Team Avail.</option>
                  <option value="geographic">Sort: Location</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Prototype / Demo Data
            </span>
          </div>

          {filteredAndSortedMatches.length === 0 ? (
            <div className="glass rounded-2xl p-12 border-slate-800 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">No strong university matches found.</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Samadhaan could not identify a suitable expertise match in the current prototype dataset for your specific filters.</p>
              <button 
                onClick={() => setFilterExpertise('')}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Clear Filters & Broaden Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedMatches.map(({ university, match }, index) => {
                const inviteStatus = getInvitationStatus(university.id);
                const isSent = inviteStatus === 'PENDING';
                const isAccepted = inviteStatus === 'ACCEPTED';

                return (
                  <div key={university.id} className="glass rounded-2xl p-6 border-slate-800 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                    {/* Rank Badge */}
                    <div className="absolute top-0 left-0 bg-blue-600/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-br-lg border-b border-r border-blue-500/20">
                      #{index + 1} MATCH
                    </div>

                    {/* Match Score Display */}
                    <div className="flex flex-col items-center justify-center min-w-[120px] shrink-0 pt-4 md:pt-0 border-b md:border-b-0 md:border-r border-slate-800/50 pb-6 md:pb-0 md:pr-6">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${match.overallScore} 100`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-white leading-none">{match.overallScore}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest mt-3">
                        {match.overallScore >= 90 ? 'Excellent Match' : match.overallScore >= 80 ? 'Good Match' : 'Potential Match'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-200">{university.name}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5" /> {university.location}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {university.expertise.slice(0, 3).map(exp => (
                          <span key={exp} className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] rounded-md font-medium">
                            {exp}
                          </span>
                        ))}
                        {university.expertise.length > 3 && (
                          <span className="px-2 py-1 bg-slate-800/50 text-slate-500 text-[11px] rounded-md font-medium">
                            +{university.expertise.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Available Teams</p>
                          <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-400" />
                            {university.availableTeams} Teams
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Research Focus</p>
                          <p className="text-sm font-medium text-slate-300 truncate">
                            {university.researchAreas[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 justify-center md:items-end shrink-0 md:min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                      {isAccepted ? (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-lg text-sm text-center mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Accepted
                        </div>
                      ) : isSent ? (
                        <>
                          <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-lg text-sm text-center mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Invitation Sent
                          </div>
                          <button 
                            onClick={() => setInvitationToView(university)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-sm"
                          >
                            View Invitation
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              setUniversityToInvite(university);
                              setInviteModalOpen(true);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20 text-sm mb-2"
                          >
                            Invite University
                          </button>
                          <button 
                            onClick={() => setSelectedUniversity(university)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-sm"
                          >
                            View Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* University Details Modal */}
      {selectedUniversity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
              <div>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1 block">University Overview</span>
                <h3 className="text-2xl font-bold text-slate-200">{selectedUniversity.name}</h3>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedUniversity.location}</p>
              </div>
              <button 
                onClick={() => setSelectedUniversity(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="flex justify-end -mt-2">
                 <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                  Prototype / Demo Data
                </span>
              </div>

              {/* Match Breakdown */}
              {(() => {
                const match = matches.find(m => m.university.id === selectedUniversity.id)?.match;
                if (!match) return null;

                const renderBar = (label: string, score: number) => (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{label}</span>
                      <span className="text-blue-400">{score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                );

                return (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-200">Match Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {renderBar('Expertise Alignment', match.expertiseScore)}
                      {renderBar('Research Relevance', match.researchScore)}
                      {renderBar('Team Availability', match.teamAvailabilityScore)}
                      {renderBar('Geographic Relevance', match.geographicScore)}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Relevant Expertise</h4>
                  <ul className="space-y-2">
                    {selectedUniversity.expertise.map(exp => (
                      <li key={exp} className="text-sm text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-3">Research Areas</h4>
                  <ul className="space-y-2">
                    {selectedUniversity.researchAreas.map(area => (
                      <li key={area} className="text-sm text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></div>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Available Teams</p>
                  <p className="text-2xl font-bold text-slate-200">{selectedUniversity.availableTeams}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Teams</p>
                  <p className="text-2xl font-bold text-slate-400">{selectedUniversity.studentTeamCount}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 shrink-0">
              <button 
                onClick={() => setSelectedUniversity(null)}
                className="px-6 py-2.5 text-slate-300 font-bold hover:bg-slate-800 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
              {getInvitationStatus(selectedUniversity.id) === 'NOT_INVITED' && (
                <button 
                  onClick={() => {
                    setUniversityToInvite(selectedUniversity);
                    setSelectedUniversity(null);
                    setInviteModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm"
                >
                  Invite University
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Confirmation Modal */}
      {inviteModalOpen && universityToInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-slate-200">Invite University</h3>
              <p className="text-slate-400 text-sm mt-1">Send this validated problem opportunity to the selected university?</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Problem</p>
                  <p className="text-sm font-medium text-slate-200 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">{problem.title}</p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">University</p>
                  <p className="text-sm font-medium text-slate-200 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between">
                    {universityToInvite.name}
                    <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-xs">
                      {matches.find(m => m.university.id === universityToInvite.id)?.match.overallScore}% MATCH
                    </span>
                  </p>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Suggested Expertise</p>
                   <div className="flex flex-wrap gap-1.5">
                     {problem.expertiseRequirements?.filter(e => e.type === 'PRIMARY').map(e => (
                       <span key={e.name} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{e.name}</span>
                     ))}
                   </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Message (Optional)</p>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 min-h-[80px]"
                    defaultValue="Your institution has been identified as a strong expertise match for this validated societal problem."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button 
                onClick={() => {
                  setInviteModalOpen(false);
                  setUniversityToInvite(null);
                }}
                className="px-6 py-2.5 text-slate-300 font-bold hover:bg-slate-800 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm"
              >
                <Send className="w-4 h-4" />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invitation Modal */}
      {invitationToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-1 block">Sent Invitation</span>
                <h3 className="text-xl font-bold text-slate-200">University Invitation</h3>
              </div>
              <button 
                onClick={() => setInvitationToView(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">To</p>
                <p className="text-lg font-bold text-white">{invitationToView.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Status</p>
                  <p className="text-sm font-bold text-blue-400">Awaiting Response</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Sent By</p>
                  <p className="text-sm font-bold text-slate-300">Government Dashboard</p>
                </div>
              </div>

              <div className="bg-[#0B0E14] border border-slate-800 rounded-lg p-4">
                 <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Message Included</p>
                 <p className="text-sm text-slate-400 italic">
                   "{problem.invitations?.find(i => i.universityId === invitationToView.id)?.message || "Your institution has been identified as a strong expertise match for this validated societal problem."}"
                 </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 text-right">
              <button 
                onClick={() => setInvitationToView(null)}
                className="px-6 py-2.5 text-slate-300 font-bold hover:bg-slate-800 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
