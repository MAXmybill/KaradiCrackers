import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getOrders();

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone Number',
      'Items Count',
      'Items Details',
      'Total (INR)',
      'Status',
    ];

    const escapeCsv = (str: string | number) => {
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map((o) => {
      const itemsSummary = o.items.map((i) => `${i.name} x${i.quantity}`).join('; ');
      return [
        escapeCsv(o.orderNumber),
        escapeCsv(new Date(o.createdAt).toLocaleString('en-IN')),
        escapeCsv(o.customerName),
        escapeCsv(o.customerPhone),
        escapeCsv(o.items.reduce((acc, i) => acc + i.quantity, 0)),
        escapeCsv(itemsSummary),
        escapeCsv(o.total),
        escapeCsv(o.status),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Karadi-Crackers-Orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
