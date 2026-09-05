import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, Users, Lightbulb, CheckCircle2, TrendingUp, IndianRupee, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProblemStatus, ProjectStatus } from '../types';

export function ImpactDashboard() {
  const { problems, projects } = useAppContext();

  const validatedProblems = problems.filter(p => p.status === ProblemStatus.GOVERNMENT_VALIDATED).length;
  const deployedProjects = projects.filter(p => p.status === ProjectStatus.DEPLOYED);

  const pipelineData = [
    { name: 'Reported', count: problems.length },
    { name: 'AI Analyzed', count: problems.filter(p => p.status === ProblemStatus.AI_ANALYZED || p.status === ProblemStatus.PENDING_GOVERNMENT || p.status === ProblemStatus.GOVERNMENT_VALIDATED || p.status === ProblemStatus.UNIVERSITY_ACCEPTED).length },
    { name: 'Validated', count: validatedProblems },
    { name: 'Projects', count: projects.length },
    { name: 'Deployed', count: deployedProjects.length },
  ];

  const categoryData = [
    { name: 'Water & San', count: deployedProjects.filter(p => p.title.includes('Water')).length },
    { name: 'Waste Mgmt', count: deployedProjects.filter(p => p.title.includes('Waste')).length },
    { name: 'Roads & Infra', count: deployedProjects.filter(p => p.title.includes('Roads')).length },
    { name: 'Public Safety', count: deployedProjects.filter(p => p.title.includes('Safety')).length },
    { name: 'Environment', count: deployedProjects.filter(p => p.title.includes('Environment')).length },
    { name: 'Education', count: deployedProjects.filter(p => p.title.includes('Education')).length },
  ];

  const timeData = [
    { month: 'Jan', impact: 0 },
    { month: 'Feb', impact: 0 },
    { month: 'Mar', impact: 0 },
    { month: 'Apr', impact: 0 },
    { month: 'May', impact: 0 },
    { month: 'Jun', impact: 0 },
  ];

  const totalImpact = deployedProjects.reduce((acc, p) => acc + (p.impactMetrics?.peopleImpacted || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Impact Dashboard</h1>
          <p className="text-slate-400 mt-2">Executive overview of Samadhaan AI platform outcomes.</p>
        </div>
        <span className="bg-slate-900 text-slate-400 text-[10px] px-3 py-1.5 rounded border border-slate-800 uppercase tracking-widest font-bold">
          Prototype / Demo Metrics
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Reported</p>
          <p className="text-2xl font-bold text-white">{problems.length}</p>
        </div>
        <div className="glass p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Validated</p>
          <p className="text-2xl font-bold text-blue-400">{validatedProblems}</p>
        </div>
        <div className="glass p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Projects</p>
          <p className="text-2xl font-bold text-cyan-400">{projects.length}</p>
        </div>
        <div className="glass p-5 rounded-2xl border-green-500/20 bg-green-500/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-green-400 mb-2">Deployed</p>
          <p className="text-2xl font-bold text-green-400">{deployedProjects.length}</p>
        </div>
        <div className="glass p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Impacted</p>
          <p className="text-2xl font-bold text-white">{totalImpact.toLocaleString()}</p>
        </div>
        <div className="glass p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Est. Savings</p>
          <p className="text-2xl font-bold text-orange-400">₹{(deployedProjects.reduce((acc, p) => acc + (p.impactMetrics?.costSavings || 0), 0)).toFixed(1)} L</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Problems Through the Pipeline</h3>
            <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Demo Data</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">People Impacted Over Time</h3>
            <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Demo Data</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="impact" stroke="#4ade80" strokeWidth={3} dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#4ade80', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Solutions Deployed by Category</h3>
            <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Demo Data</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Average Improvements (Before vs After)</h3>
            <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-1 rounded border border-slate-800 uppercase tracking-widest font-bold">Demo Data</span>
          </div>
          
          <div className="flex flex-col justify-center h-64 space-y-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Waterlogging Incidents</span>
                <span className="text-green-400 font-bold text-sm bg-green-500/10 px-2 py-0.5 rounded">58% Reduction</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#0B0E14] border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Before</span>
                  <span className="text-xl font-bold text-red-400">12</span> <span className="text-xs text-slate-500">/mo</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
                <div className="flex-1 bg-green-500/5 border border-green-500/20 p-3 rounded-lg text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-green-500 block mb-1">After</span>
                  <span className="text-xl font-bold text-green-400">5</span> <span className="text-xs text-green-500/70">/mo</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Average Response Time</span>
                <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-2 py-0.5 rounded">63% Faster</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#0B0E14] border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Before</span>
                  <span className="text-xl font-bold text-orange-400">120</span> <span className="text-xs text-slate-500">min</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />
                <div className="flex-1 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500 block mb-1">After</span>
                  <span className="text-xl font-bold text-blue-400">45</span> <span className="text-xs text-blue-500/70">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
