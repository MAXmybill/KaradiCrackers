import { getCrackers } from '@/lib/db';
import CrackersCatalogClient from '@/components/CrackersCatalogClient';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CrackersPage() {
  const crackers = await getCrackers(true);

  return (
    <div className="bg-[#FFFDF7] min-h-screen pb-12 sm:pb-16 pt-2 sm:pt-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Page Header (Hidden on Mobile) */}
        <div className="hidden sm:flex mb-6 text-left border-b-2 border-red-100 pb-5 items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#D40000] bg-red-100/70 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Diwali 2026 Price List</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              CRACKERS CATALOG
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Select items, update quantities, and add to your cart. No payment required until shop pickup.
            </p>
          </div>
          <div className="bg-[#D40000] text-white p-3.5 rounded-2xl border-2 border-[#FFC400] text-center shadow-sm">
            <span className="text-xs font-semibold block text-amber-200">Factory Fresh Stock</span>
            <span className="text-lg font-black text-[#FFC400]">100% Sivakasi Tested</span>
          </div>
        </div>

        {/* Client Product Listing */}
        <CrackersCatalogClient initialCrackers={crackers} />
      </div>
    </div>
  );
}
