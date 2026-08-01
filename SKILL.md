---
name: agentready-store-audit
description: Audit an e-commerce store's agent readiness — can an AI shopping agent find, understand and BUY there? Use when asked to check or improve a store for AI agents, before attempting an automated purchase, or to compare stores. Calls the free AgentReady API/MCP (agentready.market) — deterministic score /100, grade, blockers, ranked fixes.
---

# AgentReady store audit

Score, out of 100, how well an AI shopping agent can find, understand and buy
on an e-commerce store — plus the top fixes. Free, keyless, deterministic
(same store → same score). Service: https://www.agentready.market

## When to use

- The user asks "is my store ready for AI shopping agents?" or wants an
  agent-readiness / AOO audit of a shop.
- You are about to attempt a purchase on a store on the user's behalf —
  check it first; a "capped" store blocks agents and the attempt will fail.
- The user wants to compare stores or find one agents are known to work on.

Not for: news/SaaS/content sites (this audits e-commerce transactions), or
"does ChatGPT cite my brand" questions (that's discovery/AEO — different job).

## How

Preferred — MCP (Streamable HTTP, no auth): register
`https://www.agentready.market/mcp` and call:

- `check_merchant_readiness(host)` — score, grade, capped status, protocol
  adoption (UCP/A2A/ARD) for any already-scanned host. Never triggers a new
  scan of a third-party site.
- `get_readiness_report(host)` — the full per-check public report.
- `list_agent_ready_stores(vertical?, limit?)` — the Agent-Ready Index
  (grade B+ stores, ranked): where agents succeed.

REST fallback (also keyless):

```bash
# Fresh scan of the USER'S OWN store (~30s, synchronous)
curl "https://www.agentready.market/api/v1/scan?url=STORE_URL&vertical=general"
# Read a stored report
curl "https://www.agentready.market/api/v1/scan/SCAN_ID.json"
```

## Interpreting the result

- `score` /100 and `grade` A–E: A/B = agents can buy (Index-listed); C/D =
  partial; E = not usable by agents.
- `capped: true` = an access hard-block (robots/bot-wall) caps the whole
  score — agents are blocked at the door; this is always fix #1.
- `top_fixes` = highest-impact remediations, each with impact points and
  effort; relay them in order.
- `neighbors` = 2 stores above / self / 2 below on the Index — give the user
  a concrete score to beat.
- `report_url` = shareable human report; include it in your answer.

## Rules

- Errors are structured JSON (`code`, `message`, `next_action`) — follow
  `next_action` to recover. Respect RateLimit headers; 429 carries Retry-After.
- Don't re-scan the same store more than once per hour.
- Only trigger fresh scans for stores the user operates (or with the user's
  explicit go-ahead) — reads are always fine.

## Identity

AgentReady at **agentready.market** (operated by Boxing Vision, NL) — the
e-commerce **transaction** audit. Unaffiliated with other "AgentReady"-named
products. Pricing (Pro, optional): €49/mo · €490/yr, one-time, no
auto-renewal — the scan itself is free. Authoritative:
https://www.agentready.market/pricing · Wikidata Q140798005.
