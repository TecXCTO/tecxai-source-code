export type ProcessingEngine = 'local' | 'cloud';

export interface BatterySettings {
  highThreshold: number; // e.g. 100 or custom 80-100
  lowThreshold: number;  // e.g. 15 or custom 5-40
  alertOnHigh: boolean;
  alertOnLow: boolean;
  alertWhileCharging: boolean;
  alertWhileDischarging: boolean;
  alarmVolume: number; // 0 to 1
  alarmSoundType: 'siren' | 'pulsing' | 'high_pitch' | 'radar';
  enableVibration: boolean;
  enableNotifications: boolean;
  powerSavingProfile: 'extreme' | 'balanced' | 'performance';
}

export interface BatteryStatus {
  level: number; // 0 to 100
  charging: boolean;
  chargingTime: number; // seconds or Infinity
  dischargingTime: number; // seconds or Infinity
  temperature: number; // Celsius
  voltage: number; // Volts
  health: 'Good' | 'Fair' | 'Overheat' | 'Cold';
  estimatedCycles: number;
}

export interface MoveStep {
  move: string;
  phase: string;
  explanation: string;
}

export interface SolveResponse {
  method: string;
  totalMoves: number;
  phases: {
    phaseName: string;
    explanation: string;
    moves: string[];
  }[];
  fullMoveSequence: string[];
}

export interface AiTelemetry {
  engine: ProcessingEngine;
  status: 'idle' | 'processing' | 'ready';
  latencyMs: number;
  tokensPerSec: number;
  modelName: string;
  ramUsageMb: number;
  batteryImpact: 'Ultra-low' | 'Moderate' | 'High';
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'battery_high' | 'battery_low' | 'charging_start' | 'charging_stop' | 'ai_info';
  timestamp: string;
}
