import { getOrders } from '@/lib/db';
import ManageOrdersClient from '@/components/ManageOrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <ManageOrdersClient initialOrders={orders} />;
}
