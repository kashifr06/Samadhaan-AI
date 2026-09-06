import React from 'react';
import { RotateCcw, LogIn, LogOut } from 'lucide-react';
import { useAppContext, isTestMode } from '../context/AppContext';
import { getRoleLabel, Role, USER_ROLES } from '../types';

export function Header() {
  const { authUser, login, logout, role, setRole, runDemo, resetDemo } = useAppContext();
  
  const roles: Role[] = [...USER_ROLES];

  return (
    <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-[#0F172A]/50 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-6">
        {isTestMode ? (
          <div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {roles.map(r => (
                <option key={r} value={r} className="bg-slate-900">{getRoleLabel(r)}</option>
              ))}
            </select>
            <span className="ml-2 bg-amber-500/10 text-amber-500 text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-bold border border-amber-500/20">Demo Mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900 rounded-full px-3 py-1.5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role:</span>
            <span className="text-slate-200 text-xs font-bold px-1">{getRoleLabel(role)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {authUser ? (
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">{authUser.email}</span>
            <button 
              onClick={logout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-bold transition-colors border border-slate-700"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        ) : (
          !isTestMode && (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded text-xs font-bold transition-colors"
            >
              <LogIn className="w-3 h-3" />
              Sign In
            </button>
          )
        )}
        
        {isTestMode && (
          <>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <button 
              onClick={resetDemo}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-bold transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </>
        )}
      </div>
    </header>
  );
}
