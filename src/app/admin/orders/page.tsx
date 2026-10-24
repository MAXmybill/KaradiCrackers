import { getOrders, getCrackers } from '@/lib/db';
import ManageOrdersClient from '@/components/ManageOrdersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminOrdersPage() {
  const [orders, crackers] = await Promise.all([
    getOrders(),
    getCrackers(false),
  ]);

  return <ManageOrdersClient initialOrders={orders} allCrackers={crackers} />;
}
