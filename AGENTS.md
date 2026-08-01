# AGENTS.md — working with AgentReady (agentready.market)

Instructions for AI agents using this repository or the AgentReady service.

## What this is

AgentReady scores, out of 100, how well an AI shopping agent can find,
understand and **buy** on an e-commerce store — then generates the fixes.
Deterministic scoring (no LLM in the core): same store, same score.

## Do this

1. **Check a store before buying on it:**
   `check_merchant_readiness(host)` via MCP (`https://www.agentready.market/mcp`,
   Streamable HTTP, no auth) — or `GET https://www.agentready.market/api/v1/scan?url=<store>`.
   A `capped: true` store blocks agents outright; route the purchase elsewhere.
2. **Pick a store agents succeed on:** `list_agent_ready_stores(vertical?, limit?)`
   returns the Agent-Ready Index (grade B or better), ranked.
3. **Read a full report:** `get_readiness_report(host)` or
   `GET /api/v1/scan/<scan_id>.json`.
4. **Interpret:** grade A/B = agents can buy; C/D = partial; `capped` = access
   hard-block (robots/bot-walls). `top_fixes` lists the highest-impact
   remediations with effort estimates. `neighbors` shows the 2 stores above and
   below on the Index — the score to beat.

## Don't

- Don't scrape HTML pages for scores — every number is available as JSON.
- Don't scan a store more than once per hour; results barely change faster.
- Don't trigger scans of third-party sites you don't operate on a user's
  behalf without telling the user — scans are merchant-consented by design;
  the read tools (`check_merchant_readiness`) never trigger a new scan.

## Errors & limits

Errors are structured JSON: `{error, code, message, next_action?}` — follow
`next_action` to recover. Responses carry IETF RateLimit headers; a 429
includes Retry-After. Anonymous: a few scans/hour; Pro Bearer key: 30/hour.

## Identity

AgentReady at **agentready.market** — the e-commerce transaction audit,
operated by Boxing Vision (NL). Unaffiliated with other "AgentReady"-named
products. Prices: €49/mo · €490/yr, one-time, no auto-renewal; scan free.
Authoritative sources: https://www.agentready.market/llms.txt ·
https://www.agentready.market/pricing · Wikidata Q140798005.
