"use client";

import Script from "next/script";

// JUICED token mint address
const JUICED_MINT = "7GxATsNMnaC88vdwd2t3mwrFuQwwGvmYPrUQ4D6FotXk";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl font-black tracking-tight mb-4">
          <span className="text-[#C7F284]">JUICED</span>
        </h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          The yield-bearing receipt token for JupUSD deposits on Jupiter Lend.
          Earn T-bill yield and borrowing interest, automatically compounded into
          the token price.
        </p>
      </section>

      {/* Stats */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-[#C7F284]">$1B+</p>
            <p className="text-sm text-zinc-400 mt-1">Total Supply</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-[#C7F284]">$762M+</p>
            <p className="text-sm text-zinc-400 mt-1">Earn Deposits</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-[#C7F284]">BlackRock BUIDL</p>
            <p className="text-sm text-zinc-400 mt-1">Reserve Backing</p>
          </div>
        </div>
      </section>

      {/* Swap Widget */}
      <section className="px-6 pb-16 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Get JUICED</h2>

        {/* Jupiter Plugin renders here */}
        <div
          id="integrated-terminal"
          className="min-h-[500px] rounded-xl overflow-hidden"
        />
      </section>

      {/* Jupiter Plugin — loads the swap widget and locks output to JUICED */}
      <Script
        src="https://plugin.jup.ag/plugin-v1.js"
        data-preload
        strategy="afterInteractive"
        onReady={() => {
          // @ts-expect-error — Jupiter Plugin attaches to window
          window.Jupiter.init({
            displayMode: "integrated",
            integratedTargetId: "integrated-terminal",
            // Lock output to JUICED so users can only buy JUICED
            formProps: {
              initialOutputMint: JUICED_MINT,
              fixedMint: JUICED_MINT,
            },
          });
        }}
      />

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-zinc-500 text-sm border-t border-zinc-800">
        <div className="flex justify-center gap-6">
          <a
            href="https://jup.ag/lend/earn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C7F284] transition-colors"
          >
            Jupiter Lend
          </a>
          <a
            href="https://dev.jup.ag/tool-kits/plugin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C7F284] transition-colors"
          >
            Plugin Docs
          </a>
          <a
            href="https://dev.jup.ag/docs/jupusd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#C7F284] transition-colors"
          >
            JupUSD Docs
          </a>
        </div>
      </footer>
    </main>
  );
}
