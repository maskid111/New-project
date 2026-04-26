"use client";

import { toBlob } from "html-to-image";

export default function DownloadActions({ cardRef, fileName = "parrotpass-card.png", onMessage }) {
  const isIOS = () => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  const waitForImages = async (root) => {
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
              return;
            }

            const done = () => {
              img.removeEventListener("load", done);
              img.removeEventListener("error", done);
              resolve();
            };

            img.addEventListener("load", done);
            img.addEventListener("error", done);
          })
      )
    );
  };

  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const imageElementToDataUrl = (img) => {
    try {
      if (!img?.naturalWidth || !img?.naturalHeight) return "";
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) return "";
      context.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return "";
    }
  };

  const inlineImageSources = async (sourceRoot, cloneRoot) => {
    const sourceImages = Array.from(sourceRoot.querySelectorAll("img"));
    const cloneImages = Array.from(cloneRoot.querySelectorAll("img"));

    // First attempt: use already-rendered image pixels from the live DOM.
    for (let i = 0; i < cloneImages.length; i += 1) {
      const sourceImg = sourceImages[i];
      const cloneImg = cloneImages[i];
      if (!cloneImg) continue;

      const renderedDataUrl = imageElementToDataUrl(sourceImg);
      if (renderedDataUrl) {
        cloneImg.setAttribute("src", renderedDataUrl);
      }
    }

    // Fallback: fetch and inline any image that is still URL-based.
    const images = Array.from(cloneRoot.querySelectorAll("img"));
    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute("src");
        if (!src || src.startsWith("data:")) return;

        try {
          const response = await fetch(src, { cache: "no-store" });
          if (!response.ok) return;
          const blob = await response.blob();
          const dataUrl = await blobToDataUrl(blob);
          if (typeof dataUrl === "string") {
            img.setAttribute("src", dataUrl);
          }
        } catch {
          // Keep original src if fetch/inline fails.
        }
      })
    );
  };

  const buildCardBlob = async (sourceNode) => {
    const clone = sourceNode.cloneNode(true);
    clone.style.margin = "0";

    const offscreen = document.createElement("div");
    offscreen.style.position = "fixed";
    offscreen.style.left = "0";
    offscreen.style.top = "0";
    offscreen.style.transform = "translateX(-200vw)";
    offscreen.style.pointerEvents = "none";
    offscreen.style.opacity = "1";
    offscreen.appendChild(clone);
    document.body.appendChild(offscreen);

    try {
      await waitForImages(sourceNode);
      await inlineImageSources(sourceNode, clone);
      await waitForImages(clone);
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      const blob = await toBlob(clone, {
        cacheBust: true,
        pixelRatio: isIOS() ? 1.5 : 2,
        backgroundColor: "#080d19"
      });
      return blob;
    } finally {
      document.body.removeChild(offscreen);
    }
  };

  const triggerFileDownload = (blob, name) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = name;
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  };

  const onDownload = async () => {
    try {
      if (!cardRef?.current) {
        onMessage?.("Card preview is not ready yet.");
        return;
      }

      const blob = await buildCardBlob(cardRef.current);
      if (!blob) {
        throw new Error("Could not build image blob");
      }

      if (isIOS()) {
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

      // Android/desktop: direct file download for expected behavior.
      triggerFileDownload(blob, fileName);
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
