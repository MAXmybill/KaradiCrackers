import { getCrackers } from '@/lib/db';
import ManageCrackersClient from '@/components/ManageCrackersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCrackersPage() {
  const crackers = await getCrackers(false);

  return <ManageCrackersClient initialCrackers={crackers} />;
}
