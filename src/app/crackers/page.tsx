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
        {/* Page Header - Ultra Space Efficient Single Row on Mobile */}
        <div className="mb-2 sm:mb-6 text-left border-b border-red-100 pb-2 sm:pb-5 flex items-center justify-between gap-2">
          {/* Left Title */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black uppercase text-[#D40000] bg-red-100/70 px-2 sm:px-3 py-0.5 rounded-full mb-0.5 sm:mb-1">
              <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-[#FFC400]" />
              <span>Diwali 2026 Price List</span>
            </div>
            <h1 className="text-lg sm:text-4xl font-extrabold text-gray-950 leading-tight truncate">
              CRACKERS CATALOG
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-1">
              Select items, update quantities, and add to your cart. Pay at counter pickup.
            </p>
          </div>

          {/* Right Badges: Exactly matched size, words only without percentages */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="w-20 sm:w-36 h-10 sm:h-16 bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-1 sm:px-3 py-1 rounded-xl sm:rounded-2xl border-2 border-[#FFC400] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[8px] sm:text-[11px] font-black uppercase text-amber-200 tracking-wider leading-tight">
                Diwali Special
              </span>
              <span className="text-[9px] sm:text-sm font-black text-[#FFC400] uppercase tracking-wide leading-none mt-0.5 sm:mt-1">
                Best Offer
              </span>
            </div>

            <div className="w-20 sm:w-36 h-10 sm:h-16 bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-1 sm:px-3 py-1 rounded-xl sm:rounded-2xl border-2 border-[#FFC400] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[8px] sm:text-[11px] font-black uppercase text-amber-200 tracking-wider leading-tight">
                Unique Crackers
              </span>
              <span className="text-[9px] sm:text-sm font-black text-[#FFC400] uppercase tracking-wide leading-none mt-0.5 sm:mt-1">
                Sivakasi Direct
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
