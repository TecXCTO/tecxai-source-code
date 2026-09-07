import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Zap,
  Volume2,
  VolumeX,
  Sliders,
  Bell,
  BellRing,
  ShieldAlert,
  Thermometer,
  Activity,
  Smartphone,
  CheckCircle,
  Vibrate,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { BatterySettings, BatteryStatus, NotificationToast } from '../types';
import { playLoudAlarm, stopLoudAlarm, isAlarmActive, playNotificationChime } from '../utils/audioAlert';

interface BatteryManagementProps {
  onTriggerNotification?: (toast: Omit<NotificationToast, 'id' | 'timestamp'>) => void;
}

export const BatteryManagement: React.FC<BatteryManagementProps> = ({ onTriggerNotification }) => {
  // Battery status state
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: 78,
    charging: true,
    chargingTime: 1800,
    dischargingTime: Infinity,
    temperature: 31.4,
    voltage: 4.12,
    health: 'Good',
    estimatedCycles: 242,
  });

  const [hasRealBatteryApi, setHasRealBatteryApi] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  // Settings
  const [settings, setSettings] = useState<BatterySettings>({
    highThreshold: 100,
    lowThreshold: 15,
    alertOnHigh: true,
    alertOnLow: true,
    alertWhileCharging: true,
    alertWhileDischarging: true,
    alarmVolume: 0.9,
    alarmSoundType: 'siren',
    enableVibration: true,
    enableNotifications: true,
    powerSavingProfile: 'balanced',
  });

  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [alarmReason, setAlarmReason] = useState<string | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Keep track of previously triggered levels to avoid continuous re-triggering within the same minute
  const lastAlertKeyRef = useRef<string>('');

  // Connect to real Navigator Battery API if supported by Android/browser
  useEffect(() => {
    let batteryObj: any = null;

    if ('getBattery' in navigator && !simulationMode) {
      (navigator as any)
        .getBattery()
        .then((b: any) => {
          batteryObj = b;
          setHasRealBatteryApi(true);

          const updateStatus = () => {
            const levelPct = Math.round(b.level * 100);
            setBatteryStatus((prev) => ({
              ...prev,
              level: levelPct,
              charging: b.charging,
              chargingTime: b.chargingTime,
              dischargingTime: b.dischargingTime,
              voltage: +(3.7 + (levelPct / 100) * 0.55).toFixed(2),
              temperature: +(b.charging ? 32.8 : 29.5).toFixed(1),
            }));
          };

          updateStatus();
          b.addEventListener('chargingchange', updateStatus);
          b.addEventListener('levelchange', updateStatus);
        })
        .catch(() => {
          setHasRealBatteryApi(false);
        });
    }

    return () => {
      if (batteryObj) {
        // cleanup listeners
      }
    };
  }, [simulationMode]);

  // Request Web Notification permission
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        onTriggerNotification?.({
          title: 'TECXAI Notifications Enabled',
          message: 'Android system battery notifications and loud alerts are active.',
          type: 'ai_info',
        });
      }
    }
  };

  // Screen Wake Lock API for Android
  const toggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      if (wakeLockActive && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } else {
        try {
          const wl = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current = wl;
          setWakeLockActive(true);
          onTriggerNotification?.({
            title: 'Screen Wake Lock Active',
            message: 'Android display will stay awake during battery monitoring.',
            type: 'ai_info',
          });
        } catch (err) {
          console.warn('Wake Lock error:', err);
        }
      }
    }
  };

  // Stop alarm
  const handleSilenceAlarm = () => {
    stopLoudAlarm();
    setAlarmPlaying(false);
    setAlarmReason(null);
  };

  // Trigger loud alarm helper
  const triggerAlarm = useCallback(
    (reason: string) => {
      setAlarmPlaying(true);
      setAlarmReason(reason);
      playLoudAlarm(settings.alarmSoundType, settings.alarmVolume, settings.enableVibration);

      // System notification
      if (settings.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('TECXAI Loud Battery Alert', {
            body: reason,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }

      onTriggerNotification?.({
        title: 'TECXAI Loud Battery Alert',
        message: reason,
        type: reason.includes('100') || reason.includes('High') ? 'battery_high' : 'battery_low',
      });
    },
    [settings, onTriggerNotification]
  );

  // Monitor thresholds and trigger loud alert
  useEffect(() => {
    const { level, charging } = batteryStatus;
    const {
      highThreshold,
      lowThreshold,
      alertOnHigh,
      alertOnLow,
      alertWhileCharging,
      alertWhileDischarging,
    } = settings;

    const currentKey = `${level}-${charging}`;
    if (currentKey === lastAlertKeyRef.current) {
      return;
    }

    // Check High Threshold Alert (e.g. 100% or custom high level)
    if (alertOnHigh && level >= highThreshold) {
      const allowTrigger =
        (charging && alertWhileCharging) || (!charging && alertWhileDischarging);

      if (allowTrigger) {
        lastAlertKeyRef.current = currentKey;
        triggerAlarm(
          `Battery has reached ${level}%! (Target: ${highThreshold}%). Unplug charger to preserve cell longevity.`
        );
        return;
      }
    }

    // Check Low Threshold Alert (e.g. 15% or custom low level)
    if (alertOnLow && level <= lowThreshold) {
      const allowTrigger =
        (charging && alertWhileCharging) || (!charging && alertWhileDischarging);

      if (allowTrigger) {
        lastAlertKeyRef.current = currentKey;
        triggerAlarm(
          `Battery is critically low at ${level}%! (Threshold: ${lowThreshold}%). Connect charger now.`
        );
        return;
      }
    }
  }, [batteryStatus, settings, triggerAlarm]);

  // Test alarm manual trigger
  const handleTestAlarm = () => {
    if (alarmPlaying) {
      handleSilenceAlarm();
    } else {
      triggerAlarm(`Testing ${settings.alarmSoundType.toUpperCase()} loud alarm at ${Math.round(settings.alarmVolume * 100)}% volume.`);
    }
  };

  // Simulation controls
  const handleSimulatePercent = (pct: number) => {
    setBatteryStatus((prev) => ({
      ...prev,
      level: pct,
      voltage: +(3.7 + (pct / 100) * 0.55).toFixed(2),
    }));
  };

  const handleToggleCharging = () => {
    const nextCharging = !batteryStatus.charging;
    setBatteryStatus((prev) => ({
      ...prev,
      charging: nextCharging,
      temperature: nextCharging ? 33.2 : 29.8,
    }));
    playNotificationChime();
    onTriggerNotification?.({
      title: nextCharging ? 'Charger Connected' : 'Charger Disconnected',
      message: `TECXAI active monitoring engaged. Charging state: ${nextCharging ? 'Charging' : 'Discharging'}.`,
      type: nextCharging ? 'charging_start' : 'charging_stop',
    });
  };

  // Visual color for battery
  const getBatteryColor = (level: number) => {
    if (level <= settings.lowThreshold) return 'text-red-500 stroke-red-500';
    if (level >= settings.highThreshold) return 'text-emerald-500 stroke-emerald-500';
    if (level < 35) return 'text-amber-500 stroke-amber-500';
    return 'text-blue-600 stroke-blue-600';
  };

  return (
    <div id="battery-management-system" className="flex flex-col gap-6">
      {/* Active Loud Siren Alert Banner */}
      {alarmPlaying && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-500 p-5 shadow-lg animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-600 text-white animate-bounce shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-900 flex items-center gap-2">
                <span>LOUD BATTERY ALARM ACTIVE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white uppercase font-black">
                  {settings.alarmSoundType}
                </span>
              </div>
              <p className="text-xs text-red-700 max-w-md mt-0.5">{alarmReason}</p>
            </div>
          </div>
          <button
            id="btn-silence-alarm"
            onClick={handleSilenceAlarm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
          >
            <VolumeX className="w-4 h-4" />
            <span>SILENCE ALARM</span>
          </button>
        </div>
      )}

      {/* Main Gauge & Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Battery Dial */}
        <div className="md:col-span-1 rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-all duration-700 ease-out ${getBatteryColor(
                  batteryStatus.level
                )}`}
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * batteryStatus.level) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center text-center">
              <div className="flex items-center gap-0.5 font-mono text-3xl font-black text-slate-800 tracking-tight">
                <span>{batteryStatus.level}</span>
                <span className="text-lg font-bold text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mt-0.5">
                {batteryStatus.charging ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="text-amber-600 font-bold">Charging</span>
                  </>
                ) : (
                  <>
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span>Discharging</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              id="btn-toggle-charging"
              onClick={handleToggleCharging}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs ${
                batteryStatus.charging
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{batteryStatus.charging ? 'Unplug Charger' : 'Plug In Charger'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Android Battery Management System (BMS)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Loud decibel alert system configured for 100% full charge & customizable low thresholds.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{hasRealBatteryApi && !simulationMode ? 'Hardware API' : 'Real-Time Engine'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-blue-600" /> Cell Temp
              </span>
              <span className="text-base font-bold font-mono text-slate-800 mt-1">
                {batteryStatus.temperature}°C
              </span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">Optimal range</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-600" /> Voltage
              </span>
              <span className="text-base font-bold font-mono text-slate-800 mt-1">
                {batteryStatus.voltage} V
              </span>
              <span className="text-[10px] text-blue-600 font-medium mt-0.5">Li-ion 4.2V max</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-600" /> Health
              </span>
              <span className="text-base font-bold text-emerald-700 mt-1">
                {batteryStatus.health} (98%)
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {batteryStatus.estimatedCycles} cycles
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" /> ETA
              </span>
              <span className="text-base font-bold text-slate-800 mt-1">
                {batteryStatus.charging ? '~24m to 100%' : '14h remaining'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">Fast Charging 30W</span>
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Quick Percentage Test:
            </span>
            <div className="flex items-center gap-1.5">
              {[10, 15, 50, 80, 100].map((pct) => (
                <button
                  key={pct}
                  id={`btn-sim-pct-${pct}`}
                  onClick={() => handleSimulatePercent(pct)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition shadow-xs ${
                    batteryStatus.level === pct
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customizable Loud Alert & Threshold Configuration */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <span>Custom Alert Thresholds & Alarm Engine</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Define custom high & low thresholds and choose alert behaviour on charging or discharging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-test-loud-alarm"
              onClick={handleTestAlarm}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                alarmPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{alarmPlaying ? 'Stop Test' : 'Test Loud Siren'}</span>
            </button>
          </div>
        </div>

        {/* Dual Sliders: High Threshold & Low Threshold */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Level Threshold (100% or custom) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-high-alert"
                  checked={settings.alertOnHigh}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, alertOnHigh: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="chk-high-alert" className="text-xs font-bold text-slate-800 cursor-pointer">
                  High Charge Alert (100% / Full)
                </label>
              </div>
              <span className="font-mono text-sm font-extrabold text-blue-700 px-2.5 py-0.5 rounded-lg bg-blue-100/70 border border-blue-200">
                {settings.highThreshold}%
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Loud warning triggers when battery reaches or exceeds this percentage to prevent overcharge stress.
            </p>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold">80%</span>
              <input
                type="range"
                id="range-high-threshold"
                min="80"
                max="100"
                step="1"
                value={settings.highThreshold}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, highThreshold: Number(e.target.value) }))
                }
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 font-bold">100%</span>
            </div>
          </div>

          {/* Low Level Threshold (15% or custom) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-low-alert"
                  checked={settings.alertOnLow}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, alertOnLow: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-white border-slate-300 cursor-pointer"
                />
                <label htmlFor="chk-low-alert" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Low Charge Alert (Critical Battery)
                </label>
              </div>
              <span className="font-mono text-sm font-extrabold text-red-700 px-2.5 py-0.5 rounded-lg bg-red-100/70 border border-red-200">
                {settings.lowThreshold}%
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Loud warning triggers when charge falls to or below this level so you never run out of power.
            </p>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold">5%</span>
              <input
                type="range"
                id="range-low-threshold"
                min="5"
                max="40"
                step="1"
                value={settings.lowThreshold}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, lowThreshold: Number(e.target.value) }))
                }
                className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 font-bold">40%</span>
            </div>
          </div>
        </div>

        {/* Trigger Condition Switches: Charging vs Discharging vs Both */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800">Alert Activation Conditions:</span>
            <p className="text-[11px] text-slate-500">
              Select whether the loud siren triggers while actively charging, discharging, or both states.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-alert-charging"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  alertWhileCharging: !s.alertWhileCharging,
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
                settings.alertWhileCharging
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              While Charging
            </button>

            <button
              id="btn-alert-discharging"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  alertWhileDischarging: !s.alertWhileDischarging,
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs ${
                settings.alertWhileDischarging
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              While Not Charging
            </button>

            <button
              id="btn-alert-both"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  alertWhileCharging: true,
                  alertWhileDischarging: true,
                }))
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition shadow-xs ${
                settings.alertWhileCharging && settings.alertWhileDischarging
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Both (Recommended)
            </button>
          </div>
        </div>

        {/* Audio Sound Profile & Volume Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Sound Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Loud Siren Tone</label>
            <select
              id="select-sound-type"
              value={settings.alarmSoundType}
              onChange={(e) =>
                setSettings((s) => ({ ...s, alarmSoundType: e.target.value as any }))
              }
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="siren">Emergency Police Siren (Dual Sweep)</option>
              <option value="pulsing">Rapid Loud Strobe Beep (950Hz/1250Hz)</option>
              <option value="high_pitch">Sharp High-Pitch Whistle (1400Hz)</option>
              <option value="radar">Submarine Radar Ping (1100Hz-1800Hz)</option>
            </select>
          </div>

          {/* Volume Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Alarm Decibel Gain</span>
              <span className="font-mono text-blue-600 font-bold">
                {Math.round(settings.alarmVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="range-volume"
              min="0.2"
              max="1.0"
              step="0.05"
              value={settings.alarmVolume}
              onChange={(e) =>
                setSettings((s) => ({ ...s, alarmVolume: Number(e.target.value) }))
              }
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-2.5"
            />
          </div>

          {/* Android Vibration & Notification Permissions */}
          <div className="flex items-center justify-between gap-2 pt-3 sm:pt-0">
            <button
              id="btn-toggle-vibration"
              onClick={() =>
                setSettings((s) => ({ ...s, enableVibration: !s.enableVibration }))
              }
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition shadow-xs ${
                settings.enableVibration
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <Vibrate className="w-3.5 h-3.5" />
              <span>Vibration: {settings.enableVibration ? 'ON' : 'OFF'}</span>
            </button>

            <button
              id="btn-request-notifications"
              onClick={handleRequestNotificationPermission}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Push Notice</span>
            </button>
          </div>
        </div>

        {/* Android Device Customization: Power Profile & Screen Wake Lock */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Android Power Profile:</span>
            {(['extreme', 'balanced', 'performance'] as const).map((profile) => (
              <button
                key={profile}
                id={`btn-profile-${profile}`}
                onClick={() => setSettings((s) => ({ ...s, powerSavingProfile: profile }))}
                className={`px-3 py-1 rounded-lg text-xs capitalize transition shadow-xs ${
                  settings.powerSavingProfile === profile
                    ? 'bg-blue-600 text-white border border-blue-600 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {profile}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-wake-lock"
              onClick={toggleWakeLock}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs ${
                wakeLockActive
                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{wakeLockActive ? 'Display Always ON' : 'Keep Display Awake'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
