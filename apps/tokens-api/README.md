# Jupiter Token Explorer

Search and explore Solana tokens — powered by the [Jupiter Tokens API v2](https://dev.jup.ag/guides/how-to-get-token-information).

## What it does

- Search tokens by name, symbol, or mint address via `GET https://api.jup.ag/tokens/v2/search`
- Browse trending tokens via `GET https://api.jup.ag/tokens/v2/toptrending/1h`
- Displays all fields returned by the API: metadata, verification status, organic score, safety audit, holder count, market cap, liquidity, and trading stats
- Colour-coded safety audit badges (mint/freeze authority, top holder concentration)

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
pnpm --filter tokens-api dev

# Or from this directory
pnpm install
pnpm dev
```

## Project structure

```
src/app/
  api/tokens/route.ts   # Server-side proxy for Jupiter Tokens API (keeps API key secure)
  page.tsx              # Explorer UI — search, trending, token cards with full API data
  layout.tsx            # Root layout with metadata
  globals.css           # Tailwind config with Jupiter theme colors
```

## API reference

Guide: [How to get token information](https://dev.jup.ag/guides/how-to-get-token-information)

```
GET https://api.jup.ag/tokens/v2/search?query={query}
GET https://api.jup.ag/tokens/v2/toptrending/{interval}
GET https://api.jup.ag/tokens/v2/tag?query={tag}
Header: x-api-key: YOUR_API_KEY
```

Key response fields per token:

| Field              | Type    | Description                               |
| ------------------ | ------- | ----------------------------------------- |
| `id`               | string  | Mint address                              |
| `name`             | string  | Token name                                |
| `symbol`           | string  | Token symbol                              |
| `icon`             | string  | Logo URL                                  |
| `isVerified`       | boolean | Jupiter verification status               |
| `organicScore`     | number  | 0-100 real activity score                 |
| `usdPrice`         | number  | Current USD price                         |
| `mcap`             | number  | Market cap in USD                         |
| `holderCount`      | number  | Number of holders                         |
| `liquidity`        | number  | Total USD liquidity across pools          |
| `audit`            | object  | Mint/freeze authority, top holder %, etc. |
| `stats24h`         | object  | 24h price change, volume, trades          |
