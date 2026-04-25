"use client";

import { toPng } from "html-to-image";

export default function DownloadActions({ cardRef, fileName = "parrotpass-card.png", onMessage }) {
  const onDownload = async () => {
    try {
      if (!cardRef?.current) {
        onMessage?.("Card preview is not ready yet.");
        return;
      }

      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      onMessage?.("Card downloaded.");
    } catch {
      onMessage?.("Could not download card. Please try again.");
    }
  };

  const onShare = () => {
    const text = "I just unlocked my ParrotPass 🦜 on Monad. What's your rank?";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        onClick={onDownload}
        className="rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(99,102,241,0.32)]"
      >
        Download Card
      </button>
      <button onClick={onShare} className="text-xs font-medium text-slate-400 hover:text-slate-200">
        Share on X
      </button>
    </div>
  );
}
