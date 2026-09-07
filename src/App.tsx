/**
 * @license
 * TECXAI - Official Application by TECX Private Limited
 * Website: https://www.tecx.ai
 * Design Theme: Professional Polish
 */

import React, { useState } from 'react';
import { BatteryManagement } from './components/BatteryManagement';
import { RubikCube3D } from './components/RubikCube3D';
import { SliderPuzzle } from './components/SliderPuzzle';
import { AiProcessingHub } from './components/AiProcessingHub';
import { CompanyPortal } from './components/CompanyPortal';
import { AndroidInstallGuide } from './components/AndroidInstallGuide';
import { ProcessingEngine, NotificationToast } from './types';
import {
  Menu,
  X,
  Cpu,
  Cloud,
  BatteryCharging,
  Gamepad2,
  Puzzle,
  Bot,
  Globe,
  Bell,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Share2,
  Download,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'battery' | 'cube' | 'puzzle' | 'hub' | 'company'>('cube');
  const [engine, setEngine] = useState<ProcessingEngine>('local');
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [lastSolveStats, setLastSolveStats] = useState<{ latency: number; tokens: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  const addToast = (toast: Omit<NotificationToast, 'id' | 'timestamp'>) => {
    const newToast: NotificationToast = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleEngine = () => {
    const nextEngine = engine === 'local' ? 'cloud' : 'local';
    setEngine(nextEngine);
    addToast({
      title: nextEngine === 'local' ? 'Local Android Engine Active' : 'TECX Cloud Core Active',
      message:
        nextEngine === 'local'
          ? 'Switched to front-side on-device offline processing. Zero server latency.'
          : 'Switched to TECX cloud server backend (Gemini 3.8 Flash).',
      type: 'ai_info',
    });
  };

  const navItems = [
    {
      id: 'cube',
      label: "3D Rubik's Cube Solver",
      sublabel: 'Local Text AI • Camera • Voice',
      icon: '🎲',
      group: 'local',
      category: 'Local Processing',
      badge: 'Active Update',
    },
    {
      id: 'battery',
      label: 'Battery & Siren System',
      sublabel: 'Decibel alert & range limits',
      icon: '⚡',
      group: 'local',
      category: 'Local Processing',
    },
    {
      id: 'puzzle',
      label: 'Indoor Games (Roadmap)',
      sublabel: 'Next update expansion',
      icon: '🧩',
      group: 'local',
      category: 'Local Processing',
      badge: 'Next Update',
    },
    {
      id: 'hub',
      label: 'Local LLM Matrix Hub',
      sublabel: 'On-device text AI engine',
      icon: '🤖',
      group: 'local',
      category: 'Local Processing',
    },
    {
      id: 'company',
      label: 'TECX Cloud Server Link',
      sublabel: 'Website & portal (Update 2)',
      icon: '☁️',
      group: 'cloud',
      category: 'Cloud Services',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-[#0F172A] hidden md:flex flex-col shrink-0 border-r border-slate-800 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col">
          <h1 className="text-2xl font-bold text-white tracking-tight italic">
            TECX<span className="text-blue-400">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            TECX Private Limited
          </p>
        </div>

        {/* Navigation links grouped */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {/* Local Processing Section */}
          <div className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Local Processing
          </div>
          {navItems
            .filter((item) => item.group === 'local')
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left flex items-center px-6 py-3 transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

          {/* Cloud Services Section */}
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cloud Services
          </div>
          {navItems
            .filter((item) => item.group === 'cloud')
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left flex items-center px-6 py-3 transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Install & Share CTA in Sidebar */}
        <div className="px-4 py-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            id="btn-sidebar-install"
            onClick={() => setInstallGuideOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition shadow-xs"
            title="Install locally on Android, share via WhatsApp or prepare for Google Play Store"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Install / Share App</span>
          </button>

          <a
            id="btn-sidebar-download-zip"
            href="/tecxai-source-code.zip"
            download="tecxai-source-code.zip"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-bold transition shadow-xs"
            title="Download full project code as ZIP for GitHub"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Code (.ZIP)</span>
          </a>
        </div>

        {/* Edge Processing Status Pill in Sidebar */}
        <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              {engine === 'local' ? 'Edge Processing Active' : 'Cloud Node Connected'}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>LLM: {engine === 'local' ? 'Llama-3-Local-v1' : 'Gemini-3.8-Flash'}</span>
            <button
              onClick={toggleEngine}
              className="text-[10px] text-blue-400 hover:underline cursor-pointer"
            >
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight italic">
              TECX<span className="text-blue-400">AI</span>
            </h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              v1.0
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="btn-mobile-download-zip"
              href="/tecxai-source-code.zip"
              download="tecxai-source-code.zip"
              className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 font-bold active:scale-95 transition"
              title="Download full project code as ZIP for GitHub"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </a>

            <button
              id="btn-mobile-install"
              onClick={() => setInstallGuideOpen(true)}
              className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-bold active:scale-95 transition"
              title="Install on Android & Share on WhatsApp"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              onClick={toggleEngine}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{engine === 'local' ? 'Local' : 'Cloud'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-3 flex flex-col gap-1.5 z-30 shadow-xl animate-in slide-in-from-top-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 py-1">
              Navigation
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm text-left ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-2 mt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setInstallGuideOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-sm font-bold active:scale-98 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Download & Share (WhatsApp)</span>
                </span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-extrabold">
                  FREE
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Main Scrollable Dashboard */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">
          {/* Top Command Center Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Command Center</h2>
              <p className="text-slate-500 text-sm">
                Managing local Android assets, decibel siren alerts, and on-device optimization.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end sm:self-center">
              <button
                id="btn-open-install-guide"
                onClick={() => setInstallGuideOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                title="Open Install & WhatsApp Sharing guide"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install & Share (WhatsApp)</span>
              </button>

              <button
                id="btn-switch-engine-header"
                onClick={toggleEngine}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition active:scale-95 shadow-xs"
                title="Toggle Local vs Cloud Engine"
              >
                {engine === 'local' ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Core: Local Android (Offline)</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>Core: TECX Cloud (Gemini)</span>
                  </>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Device Status</p>
                <p className="text-sm font-semibold text-slate-700">Android Optimized</p>
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 border border-blue-200 shadow-xs">
                TX
              </div>
            </div>
          </header>

          {/* Active View Container */}
          <div className="flex-1">
            {activeTab === 'battery' && (
              <BatteryManagement onTriggerNotification={addToast} />
            )}

            {activeTab === 'cube' && (
              <RubikCube3D
                engine={engine}
                onEngineChange={(newEng) => {
                  setEngine(newEng);
                  addToast({
                    title: 'Puzzle Engine Updated',
                    message: `Active solver set to ${
                      newEng === 'local' ? 'Local Android Core' : 'TECX Cloud Core'
                    }`,
                    type: 'ai_info',
                  });
                }}
                onSolveFinish={(stats) => {
                  setLastSolveStats(stats);
                  addToast({
                    title: 'TECX AI Solve Complete',
                    message: `Computed optimal solution sequence in ${stats.latency}ms (${stats.tokens} tokens processed).`,
                    type: 'ai_info',
                  });
                }}
                onTriggerNotification={addToast}
              />
            )}

            {activeTab === 'puzzle' && (
              <SliderPuzzle engine={engine} />
            )}

            {activeTab === 'hub' && (
              <AiProcessingHub
                engine={engine}
                onEngineChange={(newEng) => {
                  setEngine(newEng);
                  addToast({
                    title: 'Core Engine Toggled',
                    message: `Active compute: ${
                      newEng === 'local' ? 'Local Android Core' : 'TECX Cloud Core'
                    }`,
                    type: 'ai_info',
                  });
                }}
                lastSolveStats={lastSolveStats}
              />
            )}

            {activeTab === 'company' && (
              <CompanyPortal engine={engine} />
            )}
          </div>

          {/* Dashboard Footer Note */}
          <footer className="pt-2 pb-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">TECXAI v1.0</span>
              <span>•</span>
              <span>TECX Private Limited</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://www.tecx.ai"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium transition underline underline-offset-2"
              >
                www.tecx.ai
              </a>
              <span>•</span>
              <span className="text-slate-500">Update 1 (Local Mobile Launch)</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Android Toast Notification Stack */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-2xl bg-white border border-slate-200 p-4 shadow-xl flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5 border border-blue-100">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">{t.title}</h5>
                  <p className="text-slate-600 mt-0.5 leading-snug">{t.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {t.timestamp}
                  </span>
                </div>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Android Installation, WhatsApp Sharing & APK Guide Modal */}
      <AndroidInstallGuide
        isOpen={installGuideOpen}
        onClose={() => setInstallGuideOpen(false)}
      />
    </div>
  );
}
