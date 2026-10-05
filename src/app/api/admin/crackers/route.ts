import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCrackers, createCracker } from '@/lib/db';

export const dynamic = 'force-dynamic';

const crackerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().positive().optional().nullable(),
  itemCode: z.string().optional().nullable(),
  piecesContent: z.string().optional().nullable(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  isAvailable: z.boolean().default(true),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET() {
  try {
    const crackers = await getCrackers(false);
    return NextResponse.json({ success: true, crackers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = crackerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid product details' },
        { status: 400 }
      );
    }

    const newCracker = await createCracker({
      ...parsed.data,
      originalPrice: parsed.data.originalPrice ?? undefined,
      itemCode: parsed.data.itemCode ?? undefined,
      piecesContent: parsed.data.piecesContent ?? undefined,
    });
    return NextResponse.json({ success: true, cracker: newCracker });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
