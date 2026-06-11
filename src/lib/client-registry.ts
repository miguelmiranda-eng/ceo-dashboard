/**
 * Client registry — full customer records captured from the dashboard.
 *
 * MOS has no clients collection and must NOT be modified, so records are
 * persisted through the existing `config/options` endpoint under a dedicated
 * `client_registry` key. That endpoint stores `List[str]`, so each record is
 * serialized as a JSON string and parsed back on read. The plain `clients`
 * dropdown list is kept in sync so names keep appearing in the invoice form.
 */

import { fetchOptions } from "@/lib/api"

export interface ClientRecord {
  id: string
  name: string
  company?: string
  contact?: string
  email?: string
  phone?: string
  /** Default payment terms, e.g. "Net 30". */
  terms?: string
  tax_id?: string
  billing_address?: string
  shipping_address?: string
  notes?: string
  created_at?: string
}

const REGISTRY_KEY = "client_registry"

function apiBase(): string {
  return typeof window !== "undefined" ? window.location.origin : ""
}

async function putOption(option_key: string, values: string[]): Promise<void> {
  const res = await fetch(`${apiBase()}/api/mos?endpoint=config/options`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option_key, values }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Failed to save ${option_key}: HTTP ${res.status}`)
  }
}

export async function fetchClientRegistry(): Promise<ClientRecord[]> {
  const options: any = await fetchOptions()
  const raw = options?.[REGISTRY_KEY]
  if (!Array.isArray(raw)) return []
  const records: ClientRecord[] = []
  for (const item of raw) {
    try {
      const rec = typeof item === "string" ? JSON.parse(item) : item
      if (rec && rec.name) records.push(rec as ClientRecord)
    } catch {
      // skip malformed entries
    }
  }
  return records.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Persist the whole registry and keep the `clients` dropdown list in sync so
 * every registered name remains selectable in the invoice form.
 */
export async function saveClientRegistry(records: ClientRecord[]): Promise<void> {
  await putOption(REGISTRY_KEY, records.map((r) => JSON.stringify(r)))

  // Merge registry names into the existing `clients` dropdown list.
  const options: any = await fetchOptions()
  const existing: string[] = Array.isArray(options?.clients) ? options.clients : []
  const merged = Array.from(new Set([...existing, ...records.map((r) => r.name)])).sort()
  if (merged.length !== existing.length) {
    await putOption("clients", merged)
  }
}

export function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  // Fallback: name-independent unique-ish id without Date/Math in module scope.
  return `c_${Math.abs(Math.floor(performance.now() * 1000))}`
}
