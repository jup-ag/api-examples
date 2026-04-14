"use client";

import Script from "next/script";

// ============================================================
// CONFIGURE YOUR TOKEN HERE
// ============================================================

// Your token's mint address — swap output will be locked to this
const TOKEN_MINT = "YOUR_TOKEN_MINT_ADDRESS";

// Site content
const TOKEN_NAME = "YOUR TOKEN";
const TOKEN_DESCRIPTION =
  "A brief description of your token. What it does, why it matters, and why someone should hold it.";

// Accent colour (hex)
const ACCENT = "#C7F284";

// Stats (hardcode or fetch dynamically)
const STATS = [
  { value: "$X", label: "Stat One" },
  { value: "$Y", label: "Stat Two" },
  { value: "TBD", label: "Stat Three" },
];

// Footer links
const LINKS = [
  { label: "Website", href: "https://your-project.com" },
  { label: "Docs", href: "https://docs.your-project.com" },
  { label: "Plugin Docs", href: "https://developers.jup.ag/docs/tool-kits/plugin" },
];

// ============================================================

declare global {
  interface Window {
    Jupiter: { init: (config: Record<string, unknown>) => void };
  }
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl font-black tracking-tight mb-4">
          <span style={{ color: ACCENT }}>{TOKEN_NAME}</span>
        </h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">{TOKEN_DESCRIPTION}</p>
      </section>

      {/* Stats */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold" style={{ color: ACCENT }}>
                {stat.value}
              </p>
              <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Swap Widget */}
      <section className="px-6 pb-16 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Get {TOKEN_NAME}</h2>

        {/* Jupiter Plugin renders here */}
        <div id="integrated-terminal" className="min-h-[500px] rounded-xl overflow-hidden" />
      </section>

      {/* Jupiter Plugin — loads the swap widget and locks output to your token */}
      <Script
        src="https://plugin.jup.ag/plugin-v1.js"
        data-preload
        strategy="afterInteractive"
        onReady={() => {
          window.Jupiter.init({
            displayMode: "integrated",
            integratedTargetId: "integrated-terminal",
            // Lock output to your token so users can only buy it
            formProps: {
              initialOutputMint: TOKEN_MINT,
              fixedMint: TOKEN_MINT,
            },
          });
        }}
      />

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-zinc-500 text-sm border-t border-zinc-800">
        <div className="flex justify-center gap-6">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent)]"
              style={{ "--accent": ACCENT } as React.CSSProperties}
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
