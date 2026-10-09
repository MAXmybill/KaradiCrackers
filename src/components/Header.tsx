'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart, Sparkles, Flame, ShieldCheck, PhoneCall } from 'lucide-react';
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
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0 min-w-0">
          <div className="relative w-9 h-9 sm:w-16 sm:h-16 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo.png"
              alt="Karadi Crackers Logo"
              fill
              sizes="(max-width: 640px) 36px, 64px"
              className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base sm:text-2xl md:text-3xl tracking-tight text-[#FFC400] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] truncate">
                KARADI CRACKERS
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-white/90 font-medium tracking-wide flex items-center gap-1">
              <span>Light up your Diwali!</span>
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFC400] inline" />
            </p>
          </div>
        </Link>

        {/* Navigation links & Cart */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <Link
            href="/crackers"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-white hover:text-[#FFC400] transition-colors py-1 px-2 sm:px-2.5 rounded-lg hover:bg-black/10"
          >
            <span>Catalog</span>
          </Link>

          <Link
            href="/online"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-amber-200 hover:text-white transition-colors py-1 px-2 sm:px-2.5 rounded-lg hover:bg-black/10 border border-amber-300/40"
          >
            <span>Online</span>
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
