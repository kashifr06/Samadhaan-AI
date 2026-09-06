import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProblemStatus, Priority } from '../types';

export function ReportProblem() {
  const navigate = useNavigate();
  const { addProblem, analyzeProblem, setRole, isLoading } = useAppContext();
  
  const [step, setStep] = useState<'FORM' | 'PROCESSING' | 'RESULT'>('FORM');
  const [formData, setFormData] = useState({
    title: 'Severe waterlogging near college road',
    description: 'During moderate and heavy rainfall, the road near the college becomes severely waterlogged. Students, residents and vehicles have difficulty crossing the area. The problem occurs repeatedly during the monsoon.',
    category: 'Water & Sanitation',
    location: 'Ranchi, Jharkhand',
    affectedArea: 'College Road, Ward 4',
    estimatedPeopleAffected: '500-1000'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');
    
    const problemId = `PRB-${Math.floor(Math.random() * 10000)}`;
    const newProblem = {
      id: problemId,
      ...formData,
      status: ProblemStatus.SUBMITTED,
      submittedAt: new Date().toISOString(),
      submittedBy: 'Current User',
    };
    
    // Add in SUBMITTED state first
    addProblem(newProblem as any);

    // Simulate AI processing
    setTimeout(() => {
      const aiAnalysisData = {
        category: formData.category,
        subCategory: 'Urban Waterlogging',
        priority: 'HIGH' as Priority,
        confidence: 94,
        summary: 'Recurring waterlogging is affecting pedestrian and vehicular movement near an educational area.',
        affectedPopulation: formData.estimatedPeopleAffected,
        duplicateCheck: 'No similar active report found',
        suggestedExpertise: ['Civil Engineering', 'Environmental Engineering', 'Urban Planning', 'IoT / Smart Infrastructure']
      };
      analyzeProblem(problemId, aiAnalysisData);
      setStep('RESULT');
    }, 2500);
  };

  if (step === 'PROCESSING') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Samadhaan AI is understanding your problem...</h2>
          <p className="text-sm text-slate-400">Analyzing category, priority, and required expertise.</p>
        </div>
      </div>
    );
  }

  if (step === 'RESULT') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 text-green-400 bg-green-400/10 border border-green-400/20 p-4 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
          <h2 className="text-lg font-bold">Problem Received Successfully</h2>
        </div>

        <div className="glass border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-900/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              AI Analysis Report
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AUTO-GENERATED</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Category</span>
              <p className="text-sm text-slate-200 font-medium">Water & Sanitation</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sub-category</span>
              <p className="text-sm text-slate-200 font-medium">Urban Waterlogging</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Priority</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-sm text-orange-400 font-bold">HIGH</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI Confidence</span>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[94%]"></div>
                </div>
                <span className="text-sm text-cyan-400 font-bold font-mono">94%</span>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">AI Summary</span>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800 leading-relaxed italic">
                "Recurring waterlogging is affecting pedestrian and vehicular movement near an educational area."
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Affected Population</span>
              <p className="text-sm text-slate-200 font-medium">500–1000 estimated</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Duplicate Check</span>
              <p className="text-sm text-green-400 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                No similar active report found
              </p>
            </div>

            <div className="md:col-span-2 space-y-3 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Suggested Expertise for Solution</span>
              <div className="flex flex-wrap gap-2">
                {['Civil Engineering', 'Environmental Engineering', 'Urban Planning', 'IoT / Smart Infrastructure'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass border-blue-500/30 rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="p-6">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Next Stage: Government Validation Required</h3>
            <div className="flex items-center gap-4 mb-6 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium">AI Analysis Complete</span>
              </div>
              <div className="w-8 h-px bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm text-white font-medium">Government Review Pending</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl mb-6 border border-blue-500/20">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-200">
                AI recommendations are advisory. Final validation is performed by the government before this problem is sent to universities for solution matching.
              </p>
            </div>

            <button 
              onClick={() => {
                setRole('GOVERNMENT');
                navigate('/');
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              View Government Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Report a Problem</h1>
        <p className="text-sm text-slate-400">Describe the civic issue in detail. Our AI will analyze and route it for validation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Problem Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Problem Description</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option>Water & Sanitation</option>
              <option>Waste Management</option>
              <option>Roads & Infrastructure</option>
              <option>Public Safety</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Environment</option>
              <option>Electricity</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">City / Location</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Specific Affected Area</label>
            <input 
              type="text" 
              value={formData.affectedArea}
              onChange={e => setFormData({...formData, affectedArea: e.target.value})}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Estimated People Affected</label>
            <input 
              type="text" 
              value={formData.estimatedPeopleAffected}
              onChange={e => setFormData({...formData, estimatedPeopleAffected: e.target.value})}
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Supporting Image (Optional)</label>
          <div className="border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
            <FileText className="w-6 h-6 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Firebase Storage / evidence upload is deferred to a future phase.</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isLoading}
            className={`bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Submitting...' : 'Submit for AI Analysis'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
