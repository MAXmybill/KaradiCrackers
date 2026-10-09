'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart, Sparkles, ShieldCheck, PhoneCall } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-50 bg-[#D40000] text-white shadow-md border-b-4 border-[#FFC400]">
      {/* Top micro banner */}
      <div className="bg-[#B00000] text-center text-xs py-1 px-4 font-medium text-amber-200 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#FFC400] animate-pulse" />
        <span>Diwali 2026 Bookings Open! Sivakasi Direct Factory Prices</span>
        <span className="hidden sm:inline">• Visit Store & Collect at Counter</span>
        <Sparkles className="w-3.5 h-3.5 text-[#FFC400] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0 relative z-20" aria-label="Karadi Crackers Home">
          <Image
            src="/icon.png"
            alt="Karadi Crackers"
            width={550}
            height={226}
            priority
            className="h-[84px] sm:h-[130px] md:h-[150px] lg:h-[165px] w-auto max-w-[210px] sm:max-w-none object-contain -my-4 sm:-my-8 md:-my-10 lg:-my-12 group-hover:scale-105 transition-transform drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
          />
        </Link>

        {/* Navigation links & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-6 shrink-0">
          <Link
            href="/crackers"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-white hover:text-[#FFC400] transition-colors py-1 px-2 sm:px-3 rounded-lg hover:bg-black/10"
          >
            <span>Catalog</span>
          </Link>

          {/* Cart Icon Button */}
          <Link
            href="/cart"
            id="cart-nav-button"
            className="relative flex items-center gap-1.5 sm:gap-2 bg-[#FFC400] hover:bg-[#FFE082] text-black font-bold px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg transition-all transform active:scale-95 border border-white sm:border-2"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#D40000]" />
            <span className="text-xs sm:text-sm hidden sm:inline text-[#D40000] font-black">Cart</span>
            {totalItems > 0 && (
              <span
                id="cart-count-badge"
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[#D40000] text-white text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce"
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
