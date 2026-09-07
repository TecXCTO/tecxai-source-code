import React, { useState } from 'react';
import {
  Building2,
  Globe,
  ExternalLink,
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Smartphone,
  Server,
} from 'lucide-react';
import { ProcessingEngine } from '../types';

interface CompanyPortalProps {
  engine: ProcessingEngine;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({ engine }) => {
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am TECXAI, your intelligent assistant by TECX Private Limited. Ask me about battery preservation strategies, our dual local/cloud AI architecture, or 3D Rubik\'s cube algorithms!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isQueryLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsQueryLoading(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          batteryStats: { level: 85, charging: true, highThreshold: 100, lowThreshold: 15 },
          currentMode: engine,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'TECX AI systems operational.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'TECX Local Engine: Battery protection active. Maintain charge between 20% and 80% to avoid anode stress and increase cycle life.',
        },
      ]);
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <div id="company-portal" className="flex flex-col gap-6">
      {/* Company Header Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm shrink-0">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                TECX Private Limited
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                AI Innovations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pioneering hybrid front-side mobile on-device neural processing and high-scale cloud intelligence.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://www.tecx.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold text-xs border border-slate-200 transition shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>https://www.tecx.ai</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span className="text-xs text-slate-500">Application: <strong className="text-slate-800">TECXAI</strong></span>
            </div>
          </div>
        </div>

        <div className="z-10 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5 min-w-[200px]">
          <span className="text-slate-500 font-medium">Headquarters & Architecture</span>
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            Android Edge + Cloud Node
          </span>
          <span className="text-[11px] text-emerald-600 font-mono font-bold">
            Active Core: {engine.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Product Roadmap: Update 1 vs Update 2 */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Milestone className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-base">
            TECXAI Strategic Launch & Release Roadmap
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Update 1 (Live) */}
          <div className="rounded-xl bg-blue-50/40 border-2 border-blue-500 p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                Current Release • Update 1
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live in App
              </span>
            </div>

            <h4 className="font-bold text-slate-800 text-sm">
              Android Local Processing & Customization Core
            </h4>

            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-800">Battery Management System (BMS)</strong>: Real-time battery monitoring with custom high (100% full charge) and low thresholds.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-800">Decibel Loud Siren Alert</strong>: Web Audio synthesized emergency tones triggering on charging, discharging, or both states.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-800">3D Rubik's Cube & AI Solver</strong>: Interactive 3D cube with CFOP step-by-step guidance powered by on-device LLM & cloud fallback.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-800">Android Customization</strong>: Power saving profiles, screen wake lock, and hardware vibration signals.
                </span>
              </li>
            </ul>
          </div>

          {/* Update 2 (Upcoming) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase tracking-wider">
                Next Stage • Update 2
              </span>
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> In Development
              </span>
            </div>

            <h4 className="font-bold text-slate-800 text-sm">
              Website & Cloud Server Back-End Infrastructure
            </h4>

            <ul className="text-xs text-slate-500 space-y-2.5">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-700">Cloud Platform Launch</strong>: Full web application and enterprise dashboard at <code className="text-slate-700 font-semibold">https://www.tecx.ai</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-700">Distributed Cloud Processing</strong>: High-capacity back-end LLM processing cluster with distributed multi-device synchronization.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-700">Vision-Based Camera Solver</strong>: Scan physical Rubik's cube with Android camera to solve in under 20 moves.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* TECX AI Advisor Chat Widget */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              TECX AI Technical Advisor
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Powered by {engine === 'local' ? 'Android Local LLM' : 'TECX Cloud Gemini'}
          </span>
        </div>

        {/* Message Thread */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 max-h-60 overflow-y-auto flex flex-col gap-3 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <div
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isQueryLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>TECX AI is formulating advice...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            id="input-tecx-advisor"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about battery health, 100% charging alarms, or Rubik's cube..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
          />
          <button
            type="submit"
            id="btn-send-advisor"
            disabled={!inputQuery.trim() || isQueryLoading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
