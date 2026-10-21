import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateCrackerPrices } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const bulkPriceSchema = z.object({
  percentage: z.number().min(0.1, 'Percentage must be greater than 0').max(100, 'Percentage cannot exceed 100'),
  action: z.enum(['increase', 'decrease']),
  categories: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulkPriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { percentage, action, categories } = parsed.data;
    const result = await bulkUpdateCrackerPrices(percentage, action, categories);

    revalidatePath('/crackers');
    revalidatePath('/admin/crackers');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'increase' ? 'increased' : 'decreased'} prices by ${percentage}% for ${result.count} products`,
      count: result.count,
      crackers: result.crackers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
