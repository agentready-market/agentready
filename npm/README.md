# agentready-market

TypeScript/JavaScript client for the **AgentReady** scan API
([agentready.market](https://www.agentready.market)) — the e-commerce
agent-readiness audit: **can an AI shopping agent find, understand and BUY on a
store?** Deterministic score /100.

> Unaffiliated with other products named "AgentReady".

## Install

```bash
npm install agentready-market
```

Node 18+ (uses global `fetch`). Zero runtime dependencies.

## Use

```ts
import AgentReady from "agentready-market";

const client = new AgentReady(); // free, keyless

const result = await client.scan("https://shop.example.com", "dtc_fashion");
console.log(result.score, result.grade);      // e.g. 62 "C"
console.log(result.report_url);               // shareable full report
console.log(result.neighbors);                // your window on the Agent-Ready Index

const stored = await client.report(result.scan_id);

// Pro (bulk reads across a portfolio, up to 100 hosts):
const pro = new AgentReady({ apiKey: process.env.AGENTREADY_API_KEY });
const { reports } = await pro.reports(["shop-a.com", "shop-b.com"]);
```

Errors are typed: every non-2xx throws `AgentReadyError` with `status`, `code`
(e.g. `RATE_LIMITED`, `SCAN_TIMEOUT`), the full body, and `retryAfterSeconds`
when the API sets `Retry-After`. Responses carry IETF `RateLimit-*` headers so
you can self-throttle.

## API surface

| Method | Endpoint | Notes |
|---|---|---|
| `scan(url, vertical?)` | `GET /api/v1/scan` | ~30s, synchronous, free |
| `report(scanId)` | `GET /api/v1/scan/{id}.json` | stored report |
| `reports(hosts)` | `POST /api/v1/reports` | Pro key, ≤100 hosts |
| `index()` | `GET /api/v1` | discovery document |

Full spec: [openapi.json](https://www.agentready.market/openapi.json) ·
Docs: [agentready.market/api](https://www.agentready.market/api) ·
MCP server (no key): `POST https://www.agentready.market/mcp` (Streamable HTTP)

## License

MIT © AgentReady (agentready.market), operated by Boxing Vision (NL)
