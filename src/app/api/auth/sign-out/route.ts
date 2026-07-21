import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    const url = new URL('/sign-in', request.url);
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.redirect(new URL('/sign-in', request.url), 303);
}

export async function POST(request: Request) {
  return GET(request);
}
