/**
 * agentready-market — client for the AgentReady scan API (agentready.market).
 *
 * The e-commerce agent-readiness audit: can an AI shopping agent find,
 * understand and BUY on a store? Deterministic score /100.
 *
 * Free, keyless reads. Canonical API base: https://www.agentready.market/api/v1
 * (OpenAPI: https://www.agentready.market/openapi.json — errors are structured
 * JSON {error, code, message, next_action?}; responses carry RateLimit headers).
 *
 * Unaffiliated with other products named AgentReady.
 */

const DEFAULT_BASE = "https://www.agentready.market";

export interface ClientOptions {
  /** Override the API origin (testing/staging). Default: https://www.agentready.market */
  baseUrl?: string;
  /** Pro API key (`ar_…`) — optional; raises scan quotas and links scans to your account. */
  apiKey?: string;
  /** Custom fetch implementation (Node 18+ has global fetch). */
  fetch?: typeof fetch;
}

export interface Neighbor {
  rank: number;
  host: string;
  score: number;
  grade: string;
  is_self: boolean;
}

export interface ScanResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "E";
  capped: boolean;
  pillars: unknown[];
  top_fixes: unknown[];
  scan_id: number;
  report_url: string;
  /** Your window on the Agent-Ready Index: 2 stores above you, yourself, 2 below. */
  neighbors: Neighbor[];
  [key: string]: unknown;
}

export interface StoredReport {
  scan_id: number;
  url: string;
  vertical: string;
  scanned_at: string;
  score: number;
  grade: string;
  report_url: string;
  result: unknown;
}

export interface HostReport {
  host: string;
  scanned: boolean;
  score?: number;
  grade?: string;
  capped?: boolean;
  agent_ready_verified?: boolean;
  scanned_at?: string;
  report_url?: string;
}

export interface ApiErrorBody {
  error: string;
  code: string;
  message: string;
  next_action?: {
    method?: string;
    endpoint?: string;
    params?: Record<string, unknown>;
    description?: string;
  };
}

/** Thrown on any non-2xx API response; carries the typed error body. */
export class AgentReadyError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: ApiErrorBody;
  readonly retryAfterSeconds?: number;

  constructor(status: number, body: ApiErrorBody, retryAfterSeconds?: number) {
    super(`${body.code}: ${body.message}`);
    this.name = "AgentReadyError";
    this.status = status;
    this.code = body.code;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class AgentReady {
  private readonly base: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.base = (options.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? fetch;
  }

  /**
   * Run a fresh agent-readiness scan (~30s, synchronous).
   * Free and keyless; quotas per the RateLimit headers.
   */
  async scan(url: string, vertical?: string): Promise<ScanResult> {
    const qs = new URLSearchParams({ url });
    if (vertical) qs.set("vertical", vertical);
    return this.request<ScanResult>(`/api/v1/scan?${qs}`);
  }

  /** Read a stored scan report by id. */
  async report(scanId: number): Promise<StoredReport> {
    return this.request<StoredReport>(`/api/v1/scan/${scanId}.json`);
  }

  /**
   * Bulk read: latest stored report for up to 100 hosts in one call.
   * Requires a Pro API key.
   */
  async reports(hosts: string[]): Promise<{ reports: HostReport[] }> {
    return this.request<{ reports: HostReport[] }>(`/api/v1/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hosts }),
    });
  }

  /** The API discovery document (endpoints, docs, versioning policy). */
  async index(): Promise<unknown> {
    return this.request<unknown>(`/api/v1`);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (this.apiKey) headers.set("Authorization", `Bearer ${this.apiKey}`);
    const resp = await this.fetchImpl(`${this.base}${path}`, { ...init, headers });
    if (!resp.ok) {
      let body: ApiErrorBody;
      try {
        body = (await resp.json()) as ApiErrorBody;
      } catch {
        body = { error: resp.statusText, code: "HTTP_" + resp.status, message: resp.statusText };
      }
      const retryAfter = resp.headers.get("Retry-After");
      throw new AgentReadyError(resp.status, body, retryAfter ? Number(retryAfter) : undefined);
    }
    return (await resp.json()) as T;
  }
}

export default AgentReady;
