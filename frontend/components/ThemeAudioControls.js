"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_THEME_KEY = "parrotpass:theme";
const STORAGE_MUTE_KEY = "parrotpass:muted";

export default function ThemeAudioControls() {
  const audioRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
    const preferredTheme = savedTheme === "light" ? "light" : "dark";
    setTheme(preferredTheme);
    document.documentElement.classList.toggle("dark", preferredTheme === "dark");

    const savedMute = window.localStorage.getItem(STORAGE_MUTE_KEY) === "1";
    setIsMuted(savedMute);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;
    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        audio.muted = true;
        setIsMuted(true);
      }
    };
    tryPlay();
  }, [isMuted]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    window.localStorage.setItem(STORAGE_MUTE_KEY, nextMuted ? "1" : "0");
  };

  return (
    <>
      <audio ref={audioRef} src="/10ksong.mp3" loop autoPlay preload="auto" />
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
