"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import DownloadActions from "../components/DownloadActions";
import VerificationState from "../components/VerificationState";
import WalletInput from "../components/WalletInput";
import XProfileSection from "../components/XProfileSection";
import {
  buildProxiedXAvatarUrl,
  fetchWalletActivity,
  getXAuthUrl,
  verifyWalletOwnership
} from "../lib/api";
import { normalizeAddress } from "../lib/web3";

export default function HomePage() {
  const [addressInput, setAddressInput] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [nftCount, setNftCount] = useState(0);
  const [ownsNFT, setOwnsNFT] = useState(null);
  const [activity, setActivity] = useState(null);
  const [verificationState, setVerificationState] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [xProfile, setXProfile] = useState(null);
  const [xLoading, setXLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xConnected = params.get("x_connected");
    const xError = params.get("x_error");
    const xAddress = params.get("x_address");
    const xUsername = params.get("x_username");
    const xProfileImage = params.get("x_profile_image");

    if (xError) {
      setVerificationState("error");
      setError(`X connection failed: ${xError}`);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (xConnected === "1" && xAddress && xUsername) {
      const restored = {
        username: xUsername,
        profileImageUrl: xProfileImage || ""
      };

      setAddressInput(xAddress);
      setXProfile(restored);
      window.localStorage.setItem(`parrotpass:x:${xAddress}`, JSON.stringify(restored));
      verifyAndLoad(xAddress, { preserveProfile: true });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!selectedAddress || !ownsNFT || xProfile) return;
    const saved = window.localStorage.getItem(`parrotpass:x:${selectedAddress}`);
    if (!saved) return;
    try {
      setXProfile(JSON.parse(saved));
    } catch {
      // Ignore invalid local storage payloads.
    }
  }, [selectedAddress, ownsNFT, xProfile]);

  const statusMessage = useMemo(() => {
    if (verificationState === "loading") return "Verifying wallet ownership...";
    if (verificationState === "success") return "Access granted. Connect X to generate your card.";
    if (verificationState === "denied") return "Access denied. You must hold 10K Squad NFT";
    if (verificationState === "error") return error;
    if (error) return error;
    return "Paste your Monad address to start verification.";
  }, [verificationState, error]);

  const canRenderCard = ownsNFT && xProfile && activity;

  async function verifyAndLoad(address, options = {}) {
    setLoading(true);
    setError("");
    setActionMessage("");
    setVerificationState("loading");
    setActivity(null);
    if (!options.preserveProfile) {
      setXProfile(null);
    }

    try {
      const normalizedAddress = normalizeAddress(address);
      setSelectedAddress(normalizedAddress);
      setAddressInput(normalizedAddress);

      const verification = await verifyWalletOwnership(normalizedAddress);
      const hasNft = Boolean(verification.ownsNFT);
      setOwnsNFT(hasNft);
      setNftCount(Number(verification.nftCount || 0));

      if (hasNft) {
        const walletActivity = await fetchWalletActivity(normalizedAddress);
        setActivity(walletActivity);
        setVerificationState("success");
      } else {
        setVerificationState("denied");
      }
    } catch (requestError) {
      setOwnsNFT(null);
      setVerificationState("error");
      setError(requestError?.message || "Unexpected error while verifying address");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAddress() {
    if (!addressInput.trim()) {
      setVerificationState("error");
      setError("Please enter a wallet address.");
      return;
    }
    await verifyAndLoad(addressInput.trim());
  }

  async function handleConnectX() {
    try {
      setXLoading(true);
      setError("");
      setActionMessage("");
      if (!selectedAddress) {
        throw new Error("Verify wallet address first");
      }

      const { authUrl } = await getXAuthUrl(selectedAddress);
      window.location.href = authUrl;
    } catch (xConnectError) {
      setError(xConnectError?.message || "Unable to start X OAuth");
    } finally {
      setXLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <section className="rounded-xl border border-slate-300 bg-white/90 p-6 dark:border-slate-700 dark:bg-surface-elevated/90">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">ParrotPass</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">NFT-Gated Rank Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
            Verify your Monad wallet, connect X, and generate your shareable ParrotPass activity card.
          </p>
        </section>

        <section>
          <WalletInput
            addressInput={addressInput}
            onAddressInputChange={setAddressInput}
            onSubmitAddress={handleSubmitAddress}
            loading={loading}
          />
        </section>

        <section>
          <VerificationState state={verificationState} message={statusMessage} />
        </section>

        {ownsNFT && (
          <section>
            <XProfileSection
              address={selectedAddress}
              profile={xProfile}
              onConnect={handleConnectX}
              loading={xLoading}
            />
          </section>
        )}

        {canRenderCard && (
          <>
            <section className="rounded-xl border border-slate-300 bg-white/90 p-5 dark:border-slate-700 dark:bg-surface-elevated/90">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Activity + rank summary</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <SummaryItem label="Total Transactions" value={String(activity.totalTransactions)} />
                <SummaryItem label="Tier" value={activity.tierName} />
                <SummaryItem label="NFTs Owned" value={String(nftCount)} />
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{activity.tierRemark}</p>
            </section>

            <section className="rounded-xl border border-slate-300 bg-white/90 p-5 dark:border-slate-700 dark:bg-surface-elevated/90">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Download card preview</h2>
              <div className="mt-4 overflow-x-auto">
                <div className="mx-auto w-fit">
                <DashboardCard
                  ref={cardRef}
                  xUsername={xProfile.username}
                  xProfileImageUrl={buildProxiedXAvatarUrl(xProfile.profileImageUrl)}
                  walletAddress={selectedAddress}
                  nftCount={nftCount}
                  totalTransactions={activity.totalTransactions}
                  tierName={activity.tierName}
                  tierRemark={activity.tierRemark}
                />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-300 bg-white/90 p-5 dark:border-slate-700 dark:bg-surface-elevated/90">
              <DownloadActions
                cardRef={cardRef}
                fileName={`parrotpass-${selectedAddress.slice(2, 8)}.png`}
                onMessage={setActionMessage}
              />
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                X cannot auto-attach local files in this flow. Download the card, then upload it in the tweet composer.
              </p>
              {actionMessage ? <p className="mt-2 text-xs text-accent">{actionMessage}</p> : null}
            </section>
          </>
        )}

      </div>
    </main>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70">
      <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
