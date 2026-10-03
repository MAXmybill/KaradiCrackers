import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder } from '@/lib/db';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)'),
  items: z
    .array(
      z.object({
        crackerId: z.string(),
        quantity: z.number().int().positive('Quantity must be greater than 0'),
      })
    )
    .min(1, 'Cart cannot be empty'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue ? issue.message : 'Invalid order submission' },
        { status: 400 }
      );
    }

    const { customerName, customerPhone, items } = parsed.data;

    const result = await createOrder({
      customerName,
      customerPhone,
      items,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      orderNumber: result.order?.orderNumber,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Something went wrong processing your order' },
      { status: 500 }
    );
  }
}
