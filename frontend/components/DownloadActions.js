"use client";

import { useEffect, useState } from "react";
import { toBlob } from "html-to-image";

export default function DownloadActions({ cardRef, fileName = "parrotpass-card.png", onMessage }) {
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setDownloaded(false);
  }, [fileName]);

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

  const imageToDataUrlFromRenderedPixels = (img) => {
    try {
      if (!img || !img.naturalWidth || !img.naturalHeight) return "";
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return "";
    }
  };

  const inlineAllImages = async (root, sourceRoot) => {
    const images = Array.from(root.querySelectorAll("img"));
    const sourceImages = sourceRoot ? Array.from(sourceRoot.querySelectorAll("img")) : [];
    const objectUrls = [];

    for (let i = 0; i < images.length; i += 1) {
      const sourceImg = sourceImages[i];
      const cloneImg = images[i];
      if (!sourceImg || !cloneImg) continue;
      const renderedDataUrl = imageToDataUrlFromRenderedPixels(sourceImg);
      if (!renderedDataUrl) continue;

      cloneImg.removeAttribute("srcset");
      cloneImg.removeAttribute("sizes");
      cloneImg.setAttribute("src", renderedDataUrl);
      await waitForImagePaint(cloneImg);
    }

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
    clone.style.transform = "none";
    clone.style.transformOrigin = "top left";
    clone.style.width = `${sourceNode.scrollWidth}px`;
    clone.style.height = `${sourceNode.scrollHeight}px`;
    clone.style.maxWidth = "none";
    clone.style.minWidth = `${sourceNode.scrollWidth}px`;

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
      await waitForImages(sourceNode);
      await waitForImages(clone);
      cleanupInlinedImages = await inlineAllImages(clone, sourceNode);
      await new Promise((r) => setTimeout(r, 300));

      const blob = await toBlob(clone, {
        cacheBust: true,
        pixelRatio: isIOS() ? 3 : 2,
        width: sourceNode.scrollWidth,
        height: sourceNode.scrollHeight,
        backgroundColor: "#080d19",
        includeQueryParams: true
      });
      return blob;
    } finally {
      if (cleanupInlinedImages) cleanupInlinedImages();
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
    let iosTab = null;
    if (isIOS()) {
      iosTab = window.open("about:blank", "_blank");
    }

    try {
      if (!cardRef?.current) {
        onMessage?.("Card preview is not ready yet.");
        if (iosTab && !iosTab.closed) iosTab.close();
        return;
      }

      const blob = await buildCardBlob(cardRef.current);
      if (!blob) throw new Error("Could not build image blob");

      if (isIOS()) {
        const file = new File([blob], fileName, { type: "image/png" });
        try {
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "ParrotPass Card" });
            setDownloaded(true);
            onMessage?.("Image downloaded");
            if (iosTab && !iosTab.closed) iosTab.close();
            return;
          }
        } catch {
          // Continue to fallback.
        }

        const dataUrl = await blobToDataUrl(blob);
        if (iosTab && typeof dataUrl === "string") {
          iosTab.location.href = dataUrl;
          setDownloaded(true);
          onMessage?.("Image downloaded");
          return;
        }

        triggerFileDownload(blob, fileName);
        setDownloaded(true);
        onMessage?.("Image downloaded");
        return;
      }

      triggerFileDownload(blob, fileName);
      setDownloaded(true);
      onMessage?.("Image downloaded");
    } catch {
      onMessage?.("Could not download card. Please try again.");
    }
  };

  const onShare = () => {
    const text = `Your wallet tells a story.

I just generated my ParrotPass. It reveals my onchain identity based on what I actually do onchain

Inspired by @buildanythingso, Powered by @monad, Made for @the10ksquad holders.

Try yours 👉 https://parrotpassio.vercel.app/

Quote this tweet with your ParrotPass card 👇
Let’s see who’s really part of the squad 🦜`;
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
      {downloaded ? (
        <button onClick={onShare} className="text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
          Share on X
        </button>
      ) : null}
    </div>
  );
}

