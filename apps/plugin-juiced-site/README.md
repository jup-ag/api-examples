# JUICED Community Site with Jupiter Plugin

A minimal community site for the JUICED token with an embedded Jupiter Plugin swap widget. Users can swap any token into JUICED directly on the site.

## What this demonstrates

- Embedding Jupiter Plugin with a single `<Script>` tag in Next.js
- Locking the output token to JUICED using `fixedMint`
- No RPC, no wallet adapter, no backend required

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

The entire Plugin integration is in `src/app/page.tsx`:

```tsx
<Script
  src="https://plugin.jup.ag/plugin-v1.js"
  data-preload
  strategy="afterInteractive"
  onReady={() => {
    window.Jupiter.init({
      displayMode: "integrated",
      integratedTargetId: "integrated-terminal",
      formProps: {
        initialOutputMint: "7GxATsNMnaC88vdwd2t3mwrFuQwwGvmYPrUQ4D6FotXk",
        fixedMint: "7GxATsNMnaC88vdwd2t3mwrFuQwwGvmYPrUQ4D6FotXk",
      },
    });
  }}
/>
```

To use this for your own token, replace the mint address with your token's mint.

## Resources

- [Plugin Guide](https://dev.jup.ag/guides/how-to-embed-a-swap-widget)
- [Plugin Docs](https://dev.jup.ag/tool-kits/plugin)
- [Plugin Playground](https://plugin.jup.ag) (visual configurator)
