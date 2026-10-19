import { getCrackers, getStoreSettings } from '@/lib/db';
import CrackersCatalogClient from '@/components/CrackersCatalogClient';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function CrackersPage() {
  const [crackers, settings] = await Promise.all([
    getCrackers(true),
    getStoreSettings(),
  ]);

  return (
    <div className="bg-white min-h-screen pb-12 sm:pb-16 pt-2 sm:pt-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Page Header - Ultra Compact Single Line */}
        <div className="mb-2 sm:mb-4 text-left border-b border-red-100 pb-1.5 sm:pb-3 flex items-center justify-between gap-2">
          {/* Left Title */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[8px] sm:text-[11px] font-black uppercase text-[#D40000] bg-red-100/70 px-2 sm:px-2.5 py-0.5 rounded-full mb-0.5">
              <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#FFC400]" />
              <span>Diwali 2026 Price List</span>
            </div>
            <h1 className="text-base sm:text-2xl lg:text-3xl font-black text-gray-950 leading-none tracking-tight truncate">
              CRACKERS CATALOG
            </h1>
          </div>

          {/* Right Badges: Sleek, compact identical slim pills taking minimum space */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="bg-[#D40000] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#FFC400] text-center shadow-2xs leading-none">
              <span className="text-[7.5px] sm:text-[9px] font-bold uppercase text-amber-200 block leading-tight">
                DIWALI
              </span>
              <span className="text-[9px] sm:text-[11px] font-black text-[#FFC400] uppercase tracking-wide block mt-0.5">
                BEST OFFER
              </span>
            </div>

            <div className="bg-[#D40000] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#FFC400] text-center shadow-2xs leading-none">
              <span className="text-[7.5px] sm:text-[9px] font-bold uppercase text-amber-200 block leading-tight">
                UNIQUE
              </span>
              <span className="text-[9px] sm:text-[11px] font-black text-[#FFC400] uppercase tracking-wide block mt-0.5">
                CRACKERS
              </span>
            </div>
          </div>
        </div>

        {/* Client Product Listing */}
        <CrackersCatalogClient initialCrackers={crackers} settings={settings} />
      </div>
    </div>
  );
}
