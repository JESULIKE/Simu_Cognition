/**
 * server/utils/ml.ts
 * ──────────────────
 * Cliente del microservicio Python (FastAPI). Centraliza URL, clave de API y
 * timeouts para que ningún endpoint repita esa configuración.
 */

export function mlFetch<T>(
  path: string,
  opts: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string>; timeout?: number; responseType?: "json" | "text" } = {},
): Promise<T> {
  const cfg = useRuntimeConfig();
  const headers: Record<string, string> = {};
  if (cfg.mlApiKey) headers["X-ML-Key"] = cfg.mlApiKey as string;

  return $fetch<T>(`${cfg.mlServiceUrl}${path}`, {
    method: opts.method ?? "POST",
    body: opts.body as Record<string, unknown> | undefined,
    query: opts.query,
    headers,
    timeout: opts.timeout ?? 15000,
    responseType: opts.responseType as "json" | "text" | undefined,
  } as never);
}
