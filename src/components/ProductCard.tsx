'use client';

import { useState } from 'react';
import { Cracker } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import { Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  cracker: Cracker;
}

export default function ProductCard({ cracker }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const { addItem, items } = useCartStore();

  const cartItem = items.find((i) => i.id === cracker.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;

  // As requested: Cracker is in stock and unlimited while isAvailable is ON
  const isOutOfStock = !cracker.isAvailable;

  const handleIncrement = () => {
    setQty((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        id: cracker.id,
        name: cracker.name,
        price: cracker.price,
        category: cracker.category,
      },
      qty
    );

    toast.success(`Added ${qty} × ${cracker.name} to cart!`, {
      icon: '🎆',
    });
    setQty(1);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${isOutOfStock
          ? 'border-gray-200 opacity-75'
          : 'border-[#FFC400] hover:border-[#D40000] hover:-translate-y-1'
        }`}
    >
      {/* Dashed stitch border styling */}
      <div className="absolute inset-1 rounded-xl border border-dashed border-[#FFC400]/60 pointer-events-none z-10" />

      {/* Top Festive Header Badge */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Category Tag */}
          {cracker.category ? (
            <span className="bg-amber-50 text-xs font-bold text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              {cracker.category}
            </span>
          ) : (
            <span className="bg-amber-50 text-xs font-bold text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              Diwali Cracker
            </span>
          )}

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Available
          </span>
        </div>

        {/* Product Name */}
        <div className="min-h-[3.2rem]">
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 group-hover:text-[#D40000] transition-colors line-clamp-2 leading-snug">
            {cracker.name}
          </h3>
        </div>

        {/* Price & In-Cart tag */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Rate:</span>
            <span className="text-2xl font-black text-[#D40000]">
              ₹{cracker.price}
            </span>
            {cracker.originalPrice && cracker.originalPrice > cracker.price && (
              <span className="text-xs text-gray-400 font-semibold line-through">
                ₹{cracker.originalPrice}
              </span>
            )}
          </div>

          {currentInCart > 0 && (
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {currentInCart} in cart
            </span>
          )}
        </div>
      </div>

      {/* Action Footer: Stepper and Add To Cart */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed border border-gray-200 text-xs"
          >
            Currently Unavailable
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between w-full sm:w-auto bg-amber-50 rounded-xl border border-amber-200 p-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={qty <= 1}
                className="w-7 h-7 rounded-lg bg-white text-[#D40000] flex items-center justify-center font-bold hover:bg-[#FFC400] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-8 text-center font-extrabold text-sm text-gray-900">
                {qty}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg bg-white text-[#D40000] flex items-center justify-center font-bold hover:bg-[#FFC400] hover:text-black transition-colors shadow-xs"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex-1 py-2 px-3 bg-[#D40000] hover:bg-[#FFC400] text-white hover:text-black font-extrabold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm group/btn active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-white group-hover/btn:text-black transition-colors" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
