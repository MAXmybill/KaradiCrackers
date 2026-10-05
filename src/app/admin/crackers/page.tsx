import { getCrackers, getStoreSettings } from '@/lib/db';
import ManageCrackersClient from '@/components/ManageCrackersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCrackersPage() {
  const [crackers, settings] = await Promise.all([
    getCrackers(false),
    getStoreSettings(),
  ]);

  return <ManageCrackersClient initialCrackers={crackers} initialSettings={settings} />;
}
