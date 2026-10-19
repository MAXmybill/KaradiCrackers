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
        {/* Page Header - Fully Responsive, No Truncation, Perfectly Fitted Badges */}
        <div className="mb-3 sm:mb-6 text-left border-b border-red-100 pb-3 sm:pb-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          {/* Left Title */}
          <div className="shrink-0 max-w-full">
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black uppercase text-[#D40000] bg-red-100/70 px-2 sm:px-3 py-0.5 rounded-full mb-1">
              <Globe className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-[#FFC400]" />
              <span>Online Direct Price List 2026</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-950 leading-tight">
              ONLINE CRACKERS CATALOG
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-1">
              Full transparent pricing guaranteed online. Select quantities and reserve for counter pickup.
            </p>
          </div>

          {/* Right Badges: Exactly matched size, comfortable height and zero clipping */}
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            <div className="w-24 sm:w-28 min-h-[36px] sm:min-h-[46px] bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-2 py-1.5 rounded-xl border border-[#FFC400] shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-200 tracking-wider leading-none">
                DIWALI
              </span>
              <span className="text-[10px] sm:text-xs font-black text-[#FFC400] uppercase tracking-wide leading-none mt-1">
                BEST OFFER
              </span>
            </div>

            <div className="w-24 sm:w-28 min-h-[36px] sm:min-h-[46px] bg-gradient-to-br from-[#D40000] to-[#9E0000] text-white px-2 py-1.5 rounded-xl border border-[#FFC400] shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-200 tracking-wider leading-none">
                UNIQUE
              </span>
              <span className="text-[10px] sm:text-xs font-black text-[#FFC400] uppercase tracking-wide leading-none mt-1">
                CRACKERS
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
