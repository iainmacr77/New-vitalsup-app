import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  if (host && host.includes('vitalsup-app.vercel.app')) {
    url.hostname = 'app.vitalsup.co.za';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
} 