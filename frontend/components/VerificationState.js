"use client";

export default function VerificationState({ state, message }) {
  const colorByState = {
    idle: "border-slate-700 text-slate-200",
    loading: "border-sky-700/60 text-sky-200",
    success: "border-emerald-700/60 text-emerald-200",
    denied: "border-rose-700/70 text-rose-200",
    error: "border-amber-700/70 text-amber-200"
  };

  return (
    <div
      className={`w-full rounded-xl border bg-surface-elevated/90 px-4 py-3 text-sm ${
        colorByState[state] || colorByState.idle
      }`}
    >
      {message}
    </div>
  );
}
