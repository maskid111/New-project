"use client";

export default function VerificationState({ state, message }) {
  const colorByState = {
    idle: "border-slate-300 text-slate-800 dark:border-slate-700 dark:text-slate-200",
    loading: "border-sky-300 text-sky-800 dark:border-sky-700/60 dark:text-sky-200",
    success: "border-emerald-300 text-emerald-800 dark:border-emerald-700/60 dark:text-emerald-200",
    denied: "border-rose-300 text-rose-800 dark:border-rose-700/70 dark:text-rose-200",
    error: "border-amber-300 text-amber-800 dark:border-amber-700/70 dark:text-amber-200"
  };

  return (
    <div
      className={`w-full rounded-xl border bg-white/90 px-4 py-3 text-sm dark:bg-surface-elevated/90 ${
        colorByState[state] || colorByState.idle
      }`}
    >
      {message}
    </div>
  );
}
