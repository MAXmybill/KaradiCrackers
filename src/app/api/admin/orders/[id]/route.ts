import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateOrderItems, settleOrderCredit, getOrderByNumber } from '@/lib/db';
import { OrderStatus, PaymentType, Branch, OrderItem } from '@/types';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, extraDiscount, paymentType, branch, items } = body;

    let updated = null;

    if (action === 'update_items') {
      if (!Array.isArray(items)) {
        return NextResponse.json({ success: false, error: 'Items must be an array' }, { status: 400 });
      }
      updated = await updateOrderItems(id, items as OrderItem[]);
    } else if (action === 'settle_credit') {
      updated = await settleOrderCredit(id);
    } else {
      // Default: Status change (with optional paymentType and branch)
      if (status && !['ORDERED', 'DELIVERED'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
      }

      updated = await updateOrderStatus(
        id,
        (status as OrderStatus) || 'DELIVERED',
        extraDiscount,
        {
          paymentType: paymentType as PaymentType | undefined,
          branch: branch as Branch | undefined,
        }
      );
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath(`/order/${updated.orderNumber}`);

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
