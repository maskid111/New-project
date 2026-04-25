"use client";

export default function WalletInput({ addressInput, onAddressInputChange, onSubmitAddress, loading }) {
  return (
    <div className="w-full rounded-xl border border-slate-700 bg-surface-elevated/90 p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white">Wallet Input</h2>
      <p className="mt-1 text-sm text-slate-300">
        Paste your Monad address to verify NFT ownership.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={addressInput}
          onChange={(event) => onAddressInputChange(event.target.value)}
          placeholder="Paste your Monad address"
          className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={onSubmitAddress}
          disabled={loading}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify Address"}
        </button>
      </div>
    </div>
  );
}
