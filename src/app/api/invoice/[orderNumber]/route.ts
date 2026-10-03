import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/pdfGenerator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const pdfBytes = await generateInvoicePdf(order);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Karadi-Crackers-Invoice-${order.orderNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF invoice' },
      { status: 500 }
    );
  }
}
