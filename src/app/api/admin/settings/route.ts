import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStoreSettings, updateStoreSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

const settingsSchema = z.object({
  showPricing: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid settings data' },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings(parsed.data);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
