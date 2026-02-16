"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "DASHBOARD",
      items: [
        { name: "Market Overview", path: "/", icon: "📈" },
        { name: "Gap Analysis", path: "/#gap", icon: "📊" },
      ]
    },
    {
      title: "INTELLIGENCE",
      items: [
        { name: "Archi Analyst ", path: "/analyst", icon: "🧠" },
        { name: "Reports", path: "/reports", icon: "📑" },
      ]
    }
  ];

  return (
    // UBAH BACKGROUND DISINI: dari bg-[#0b1121] menjadi bg-[#020617]
    <aside className="w-72 bg-[#020617] border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0 shadow-2xl z-50">
      
      {/* 1. Logo Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-lg">💠</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">
              Archi<span className="text-blue-500">Gold</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Enterprise Terminal</p>
          </div>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold">{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_currentColor]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Data Source Status */}
        <div className="px-4">
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Active Data Feeds</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-300">Yahoo Finance (Gold)</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-bold">LIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-300">Yahoo Finance (ARCI)</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User Profile / Footer */}
      {/* UBAH BACKGROUND DISINI: dari bg-[#0b1121] menjadi bg-[#020617] agar seamless */}
      <div className="p-4 border-t border-slate-800 bg-[#020617]">
        <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-800 group-hover:border-blue-500 transition-colors">

          </div>
        </button>
      </div>
      
    </aside>
  );
}