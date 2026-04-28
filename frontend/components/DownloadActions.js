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

            img.setAttribute("loading", "eager");
            img.setAttribute("decoding", "sync");
            img.addEventListener("load", done);
            img.addEventListener("error", done);
          })
      )
    );
  };

  const waitForImagePaint = (img) =>
    new Promise((resolve) => {
      const done = () => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
        resolve();
      };
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }
      img.addEventListener("load", done);
      img.addEventListener("error", done);
      setTimeout(done, 1500);
    });

  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const inlineAllImages = async (root) => {
    const images = Array.from(root.querySelectorAll("img"));
    const objectUrls = [];

    await Promise.all(
      images.map(async (img) => {
        const src = img.currentSrc || img.getAttribute("src");
        if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

        try {
          const absoluteSrc = new URL(src, window.location.href).toString();
          const sameOrigin = new URL(absoluteSrc).origin === window.location.origin;
          const requestUrl = sameOrigin ? absoluteSrc : `/api/proxy-image?url=${encodeURIComponent(absoluteSrc)}`;
          const response = await fetch(requestUrl, { cache: "no-store" });
          if (!response.ok) return;

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          objectUrls.push(blobUrl);

          img.removeAttribute("srcset");
          img.removeAttribute("sizes");
          img.setAttribute("src", blobUrl);
          await waitForImagePaint(img);
        } catch {
          // Keep original src if fetch/inline fails.
        }
      })
    );

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
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

    let cleanupInlinedImages = null;
    try {
      await waitForImages(clone);
      cleanupInlinedImages = await inlineAllImages(clone);
      // Give WebKit enough time to settle repaints after src swapping.
      await new Promise((r) => setTimeout(r, 300));

      const blob = await toBlob(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#080d19",
        includeQueryParams: true
      });
      return blob;
    } finally {
      if (cleanupInlinedImages) {
        cleanupInlinedImages();
      }
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
        try {
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "ParrotPass Card" });
            onMessage?.("Card ready to share/save.");
            return;
          }
        } catch {
          // If share is canceled or fails, continue to fallback.
        }

        // iOS fallback: open a data URL tab for long-press save.
        const dataUrl = await blobToDataUrl(blob);
        const newTab = window.open("", "_blank");
        if (newTab && typeof dataUrl === "string") {
          newTab.location.href = dataUrl;
          onMessage?.("Image opened in new tab. Long-press it and tap Save to Photos.");
          return;
        }

        // Last resort if popup is blocked.
        triggerFileDownload(blob, fileName);
        onMessage?.("Card downloaded.");
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
