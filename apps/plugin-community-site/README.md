# Token Community Site with Jupiter Plugin

A minimal Next.js community site template with an embedded Jupiter Plugin swap widget. Users can swap any token into your token directly on the site.

## What this demonstrates

- Embedding Jupiter Plugin with a single `<Script>` tag in Next.js
- Locking the output token using `fixedMint`
- No RPC, no wallet adapter, no backend required

## Configure

Edit the constants at the top of `src/app/page.tsx`:

```tsx
const TOKEN_MINT = "YOUR_TOKEN_MINT_ADDRESS";  // Swap output locked to this
const TOKEN_NAME = "YOUR TOKEN";
const TOKEN_DESCRIPTION = "...";
const ACCENT = "#C7F284";                       // Your brand colour
const STATS = [ ... ];                          // Hardcoded stats
const LINKS = [ ... ];                          // Footer links
```

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
        initialOutputMint: TOKEN_MINT,
        fixedMint: TOKEN_MINT,
      },
    });
  }}
/>
```

Replace `TOKEN_MINT` with your token's mint address. `fixedMint` locks the output so users can only buy your token.

## Resources

- [Plugin Guide](https://developers.jup.ag/docs/guides/how-to-embed-a-swap-widget)
- [Plugin Docs](https://developers.jup.ag/docs/tool-kits/plugin)
- [Plugin Playground](https://plugin.jup.ag) (visual configurator)
