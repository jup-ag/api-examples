# Jupiter Price API Dashboard

Live token price dashboard for SOL, JUP, and USDC — powered by the [Jupiter Price API v3](https://dev.jup.ag/docs/price/v3).

## What it does

- Fetches live prices from `GET https://api.jup.ag/price/v3?ids={mints}`
- Displays all fields returned by the API: `usdPrice`, `liquidity`, `blockId`, `decimals`, `createdAt`, `priceChange24h`
- Auto-refreshes every 10 seconds with a visible countdown timer
- Green/red indicators for price upticks and downticks

## Setup

1. Get an API key from [portal.jup.ag](https://portal.jup.ag/)

2. Create a `.env` file in this directory:

```
JUPITER_API_KEY=your_api_key_here
```

3. Install dependencies and run:

```bash
# From the monorepo root
pnpm install
pnpm --filter price-api dev

# Or from this directory
pnpm install
pnpm dev
```

## Project structure

```
src/app/
  api/prices/route.ts   # Server-side proxy for Jupiter Price API (keeps API key secure)
  page.tsx              # Dashboard UI — polling, countdown timer, token cards
  layout.tsx            # Root layout with metadata
  globals.css           # Tailwind config with Jupiter theme colors
```

## API reference

Guide: [How to get token price](https://dev.jup.ag/guides/how-to-get-token-price)

```
GET https://api.jup.ag/price/v3?ids={comma_separated_mints}
Header: x-api-key: YOUR_API_KEY
```

Response per token:

| Field            | Type   | Description                              |
| ---------------- | ------ | ---------------------------------------- |
| `usdPrice`       | number | Current USD price                        |
| `liquidity`      | number | Total USD liquidity across pools         |
| `blockId`        | number | Solana block ID when price was computed  |
| `decimals`       | number | Token decimal places                     |
| `createdAt`      | string | ISO timestamp of token creation          |
| `priceChange24h` | number | 24-hour percentage change                |
