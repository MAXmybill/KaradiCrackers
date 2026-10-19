import { getCrackers, getStoreSettings } from '@/lib/db';
import CrackersCatalogClient from '@/components/CrackersCatalogClient';
import { Sparkles, Globe } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Online Crackers Catalog & Pricing | Karadi Crackers',
  description:
    'Browse our complete Sivakasi Diwali crackers list with full online prices, instant discounts, and direct counter pickup booking.',
};

export default async function OnlineCrackersPage() {
  // Fetch all crackers (or active ones) and store settings
  const [crackers, settings] = await Promise.all([
    getCrackers(false), // All products included
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
              <Globe className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-[#FFC400]" />
              <span>Online Direct Price List 2026</span>
            </div>
            <h1 className="text-lg sm:text-4xl font-extrabold text-gray-950 leading-tight truncate">
              ONLINE CRACKERS CATALOG
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-1">
              Full transparent pricing guaranteed online. Select quantities and reserve for counter pickup.
            </p>
          </div>

          {/* Right Badges: Exactly matched size, height, and typography */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {settings?.discountPercentage && settings.discountPercentage > 0 ? (
              <div className="w-20 sm:w-36 h-10 sm:h-16 bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-1 sm:px-3 py-1 rounded-xl sm:rounded-2xl border-2 border-[#FFC400] shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[8px] sm:text-[11px] font-black uppercase text-amber-200 tracking-wider leading-tight">
                  Diwali Special
                </span>
                <span className="text-xs sm:text-lg font-black text-[#FFC400] font-rupee leading-none mt-0.5">
                  {settings.discountPercentage}% OFF
                </span>
              </div>
            ) : null}

            <div className="w-20 sm:w-36 h-10 sm:h-16 bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-1 sm:px-3 py-1 rounded-xl sm:rounded-2xl border-2 border-[#FFC400] shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[8px] sm:text-[11px] font-black uppercase text-amber-200 tracking-wider leading-tight">
                Unique Crackers
              </span>
              <span className="text-[9px] sm:text-sm font-black text-[#FFC400] uppercase tracking-wide leading-none mt-0.5">
                100% Sivakasi
              </span>
            </div>
          </div>
        </div>

        {/* Client Product Listing with forceShowPricing=true so prices ALWAYS display */}
        <CrackersCatalogClient
          initialCrackers={crackers}
          settings={settings}
          forceShowPricing={true}
        />
      </div>
    </div>
  );
}
