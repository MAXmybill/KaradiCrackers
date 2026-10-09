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

          {/* Right Badges: Sleek compact inline pills on mobile, rich cards on desktop */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {settings?.discountPercentage && settings.discountPercentage > 0 ? (
              <div className="bg-gradient-to-r from-[#D40000] to-[#B00000] text-white px-2 sm:px-3.5 py-1 sm:py-2.5 rounded-lg sm:rounded-2xl border border-[#FFC400] text-center shadow-xs flex items-center gap-1.5">
                <div className="relative w-4 h-4 sm:w-8 sm:h-8 rounded overflow-hidden border border-[#FFC400]/50 shrink-0 hidden xs:block">
                  <Image
                    src="/cracker-spark.jpg"
                    alt="Sparkler"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="text-right sm:text-left leading-none">
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase text-amber-200 block sm:hidden">
                    SPECIAL
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-200 hidden sm:block">
                    Diwali Special
                  </span>
                  <span className="text-xs sm:text-xl font-black text-[#FFC400] block mt-0.5 font-rupee">
                    {settings.discountPercentage}% OFF
                  </span>
                </div>
              </div>
            ) : null}

            <div className="bg-[#D40000] text-white px-2 sm:px-3.5 py-1 sm:py-2.5 rounded-lg sm:rounded-2xl border border-[#FFC400] text-center shadow-xs leading-none">
              <span className="text-[8px] sm:text-xs font-semibold block text-amber-200">
                100% Sivakasi
              </span>
              <span className="text-[9px] sm:text-sm font-black text-[#FFC400] block mt-0.5">
                Fresh
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
