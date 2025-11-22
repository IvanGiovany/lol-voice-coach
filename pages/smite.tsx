import React, { useEffect, useRef, useState } from "react";

const INITIAL_HP = 10000;
const TARGET_SMITE = 1200;
const TICK_MS = 60; // how often HP updates
const HP_LOSS_PER_TICK = 180; // how fast Baron loses HP

interface SmiteResult {
  hitHp: number;
  diff: number;
  accuracy: number; // 0–100
  verdict: string;
}

export default function SmiteTrainerPage() {
  const [hp, setHp] = useState(INITIAL_HP);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<SmiteResult | null>(null);
  const [bestAccuracy, setBestAccuracy] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval helper
  const clearHpTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start a new run
  const startGame = () => {
    clearHpTimer();
    setResult(null);
    setHasStarted(true);
    setHp(INITIAL_HP);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setHp((prev) => {
        const next = Math.max(0, prev - HP_LOSS_PER_TICK);
        if (next <= 0) {
          // Baron died, end run automatically
          clearHpTimer();
          setIsRunning(false);
        }
        return next;
      });
    }, TICK_MS);
  };

  const stopGameWithSmite = () => {
    if (!isRunning) return;
    clearHpTimer();
    setIsRunning(false);

    setHp((currentHp) => {
      const diff = Math.abs(currentHp - TARGET_SMITE);
      const accuracy = Math.max(
        0,
        100 - (diff / TARGET_SMITE) * 100
      );
      const roundedAcc = Math.round(accuracy * 10) / 10;

      let verdict: string;
      if (diff === 0) {
        verdict = "PERFECT SMITE! Baron is yours.";
      } else if (diff <= 100) {
        verdict = "Clean smite! Jungler diff 💀";
      } else if (diff <= 250) {
        verdict = "Decent — but enemy jungler could still out-smite you.";
      } else if (currentHp < TARGET_SMITE) {
        verdict = "Too late! Enemy might have stolen Baron.";
      } else {
        verdict = "Too early! Your team wasn’t ready.";
      }

      const newResult: SmiteResult = {
        hitHp: Math.round(currentHp),
        diff: Math.round(diff),
        accuracy: roundedAcc,
        verdict
      };
      setResult(newResult);

      setBestAccuracy((prevBest) =>
        prevBest == null ? roundedAcc : Math.max(prevBest, roundedAcc)
      );

      return currentHp;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearHpTimer();
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (hp / INITIAL_HP) * 100));

  return (
    <>
      <section className="rounded-3xl border border-[#25293a] bg-gradient-to-br from-[#11131b] via-[#0b1016] to-[#05070c] shadow-[0_0_50px_rgba(190,242,100,0.15)] p-5 md:p-7">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 border border-lime-400/40 px-3 py-1 text-[11px] text-lime-200">
              <span>🐲 Baron Smite Trainer</span>
              <span className="h-1 w-1 rounded-full bg-lime-400" />
              <span>Practice hitting 1200 smite under pressure</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-50">
              Time your smite to land as close as possible to{" "}
              <span className="text-lime-300">{TARGET_SMITE}</span> damage.
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Baron&apos;s HP drains quickly. Hit{" "}
              <span className="font-semibold text-gray-200">SMITE NOW</span> when
              you think Baron is around 1200 HP. After each attempt we show you
              how accurate you were.
            </p>
          </div>

          <div className="text-right space-y-1">
            {bestAccuracy != null && (
              <p className="text-[11px] text-gray-400">
                Best accuracy this session:
                <span className="ml-1 font-semibold text-lime-300">
                  {bestAccuracy.toFixed(1)}%
                </span>
              </p>
            )}
            <p className="text-[11px] text-gray-500">
              Tip: Imagine your team&apos;s DPS chunking Baron — train your
              internal smite timer.
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] items-start">
          {/* LEFT: HP bar + controls */}
          <div className="space-y-4">
            {/* HP Display */}
            <div className="rounded-2xl border border-[#262a3b] bg-[#05070c] p-4 shadow-inner shadow-black/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐲</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-100 uppercase tracking-wide">
                      Baron Nashor HP
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Target smite:{" "}
                      <span className="font-semibold text-lime-300">
                        {TARGET_SMITE}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-mono font-semibold text-lime-300">
                    {Math.round(hp)}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {((hp / INITIAL_HP) * 100).toFixed(1)}% HP
                  </p>
                </div>
              </div>

              <div className="w-full h-4 md:h-5 rounded-full bg-[#05070c] border border-[#262a3b] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-400 via-yellow-300 to-red-500 transition-[width] duration-75"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>10000</span>
                <span>0</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={startGame}
                className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold bg-[#111624] text-gray-100 border border-[#262a3b] hover:bg-[#161c2b] transition"
              >
                {hasStarted ? "Restart run" : "Start training"}
              </button>

              <button
                type="button"
                onClick={stopGameWithSmite}
                disabled={!isRunning}
                className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold bg-lime-400 text-black hover:bg-lime-300 disabled:bg-lime-800/40 disabled:text-gray-300 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(190,242,100,0.55)]"
              >
                {isRunning ? "SMITE NOW" : "Smite (waiting...)"}
              </button>
            </div>

            {!hasStarted && (
              <p className="text-[11px] text-gray-500">
                Press <span className="font-semibold">Start training</span> to
                begin. Baron HP will tick down quickly — react based on the number
                and bar speed, just like in a real fight.
              </p>
            )}
          </div>

          {/* RIGHT: result panel */}
          <div className="rounded-2xl border border-[#262a3b] bg-[#05070c] p-4 md:p-5 shadow-inner shadow-black/40 min-h-[180px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-100 mb-2">
              Smite result
            </h3>

            {!result ? (
              <div className="flex-1 flex items-center justify-center text-[11px] text-gray-500 text-center">
                Your last attempt summary will appear here. Try to land your smite
                as close as possible to{" "}
                <span className="font-semibold text-lime-300">
                  {TARGET_SMITE}
                </span>{" "}
                HP.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-[11px]">
                  <div className="rounded-xl bg-[#090d16] border border-[#262a3b] px-3 py-2">
                    <p className="text-gray-500 mb-1">You smited at</p>
                    <p className="text-lg font-mono font-semibold text-lime-300">
                      {result.hitHp}
                    </p>
                    <p className="text-[10px] text-gray-500">Baron HP</p>
                  </div>
                  <div className="rounded-xl bg-[#090d16] border border-[#262a3b] px-3 py-2">
                    <p className="text-gray-500 mb-1">Offset from 1200</p>
                    <p className="text-lg font-mono font-semibold text-gray-100">
                      {result.diff}
                    </p>
                    <p className="text-[10px] text-gray-500">HP away</p>
                  </div>
                  <div className="rounded-xl bg-[#090d16] border border-[#262a3b] px-3 py-2">
                    <p className="text-gray-500 mb-1">Accuracy</p>
                    <p className="text-lg font-mono font-semibold text-lime-300">
                      {result.accuracy.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-gray-500">
                      100% is a perfect smite
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0b1017] border border-[#262a3b] px-3 py-3 text-[12px] text-gray-100">
                  {result.verdict}
                </div>

                <p className="text-[11px] text-gray-500">
                  Keep repeating the drill until your muscle memory for{" "}
                  <span className="font-mono text-gray-200">1200</span> feels
                  automatic. You can imagine different team DPS levels by changing
                  the HP drain speed in a future version.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
