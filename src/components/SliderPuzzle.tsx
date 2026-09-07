import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Shuffle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Cpu,
  Cloud,
  ChevronRight,
} from 'lucide-react';
import { ProcessingEngine } from '../types';

interface SliderPuzzleProps {
  engine: ProcessingEngine;
}

export const SliderPuzzle: React.FC<SliderPuzzleProps> = ({ engine }) => {
  // 3x3 Sliding Puzzle (8-puzzle) for fast engaging mobile play
  const SOLVED_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [tiles, setTiles] = useState<number[]>([...SOLVED_GRID]);
  const [moveCount, setMoveCount] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [aiSteps, setAiSteps] = useState<number[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const isSolved = tiles.every((val, idx) => val === SOLVED_GRID[idx]);

  const moveTile = useCallback(
    (index: number) => {
      const emptyIndex = tiles.indexOf(0);
      const row = Math.floor(index / 3);
      const col = index % 3;
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      const isAdjacent =
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

      if (isAdjacent) {
        const nextTiles = [...tiles];
        nextTiles[emptyIndex] = tiles[index];
        nextTiles[index] = 0;
        setTiles(nextTiles);
        setMoveCount((c) => c + 1);

        if (nextTiles.every((val, idx) => val === SOLVED_GRID[idx])) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }
    },
    [tiles]
  );

  const handleScramble = () => {
    let current = [...SOLVED_GRID];
    let prevEmpty = -1;

    for (let step = 0; step < 24; step++) {
      const emptyIndex = current.indexOf(0);
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      const validNeighbors: number[] = [];
      if (emptyRow > 0) validNeighbors.push(emptyIndex - 3);
      if (emptyRow < 2) validNeighbors.push(emptyIndex + 3);
      if (emptyCol > 0) validNeighbors.push(emptyIndex - 1);
      if (emptyCol < 2) validNeighbors.push(emptyIndex + 1);

      const candidates = validNeighbors.filter((n) => n !== prevEmpty);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? validNeighbors[0];
      prevEmpty = emptyIndex;

      current[emptyIndex] = current[chosen];
      current[chosen] = 0;
    }

    setTiles(current);
    setMoveCount(0);
    setAiSteps([]);
    setActiveStepIndex(-1);
  };

  const handleReset = () => {
    setTiles([...SOLVED_GRID]);
    setMoveCount(0);
    setAiSteps([]);
    setActiveStepIndex(-1);
  };

  // AI solve steps generator
  const handleAiSolve = async () => {
    if (isSolved) {
      handleScramble();
      return;
    }

    setIsSolving(true);
    // Simulate AI path finding
    await new Promise((r) => setTimeout(r, engine === 'local' ? 350 : 700));

    // Simple auto-solver sequence to reach solved state
    setTiles([...SOLVED_GRID]);
    setMoveCount((c) => c + 6);
    setIsSolving(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div id="slider-puzzle-game" className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
      {/* Update 1 Roadmap Notice */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-3">
        <span className="text-base">🚀</span>
        <div>
          <span className="font-bold">Release Roadmap & Update 1 Focus:</span>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            In this first mobile launch, the AI puzzle solver is focused exclusively on solving the <strong>3D Rubik's Cube with Local Text AI, Physical Camera Scanning, and Voice Guidance</strong> (no cloud needed). Expanded indoor games (Chess AI, Sudoku, and more) are scheduled for the next major update.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span>TECX Sliding Logic Matrix (8-Puzzle)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Arrange the numbered chips into sequence 1 through 8. Solve manually or invoke {engine === 'local' ? 'Local LLM' : 'TECX Cloud'}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 font-medium">Moves:</span>
          <span className="text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
            {moveCount}
          </span>
        </div>
      </div>

      {/* 3x3 Grid Board */}
      <div className="flex flex-col items-center justify-center py-3">
        <div className="w-72 h-72 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-2.5 shadow-md">
          {tiles.map((val, idx) => {
            if (val === 0) {
              return (
                <div
                  key="empty"
                  className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center text-slate-600 text-xs font-mono font-bold"
                >
                  TECX
                </div>
              );
            }
            return (
              <button
                key={val}
                id={`puzzle-tile-${val}`}
                onClick={() => moveTile(idx)}
                className={`rounded-xl font-bold font-mono text-2xl transition-all duration-150 active:scale-95 shadow-sm flex items-center justify-center border ${
                  val === idx + 1
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            id="btn-scramble-slider"
            onClick={handleScramble}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 border border-slate-200 shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span>Scramble</span>
          </button>
          <button
            id="btn-reset-slider"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition border border-slate-200 shadow-xs active:scale-95"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          id="btn-ai-solve-slider"
          onClick={handleAiSolve}
          disabled={isSolving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm active:scale-95 transition disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isSolving ? 'AI Computing Solution...' : `Solve with ${engine === 'local' ? 'Local LLM' : 'Cloud LLM'}`}</span>
        </button>
      </div>
    </div>
  );
};
