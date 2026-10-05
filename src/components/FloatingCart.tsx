'use client';

import { useCartStore } from '@/lib/cartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCart() {
  const { getTotalItems, getTotalAmount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do not show on crackers catalog (has its own sticky billing bar), cart, checkout, order confirmation, or admin pages
  if (
    pathname?.startsWith('/crackers') ||
    pathname?.startsWith('/cart') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/order') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  if (totalItems === 0) return null;

  return (
    <aside
      aria-label="Floating cart summary"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <Link
        href="/cart"
        id="floating-cart-bar"
        className="flex items-center justify-between gap-3 bg-[#D40000] text-white px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.35)] border-2 border-[#FFC400] hover:bg-[#B00000] hover:scale-[1.02] active:scale-[0.98] transition-all group max-w-md mx-auto sm:min-w-[340px]"
      >
        {/* Left Side: Cart Icon & Item Count */}
        <div className="flex items-center gap-3">
          <div className="relative bg-[#FFC400] text-[#D40000] p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover:rotate-6 transition-transform">
            <ShoppingBag className="w-5 h-5 fill-[#D40000]" />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-[#FFC400] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FFC400]">
              {totalItems}
            </span>
          </div>

          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-amber-200 font-extrabold leading-none">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} Added
            </p>
            <p className="text-lg font-black text-white leading-tight mt-0.5">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Right Side: View Cart Action */}
        <div className="flex items-center gap-1.5 bg-[#FFC400] text-[#D40000] font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl group-hover:bg-[#FFE082] transition-colors shrink-0">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </aside>
  );
}
