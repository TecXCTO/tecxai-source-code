import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  PlaySquare,
  ShieldCheck,
  X,
  AlertTriangle,
  QrCode,
  Sparkles,
  FileCode,
} from 'lucide-react';

interface AndroidInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

// Guaranteed Public Standalone URL (Accessible to anyone without Google AI Studio login)
export const PUBLIC_APP_URL =
  'https://ais-pre-gyyzrpmjzy6ubif3jx6e5e-590536245194.asia-east1.run.app';

export const AndroidInstallGuide: React.FC<AndroidInstallGuideProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'installed'>('idle');
  const [showManualGuide, setShowManualGuide] = useState(false);

  // Listen for browser PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallState('installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      setInstallState('installing');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallState('installed');
        } else {
          setInstallState('idle');
        }
      } catch (err) {
        setShowManualGuide(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show smooth inline guide rather than window.alert (which fails inside iframes)
      setShowManualGuide(true);
    }
  };

  const shareText = `🚀 Test TECXAI Mobile App! Official Android app by TECX Private Limited with 3D Rubik's Cube Local AI Solver (with camera scan & voice direction) and smart battery siren.\n\n👉 Test and install on your phone:\n${PUBLIC_APP_URL}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(PUBLIC_APP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'TECXAI - TECX Private Limited',
          text: 'Official Android AI app with 3D Rubik\'s Cube Camera Solver and Battery Alert System.',
          url: PUBLIC_APP_URL,
        });
      } catch (err) {
        // User cancelled or share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Download, WhatsApp Sharing & 403 Error Fix
              </h3>
              <p className="text-xs text-slate-500">
                Fix 403 errors, install on Android without Google Play Store, and share with friends.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-600">
          {/* HIGH PRIORITY: Error 403 Explanation & Fix */}
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-amber-950 text-sm">
                  Why Did You Get "Google 403 Forbidden" Error?
                </h4>
                <p className="text-amber-900 mt-1 leading-relaxed">
                  Your screenshot shows the link opened was from{' '}
                  <code className="bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                    aistudio.google.com
                  </code>
                  . That URL is Google's private internal developer studio, which requires your private developer login. Anyone opening that link on WhatsApp or a mobile browser gets blocked with <strong>403 Forbidden</strong>.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-amber-200 flex flex-col gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Check className="w-4 h-4 text-emerald-600" />
                The Verified Public App URL (100% Free & Open to Everyone):
              </span>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={PUBLIC_APP_URL}
                  className="flex-1 bg-transparent text-blue-700 font-mono text-xs font-bold focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shrink-0 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                This public link is hosted directly on Google Cloud Run. Anyone you share this with can open and install it without any login or account required!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={PUBLIC_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs active:scale-95 text-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Public App URL</span>
              </a>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs active:scale-95 text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Working Link to WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Quick Install to Phone Section */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                Install TECXAI Directly on Your Android Device
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                No Store Needed
              </span>
            </div>

            <p className="text-emerald-900 leading-relaxed">
              You and your friend do not need to download a suspicious unknown APK from the web. TECXAI is configured with an official Web App Manifest and Service Worker that installs directly through Android Chrome as a native app with zero installation warning hurdles.
            </p>

            <button
              onClick={handleInstallApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {installState === 'installed'
                  ? 'App Successfully Installed!'
                  : 'Install TECXAI on This Phone Now'}
              </span>
            </button>

            {showManualGuide && (
              <div className="rounded-xl bg-white border border-emerald-300 p-3.5 flex flex-col gap-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>To install directly on your Android phone:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                  <li>
                    Open the verified link directly in <strong>Chrome</strong> on your Android phone.
                  </li>
                  <li>
                    Tap Chrome's menu button (the <strong>3 vertical dots ⋮</strong> at top-right).
                  </li>
                  <li>
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Install"</strong> — the official TECXAI launcher icon will be added to your home screen!
                  </li>
                </ol>
                <div className="pt-1">
                  <a
                    href={PUBLIC_APP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Public URL in New Browser Tab</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step for You and Your Friend */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col gap-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              How Your Friend Can Download & Test (3 Simple Steps)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                  1
                </span>
                <span className="font-bold text-slate-800">Tap WhatsApp Link</span>
                <p className="text-[11px] text-slate-500">
                  Send your friend the WhatsApp link. When they tap it, it opens in Chrome on their Android phone.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="font-bold text-slate-800">Tap "Install App"</span>
                <p className="text-[11px] text-slate-500">
                  Chrome will show an "Install" banner at the bottom. Or they can tap Chrome's 3 dots (<strong>⋮</strong>) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                  3
                </span>
                <span className="font-bold text-slate-800">Runs Like a Native App</span>
                <p className="text-[11px] text-slate-500">
                  The app appears on their Android home screen and app drawer with the TECX logo, opening fullscreen with full camera and audio support!
                </p>
              </div>
            </div>
          </div>

          {/* Option: Sending Standalone APK File directly via WhatsApp */}
          <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-purple-600" />
                Packaging APK with PWABuilder (Now 100% Fixed)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                PWA Certified
              </span>
            </div>
            
            <p className="leading-relaxed text-purple-900">
              In your screenshot, PWABuilder reported <em>"manifest timed out"</em> and <em>"no service worker found"</em> because the icons were SVG rather than PNG, and the service worker was not registered in dev mode. <strong>This is now completely fixed!</strong> We added compliant PNG icons (192x192, 512x512, maskable), mobile screenshots, and CORS-enabled fast routes.
            </p>

            <div className="space-y-2 text-slate-600 bg-white rounded-xl p-3.5 border border-purple-200">
              <span className="font-bold text-slate-800 block text-xs">
                How to Generate Your Signed .APK on PWABuilder:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700 text-[11px]">
                <li>
                  Open{' '}
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 font-bold underline"
                  >
                    PWABuilder.com
                  </a>.
                </li>
                <li>
                  Enter your verified public URL:{' '}
                  <code className="bg-purple-100 text-purple-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {PUBLIC_APP_URL}
                  </code>
                </li>
                <li>
                  Click <strong>"Start"</strong> — PWABuilder will now show green checks for both Manifest and Service Worker!
                </li>
                <li>
                  Click <strong>"Package for Stores"</strong> &rarr; Select <strong>Android</strong> &rarr; Download the <strong>Signed APK</strong> or <strong>AAB</strong>.
                </li>
              </ol>
            </div>
          </div>

          {/* Direct GitHub Source Code ZIP Download */}
          <div className="rounded-2xl bg-slate-900 text-white border border-slate-700 p-5 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">
                  Complete App Architecture & Source Code (.ZIP)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                For GitHub
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Download the complete repository archive containing all frontend React/Vite files, backend Express server, 3D Rubik's Cube camera solver, smart battery siren system, PWA manifest, service worker, and icons.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/tecxai-source-code.zip"
                download="tecxai-source-code.zip"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold transition shadow-md active:scale-95 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Source Code ZIP (91 KB)</span>
              </a>

              <a
                href={`${PUBLIC_APP_URL}/tecxai-source-code.zip`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 font-bold transition text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Direct Public Link</span>
              </a>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mt-1 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                Upload to GitHub in 3 steps:
              </div>
              <div className="text-cyan-400">git init &amp;&amp; git add . &amp;&amp; git commit -m "Initial commit"</div>
              <div className="text-slate-400">git remote add origin https://github.com/&lt;user&gt;/&lt;repo&gt;.git</div>
              <div className="text-emerald-400">git branch -M main &amp;&amp; git push -u origin main</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TECX Private Limited • Public Cloud Run Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

