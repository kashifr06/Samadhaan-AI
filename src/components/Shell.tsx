import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../context/AppContext';
import { AlertCircle, X, Loader2 } from 'lucide-react';

export function Shell() {
  const { error, clearError, isLoading } = useAppContext();
  return (
    <div className="flex h-screen w-full bg-[#0B0E14] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 bg-[#0B0E14]">
        <Header />
        {isLoading && (
          <div className="h-1 bg-[#0B0E14] w-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-8 mb-0 flex items-start justify-between rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
