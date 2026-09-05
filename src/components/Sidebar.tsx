import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  LayoutDashboard, 
  CheckSquare, 
  CheckCircle,
  GraduationCap,
  Briefcase,
  Users,
  Building2,
  Handshake,
  BarChart3
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { Role } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const roleNavMap: Record<Role, NavItem[]> = {
  Citizen: [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Report Problem', path: '/report', icon: FileText },
    { label: 'My Reports', path: '/reports', icon: ClipboardList },
  ],
  Government: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Problem Validation', path: '/validation', icon: CheckSquare },
    { label: 'Validated Problems', path: '/validated', icon: CheckCircle },
    { label: 'Project Oversight', path: '/projects', icon: Briefcase },
  ],
  University: [
    { label: 'Opportunities', path: '/', icon: GraduationCap },
    { label: 'Projects', path: '/projects', icon: Briefcase },
  ],
  Industry: [
    { label: 'Opportunities', path: '/', icon: Building2 },
    { label: 'Collaborations', path: '/projects', icon: Handshake },
  ]
};

const sharedNav: NavItem[] = [
  { label: 'Impact', path: '/impact', icon: BarChart3 }
];

export function Sidebar() {
  const { role } = useAppContext();
  const navItems = roleNavMap[role];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col h-full p-5 shrink-0">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center font-bold text-slate-900 shrink-0">
          S
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-white">SAMADHAAN <span className="text-cyan-400">AI</span></span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 px-3">
            {role} Access
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  isActive 
                    ? "bg-slate-800 text-cyan-400 border border-cyan-900/50" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )
              }
            >
              <div className="w-4 h-4 rounded-sm border border-current flex items-center justify-center">
                <item.icon className="w-3 h-3" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 px-3">
            Global
          </p>
          {sharedNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  isActive 
                    ? "bg-slate-800 text-cyan-400 border border-cyan-900/50" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )
              }
            >
              <div className="w-4 h-4 rounded-sm border border-current flex items-center justify-center">
                <item.icon className="w-3 h-3" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
            D
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">{role} User</p>
            <p className="text-[10px] text-slate-500">Demo Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
