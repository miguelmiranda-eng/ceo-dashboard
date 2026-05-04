/**
 * Dedicated route for fetching a single invoice with full attachment data.
 * Uses streaming to bypass the JSON re-serialization size limit in the main /api/mos proxy.
 */
import { type NextRequest } from 'next/server'

const MOS_BACKEND_URL = process.env.MOS_BACKEND_URL || 'http://localhost:8000'
const MOS_SERVICE_EMAIL = process.env.MOS_SERVICE_EMAIL || ''
const MOS_SERVICE_PASSWORD = process.env.MOS_SERVICE_PASSWORD || ''
const MOS_INTERNAL_TOKEN = process.env.MOS_INTERNAL_TOKEN || ''

let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string | null> {
  if (MOS_INTERNAL_TOKEN) return MOS_INTERNAL_TOKEN
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  if (!MOS_SERVICE_EMAIL || !MOS_SERVICE_PASSWORD) return null

  try {
    const res = await fetch(`${MOS_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: MOS_SERVICE_EMAIL, password: MOS_SERVICE_PASSWORD }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const setCookie = res.headers.get('set-cookie') || ''
    const match = setCookie.match(/session_token=([^;]+)/)
    if (!match) return null
    cachedToken = match[1]
    tokenExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000
    return cachedToken
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const invoiceId = request.nextUrl.searchParams.get('id')
  if (!invoiceId) {
    return Response.json({ error: 'Missing invoice id' }, { status: 400 })
  }

  const token = await getToken()
  if (!token) {
    return Response.json({ error: 'Authentication failed' }, { status: 401 })
  }

  const upstream = `${MOS_BACKEND_URL}/api/invoices/${encodeURIComponent(invoiceId)}`

  try {
    const res = await fetch(upstream, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `session_token=${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      return new Response(body, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream the body directly — no re-serialization, no size limit
    return new Response(res.body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[invoice-detail] Fetch error:', err)
    return Response.json({ error: 'Failed to reach MOS backend' }, { status: 502 })
  }
}
