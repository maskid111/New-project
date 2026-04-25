"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}

const FALLBACK_AVATAR = "/parrotpass-nft-art.png";

const DashboardCard = forwardRef(function DashboardCard(
  {
    xUsername,
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
  const cleanUsername = useMemo(() => (xUsername || "").replace(/^@/, ""), [xUsername]);

  useEffect(() => {
    setAvatarSrc(xProfileImageUrl || FALLBACK_AVATAR);
  }, [xProfileImageUrl]);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.1),transparent_45%)] blur-2xl" />
      <div
        ref={ref}
        className="group w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-[#0b0f19] to-[#0f172a] p-6 shadow-[0_10px_30px_rgba(2,6,23,0.55)] transition-transform duration-300 hover:-translate-y-0.5"
      >
        <div className="grid gap-5 md:grid-cols-5">
          <section className="md:col-span-2">
            <div className="flex items-start gap-4">
              <img
                src={avatarSrc}
                alt="X avatar"
                className="h-16 w-16 rounded-full border border-white/15 object-cover sm:h-20 sm:w-20"
                onError={() => setAvatarSrc(FALLBACK_AVATAR)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-bold text-white">@{cleanUsername || "unlinked"}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">{shortAddress(walletAddress)}</p>
                <span className="mt-3 inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">
                  MONAD
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <Metric label="NFT Count" value={String(nftCount)} />
              <Metric label="Transactions" value={Number(totalTransactions || 0).toLocaleString()} />
              <Metric label="Tier" value={tierName} />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-100">{tierName}</p>
              <p className="mt-1 text-xs italic text-slate-400">"{tierRemark}"</p>
            </div>
          </section>

          <section className="md:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <img
                src="/parrotpass-nft-art.png"
                alt="ParrotPass NFT"
                className="h-[260px] w-full object-cover sm:h-[320px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-200">ParrotPass NFT Art</p>
                <span className="rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                  PNG
                </span>
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
    <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-slate-100">{value}</p>
    </div>
  );
}

export default DashboardCard;
