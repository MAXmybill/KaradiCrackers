import { NextResponse } from 'next/server';
import { getCrackers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';
    const crackers = await getCrackers(availableOnly);
    return NextResponse.json({ success: true, crackers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch crackers' },
      { status: 500 }
    );
  }
}
