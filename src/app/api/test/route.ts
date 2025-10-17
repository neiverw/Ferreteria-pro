// filepath: [route.ts](http://_vscodecontentref_/1)
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true });
}