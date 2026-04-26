"use client";

import { toBlob, toPng } from "html-to-image";

export default function DownloadActions({ cardRef, fileName = "parrotpass-card.png", onMessage }) {
  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  const onDownload = async () => {
    try {
      if (!cardRef?.current) {
        onMessage?.("Card preview is not ready yet.");
        return;
      }

      const exportOptions = { cacheBust: true, pixelRatio: 2 };

      // iOS Safari often blocks/ignores direct a[download] for data URLs.
      // Fallback: use Web Share (with image file) or open image in a new tab for manual save.
      if (isIOS()) {
        const blob = await toBlob(cardRef.current, exportOptions);
        if (!blob) {
          throw new Error("Could not build image blob");
        }

        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "ParrotPass Card" });
          onMessage?.("Card ready to share/save.");
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
        onMessage?.("Image opened in new tab. Long-press it and tap Save to Photos.");
        return;
      }

      const dataUrl = await toPng(cardRef.current, exportOptions);
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
      <button onClick={onShare} className="text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
        Share on X
      </button>
    </div>
  );
}
