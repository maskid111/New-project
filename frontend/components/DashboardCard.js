"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

function formatCardDate() {
  return new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function tierTheme(tierName) {
  const value = String(tierName || "").toLowerCase();
  if (value.includes("legend")) {
    return {
      pill: "border-amber-300/50 bg-amber-500/20 text-amber-100",
      glow: "from-amber-500/20 via-fuchsia-500/15 to-indigo-500/20"
    };
  }
  if (value.includes("elite")) {
    return {
      pill: "border-sky-300/50 bg-sky-500/20 text-sky-100",
      glow: "from-cyan-500/20 via-blue-500/15 to-violet-500/20"
    };
  }
  return {
    pill: "border-violet-300/50 bg-violet-500/20 text-violet-100",
    glow: "from-violet-500/20 via-fuchsia-500/15 to-sky-500/20"
  };
}

const FALLBACK_AVATAR = "/parrotpass-nft-art.png";

const DashboardCard = forwardRef(function DashboardCard(
  {
    xProfileImageUrl,
    walletAddress,
    nftCount,
    totalTransactions,
    tierName,
    tierRemark
  },
  ref
) {
  const [avatarSrc, setAvatarSrc] = useState(xProfileImageUrl || FALLBACK_AVATAR);
  const cardDate = useMemo(() => formatCardDate(), []);
  const theme = useMemo(() => tierTheme(tierName), [tierName]);
  const txCount = Number(totalTransactions || 0).toLocaleString();

  useEffect(() => {
    setAvatarSrc(xProfileImageUrl || FALLBACK_AVATAR);
  }, [xProfileImageUrl]);

  return (
    <div className="relative mx-auto w-[760px] min-w-[760px] max-w-none">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[34px] bg-[radial-gradient(circle_at_20%_15%,rgba(129,140,248,0.34),transparent_45%),radial-gradient(circle_at_82%_82%,rgba(45,212,191,0.28),transparent_42%)] blur-2xl" />
      <div
        ref={ref}
        className="group relative w-full overflow-hidden rounded-[26px] border border-white/15 bg-[#080d19] p-0 shadow-[0_20px_60px_rgba(2,6,23,0.6)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.92)_0%,rgba(30,41,59,0.86)_45%,rgba(15,23,42,0.95)_100%)]" />
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`} />
        <div className="relative grid grid-cols-5 gap-5 p-6">
          <section className="col-span-3 flex min-w-0 flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <img
                  src="/parrotpass-nft-art.png"
                  alt="ParrotPass NFT"
                  className="h-20 w-20 rounded-2xl border border-white/20 object-cover shadow-[0_6px_22px_rgba(15,23,42,0.5)]"
                />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-200/90">ParrotPass Profile</p>
                  <p className="truncate text-[26px] font-extrabold leading-none text-white">The 10k Squad</p>
                  <p className="mt-2 font-mono text-xs text-slate-300">{shortAddress(walletAddress)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300">Generated</p>
                <p className="mt-1 text-xs font-semibold text-slate-100">{cardDate}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="NFTs Held" value={String(nftCount)} />
              <Metric label="Transactions" value={txCount} />
              <Metric label="Chain" value="Monad" />
            </div>

            <div className="mt-4 rounded-2xl border border-white/15 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Current Rank</p>
                <span
                  className={`max-w-[190px] truncate whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${theme.pill}`}
                >
                  {tierName}
                </span>
              </div>
              <p className="mt-2 break-words text-sm italic text-slate-200">{tierRemark}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800/90">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-300">
              <span>parrotpass.io</span>
              <span>Verified Wallet Data</span>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-300">Influenced by @buildanythingso</p>
          </section>

          <section className="col-span-2 min-w-0">
            <div className="relative h-full min-h-[332px] overflow-hidden rounded-2xl border border-white/15 bg-black/25">
              <img
                src={avatarSrc}
                alt="X profile"
                className="h-full w-full object-cover"
                onError={() => setAvatarSrc(FALLBACK_AVATAR)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex min-w-0 justify-between gap-2 px-4 py-4">
                <span className="max-w-[112px] truncate whitespace-nowrap rounded-full border border-white/25 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-100">
                  Signature Art
                </span>
                <span className="max-w-[100px] truncate whitespace-nowrap rounded-full border border-white/25 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-100">
                  10K Squad
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-xl border border-white/20 bg-black/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300">Collector Identity</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-100">The 10k Squad</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/25 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none text-slate-100">{value}</p>
    </div>
  );
}

export default DashboardCard;
