import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('ceo_auth');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login' || pathname === '/') {
    if (authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
