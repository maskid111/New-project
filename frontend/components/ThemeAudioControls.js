"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_THEME_KEY = "parrotpass:theme";

export default function ThemeAudioControls() {
  const audioRef = useRef(null);
  const playRetryTimerRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
    const preferredTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(preferredTheme);
    document.documentElement.classList.toggle("dark", preferredTheme === "dark");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1;
    audio.muted = isMuted;
    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        // Some browsers require user interaction before playback.
      }
    };
    tryPlay();
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isMuted) return;

    const tryPlay = async () => {
      try {
        if (audio.paused) {
          await audio.play();
        }
      } catch {
        // Ignore: playback policies can still block.
      }
    };

    const onFirstInteraction = async () => {
      try {
        await audio.play();
      } catch {
        // Ignore: playback policies can still block.
      }
    };

    const setupRetry = () => {
      if (playRetryTimerRef.current) return;
      playRetryTimerRef.current = window.setInterval(() => {
        if (!audio.paused) {
          window.clearInterval(playRetryTimerRef.current);
          playRetryTimerRef.current = null;
          return;
        }
        tryPlay();
      }, 1500);
    };

    const clearRetry = () => {
      if (!playRetryTimerRef.current) return;
      window.clearInterval(playRetryTimerRef.current);
      playRetryTimerRef.current = null;
    };

    tryPlay();
    setupRetry();

    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    window.addEventListener("focus", tryPlay);
    window.addEventListener("pageshow", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);
    audio.addEventListener("canplaythrough", tryPlay);
    audio.addEventListener("playing", clearRetry);

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("focus", tryPlay);
      window.removeEventListener("pageshow", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
      audio.removeEventListener("canplaythrough", tryPlay);
      audio.removeEventListener("playing", clearRetry);
      clearRetry();
    };
  }, [isMuted]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <>
      <audio ref={audioRef} src="/10ksong.mp3" loop autoPlay preload="auto" playsInline />
      <div className="fixed right-3 top-3 z-50 flex gap-2 sm:right-5 sm:top-5">
        <button
          onClick={toggleTheme}
          className="rounded-full border border-slate-300/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={toggleMute}
          className="rounded-full border border-slate-300/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
    </>
  );
}
