import React from 'react';
import { Bell, UserCircle, Play, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

export function Header() {
  const { role, setRole, runDemo, resetDemo } = useAppContext();
  
  const roles: Role[] = ['Citizen', 'Government', 'University', 'Industry'];

  return (
    <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-[#0F172A]/50 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-slate-900">{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={runDemo}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded text-xs font-bold transition-colors"
        >
          <Play className="w-3 h-3" />
          Advance Demo
        </button>
        <button 
          onClick={resetDemo}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-bold transition-colors border border-slate-700"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <button className="relative">
          <div className="w-2 h-2 bg-orange-500 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-[#0F172A]"></div>
          <div className="w-5 h-5 text-slate-400 border border-slate-400 rounded flex items-center justify-center hover:text-slate-200 hover:border-slate-200 transition-colors">
            <Bell className="w-3 h-3" />
          </div>
        </button>
        
        <div className="h-8 w-px bg-slate-800"></div>
        
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none">Projector Optimized</p>
          <p className="text-xs font-medium text-cyan-400">1280px Presentation View</p>
        </div>
      </div>
    </header>
  );
}
