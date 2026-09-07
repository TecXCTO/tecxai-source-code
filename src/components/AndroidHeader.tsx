import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Signal,
  BatteryCharging,
  Battery,
  Cpu,
  Cloud,
  Shield,
  ExternalLink,
  Volume2,
  Bell,
  X,
} from 'lucide-react';
import { ProcessingEngine, NotificationToast } from '../types';

interface AndroidHeaderProps {
  activeTab: 'battery' | 'cube' | 'puzzle' | 'hub' | 'company';
  setActiveTab: (tab: 'battery' | 'cube' | 'puzzle' | 'hub' | 'company') => void;
  engine: ProcessingEngine;
  onToggleEngine: () => void;
  batteryLevel?: number;
  isCharging?: boolean;
  toasts: NotificationToast[];
  onDismissToast: (id: string) => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  activeTab,
  setActiveTab,
  engine,
  onToggleEngine,
  batteryLevel = 80,
  isCharging = true,
  toasts,
  onDismissToast,
}) => {
  const [currentTime, setCurrentTime] = useState('10:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Android System Status Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900">
        <span className="font-semibold text-slate-200">{currentTime}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-cyan-400 font-bold tracking-wider">TECX-OS</span>
          <Wifi className="w-3 h-3 text-slate-300" />
          <Signal className="w-3 h-3 text-slate-300" />
          <div className="flex items-center gap-1 font-semibold text-slate-200">
            <span>{batteryLevel}%</span>
            {isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            )}
          </div>
        </div>
      </div>

      {/* App Branding & Quick Core Switcher */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-cyan-500/20">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base text-white tracking-tight">
                TECXAI
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              TECX Private Limited • <a href="https://www.tecx.ai" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">tecx.ai</a>
            </p>
          </div>
        </div>

        {/* Engine Toggle Pill */}
        <button
          id="btn-header-engine-toggle"
          onClick={onToggleEngine}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition active:scale-95 shadow-sm ${
            engine === 'local'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
          }`}
          title="Click to toggle Local Android Engine vs TECX Cloud Engine"
        >
          {engine === 'local' ? (
            <>
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Local Android Core (Offline)</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>TECX Cloud Core (Gemini)</span>
            </>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 text-xs">
        <button
          id="tab-battery"
          onClick={() => setActiveTab('battery')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'battery'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BatteryCharging className="w-3.5 h-3.5" />
          <span>Battery & Alerts</span>
        </button>

        <button
          id="tab-cube"
          onClick={() => setActiveTab('cube')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'cube'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span className="text-sm">🎲</span>
          <span>3D Rubik's Cube & AI</span>
        </button>

        <button
          id="tab-puzzle"
          onClick={() => setActiveTab('puzzle')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'puzzle'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span className="text-sm">🧩</span>
          <span>Slide Puzzle</span>
        </button>

        <button
          id="tab-hub"
          onClick={() => setActiveTab('hub')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'hub'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Engine Hub</span>
        </button>

        <button
          id="tab-company"
          onClick={() => setActiveTab('company')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'company'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>TECX Portal & Roadmap</span>
        </button>
      </div>

      {/* Floating Android Toast Notification Stack */}
      {toasts.length > 0 && (
        <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-xl bg-slate-900/95 border border-cyan-500/40 p-3 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-100">{t.title}</h5>
                  <p className="text-slate-300 mt-0.5 leading-snug">{t.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {t.timestamp}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDismissToast(t.id)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
