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
          <div className="flex items-center gap-3">
            {settings?.discountPercentage && settings.discountPercentage > 0 ? (
              <div className="relative overflow-hidden bg-gradient-to-br from-[#D40000] via-[#B00000] to-[#8A0000] text-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#FFC400] text-center shadow-lg festive-pulse group">
                {/* Real Cracker Sparkler Image Background/Accent */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#FFC400] shadow-sm shrink-0 bg-black/40">
                    <Image
                      src="/cracker-spark.jpg"
                      alt="Real Diwali Cracker Sparkler"
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider block text-amber-200">
                      Diwali Special
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#FFC400] tracking-tight drop-shadow-sm block leading-none">
                      {settings.discountPercentage}% OFF
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="bg-[#D40000] text-white p-3.5 rounded-2xl border-2 border-[#FFC400] text-center shadow-sm">
              <span className="text-xs font-semibold block text-amber-200">Factory Fresh Stock</span>
              <span className="text-lg font-black text-[#FFC400]">100% Sivakasi Tested</span>
            </div>
          </div>
        </div>

        {/* Client Product Listing */}
        <CrackersCatalogClient initialCrackers={crackers} settings={settings} />
      </div>
    </div>
  );
}
