import { type NextRequest } from 'next/server'

const MOS_BACKEND_URL = process.env.MOS_BACKEND_URL || 'https://mosdatabase-backend.k9pirj.easypanel.host'
const MOS_INTERNAL_TOKEN = process.env.MOS_INTERNAL_TOKEN || ''
const MOS_SERVICE_EMAIL = process.env.MOS_SERVICE_EMAIL || ''
const MOS_SERVICE_PASSWORD = process.env.MOS_SERVICE_PASSWORD || ''

// ─── Session cache (module-level, server-side only) ───────────────────────────
// The session token is valid for 7 days. We cache it to avoid re-logging in on
// every request. The Next.js dev server re-uses this module across requests.
let cachedToken: string | null = null
let tokenExpiry: number = 0          // epoch ms when the cached token expires

// Global memory cache for MOS responses (TTL: 2 minutes)
const mosCache = new Map<string, { data: any; expiry: number }>()
const MOS_CACHE_TTL = 2 * 60 * 1000 // 2 minutes

async function getAuthToken(): Promise<string | null> {
  // 1. Try the internal sync token first (fastest — works if it's set in production)
  if (MOS_INTERNAL_TOKEN) {
    const ok = await verifyToken(MOS_INTERNAL_TOKEN)
    if (ok) return MOS_INTERNAL_TOKEN
  }

  // 2. Check the cached email/password session token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  // 3. Login with service account credentials to obtain a fresh session token
  if (!MOS_SERVICE_EMAIL || !MOS_SERVICE_PASSWORD) {
    return null
  }

  return await loginAndCache()
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${MOS_BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

async function loginAndCache(): Promise<string | null> {
  try {
    const res = await fetch(`${MOS_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: MOS_SERVICE_EMAIL,
        password: MOS_SERVICE_PASSWORD,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[MOS Proxy] Login failed:', await res.text())
      return null
    }

    // The login response sets a Set-Cookie header with the session_token.
    // We parse it out to use as a Bearer token in subsequent requests.
    const setCookie = res.headers.get('set-cookie') || ''
    const match = setCookie.match(/session_token=([^;]+)/)
    if (!match) {
      console.error('[MOS Proxy] session_token cookie not found in login response')
      return null
    }

    const token = match[1]
    // Cache for 6 days (backend issues 7-day tokens; we refresh with 1 day margin)
    cachedToken = token
    tokenExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000
    console.log('[MOS Proxy] Login successful, token cached for 6 days')
    return token
  } catch (err) {
    console.error('[MOS Proxy] Login error:', err)
    return null
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

/**
 * Server-side proxy to the MOS backend.
 * Authentication priority:
 *   1. INTERNAL_SYNC_TOKEN env var (set this in the production easypanel environment)
 *   2. Email/password login with MOS_SERVICE_EMAIL + MOS_SERVICE_PASSWORD
 *
 * Usage:
 *   GET /api/mos?endpoint=production-analytics&preset=today
 *   GET /api/mos?endpoint=capacity-plan
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const endpoint = searchParams.get('endpoint')

  if (!endpoint) {
    return Response.json({ error: 'Missing endpoint param' }, { status: 400 })
  }

  // Obtain a valid auth token
  const token = await getAuthToken()
  if (!token) {
    return Response.json(
      {
        error: 'MOS authentication failed. Set MOS_INTERNAL_TOKEN or MOS_SERVICE_EMAIL + MOS_SERVICE_PASSWORD in .env.local',
        hint: 'Add your MOS credentials to .env.local',
      },
      { status: 401 }
    )
  }

  // Build the upstream URL, forwarding all query params except 'endpoint'
  const upstream = new URL(`${MOS_BACKEND_URL}/api/${endpoint}`)
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      upstream.searchParams.set(key, value)
    }
  })

  try {
    // 1. Check Cache
    const cacheKey = upstream.toString();
    const cached = mosCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      // console.log(`[MOS Proxy] Serving ${endpoint} from cache`);
      return Response.json(cached.data);
    }

    const res = await fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: `session_token=${token}`,
      },
      cache: 'no-store',
    })

    const data = await res.json()

    if (res.status === 401) {
      cachedToken = null
      tokenExpiry = 0
      const freshToken = await loginAndCache()

      if (freshToken) {
        const retry = await fetch(upstream.toString(), {
          headers: {
            Authorization: `Bearer ${freshToken}`,
            Cookie: `session_token=${freshToken}`,
          },
          cache: 'no-store',
        })
        const retryData = await retry.json()
        
        // Cache successful retry
        if (retry.ok) {
           mosCache.set(cacheKey, { data: retryData, expiry: Date.now() + MOS_CACHE_TTL });
        }
        
        return Response.json(retryData, { status: retry.status })
      }

      return Response.json({ error: 'Authentication expired' }, { status: 401 })
    }

    if (!res.ok) {
      return Response.json(
        { error: data?.detail || 'MOS backend error', status: res.status },
        { status: res.status }
      )
    }

    // Update Cache
    mosCache.set(cacheKey, { data, expiry: Date.now() + MOS_CACHE_TTL });

    return Response.json(data)
  } catch (err) {
    console.error('[MOS Proxy] Fetch error:', err)
    return Response.json({ error: 'Failed to reach MOS backend' }, { status: 502 })
  }
}
