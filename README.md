# Jupiter API Examples

Example apps built with [Jupiter](https://developers.jup.ag/docs) APIs.

## Apps

| App | Description |
|---|---|
| [prediction-markets](apps/prediction-markets) | Prediction markets trading UI with orderbook, positions, and wallet integration |
| [prediction-API-video-demo](apps/prediction-API-video-demo) | Sports prediction market app — event browsing, multi-market views, bet placement with USDC/JupUSD |
| [price-api](apps/price-api) | Token price dashboard using the Jupiter Price API |
| [tokens-api](apps/tokens-api) | Token list and metadata explorer using the Jupiter Tokens API |

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env.local` in any app directory and fill in your keys.

### Run a single app

```bash
cd apps/prediction-markets
pnpm dev
```

### Run all apps

```bash
pnpm dev
```

## Resources

- [Jupiter Developer Docs](https://developers.jup.ag/docs)

## License

See [LICENSE](LICENSE).
