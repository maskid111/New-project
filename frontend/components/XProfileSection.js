"use client";

import { useEffect, useMemo, useState } from "react";
import { buildProxiedXAvatarUrl } from "../lib/api";

const FALLBACK_X_AVATAR = "/parrotpass-nft-art.png";

export default function XProfileSection({ address, profile, onConnect, loading }) {
  const proxiedAvatar = useMemo(
    () => (profile?.profileImageUrl ? buildProxiedXAvatarUrl(profile.profileImageUrl) : ""),
    [profile?.profileImageUrl]
  );
  const [avatarSrc, setAvatarSrc] = useState(FALLBACK_X_AVATAR);

  useEffect(() => {
    setAvatarSrc(proxiedAvatar || FALLBACK_X_AVATAR);
  }, [proxiedAvatar]);

  if (profile) {
    return (
      <div className="w-full rounded-xl border border-emerald-300 bg-white/90 p-5 dark:border-emerald-700/40 dark:bg-surface-elevated/90">
        <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">X Connection</p>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="X profile"
            className="h-12 w-12 rounded-full border border-slate-300 object-cover dark:border-slate-700"
            onError={() => setAvatarSrc(FALLBACK_X_AVATAR)}
          />
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Connected as</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{profile.username}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-300 bg-white/90 p-6 shadow-xl dark:border-slate-700 dark:bg-surface-elevated/90">
      <p className="text-xs uppercase tracking-wide text-sky-300">Step 2 - X Auth</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Connect your X account</h2>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        Complete real OAuth to link your X profile and personalize your ParrotPass card.
      </p>

      <p className="mt-3 break-all text-xs text-slate-600 dark:text-slate-400">Wallet: {address}</p>

      <button
        onClick={onConnect}
        disabled={loading}
        className="mt-4 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Connect X"}
      </button>
    </div>
  );
}
