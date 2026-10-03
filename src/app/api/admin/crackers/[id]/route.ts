import { NextRequest, NextResponse } from 'next/server';
import { updateCracker, deleteCracker, getCrackerById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cracker = await getCrackerById(id);
    if (!cracker) {
      return NextResponse.json({ success: false, error: 'Cracker not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, cracker });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updated = await updateCracker(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Cracker not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, cracker: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteCracker(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Cracker not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cracker removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
