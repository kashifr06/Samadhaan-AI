import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Shell() {
  return (
    <div className="flex h-screen w-full bg-[#0B0E14] text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 bg-[#0B0E14]">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
