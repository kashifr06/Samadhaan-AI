import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Droplets, Trash2, Lightbulb, ShieldAlert, GraduationCap, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { cn } from '../lib/utils';

export function CitizenHome() {
  const navigate = useNavigate();

  const challengeCards = [
    { title: 'Waterlogging', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Waste Management', icon: Trash2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Street Lighting', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Public Safety', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Education', icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          From Local Problems to <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Real-World Solutions</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Report a real-world problem. Let AI understand it. Government validates it. 
          Universities and industry collaborate to build solutions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => navigate('/report')}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            Report a Problem
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3 rounded-lg transition-all border border-slate-700"
          >
            Track My Reports
          </button>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-8 pt-8 border-t border-slate-800/50">
        <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">How Samadhaan Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { num: '01', title: 'Report' },
            { num: '02', title: 'AI Understands' },
            { num: '03', title: 'Government Validates', highlight: true },
            { num: '04', title: 'Expertise Matched' },
            { num: '05', title: 'Collaborate' },
            { num: '06', title: 'Deploy' },
            { num: '07', title: 'Measure Impact' },
          ].map((step, idx) => (
            <div key={idx} className={cn(
              "glass border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-2 relative transition-all",
              step.highlight && "ring-2 ring-blue-500 border-blue-500/50 bg-blue-500/5 scale-105 shadow-xl shadow-blue-500/10"
            )}>
              <span className={cn(
                "font-mono text-xl font-bold",
                step.highlight ? "text-blue-400" : "text-cyan-500/50"
              )}>{step.num}</span>
              <span className={cn(
                "text-xs",
                step.highlight ? "text-blue-200 font-bold" : "text-slate-300 font-medium"
              )}>{step.title}</span>
              {idx !== 6 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-700 z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-500 italic mt-4 max-w-lg mx-auto">
          AI recommendations are advisory. Government performs the final validation before matching begins.
        </p>
      </section>

      {/* Challenge Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Explore Challenge Areas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {challengeCards.map((card) => (
            <div 
              key={card.title} 
              className="glass border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">{card.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Why Samadhaan AI */}
      <section className="space-y-8 pt-12 border-t border-slate-800/50">
        <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">Why Samadhaan AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI-Assisted</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advanced categorization, priority scoring, and duplicate detection streamline the reporting process.
            </p>
          </div>
          
          <div className="glass border-slate-800 rounded-2xl p-8 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Human-Validated</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crucial oversight by government officials ensures real-world applicability and jurisdictional authority.
            </p>
          </div>
          
          <div className="glass border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Impact-Driven</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bridging the gap between civic challenges and academic/industry innovation for tangible societal impact.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
