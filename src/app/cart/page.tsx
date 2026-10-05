'use client';

import { useCartStore } from '@/lib/cartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { StoreSettings } from '@/types';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount, getTotalItems } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => {
        setSettingsLoaded(true);
      });
  }, []);

  if (!mounted || !settingsLoaded || !settings) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#D40000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading your festive cart...</p>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const totalItemsCount = getTotalItems();
  const showPricing = settings.showPricing;
  const discountPercentage = settings.discountPercentage || 0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const netPayable = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border-2 border-dashed border-[#FFC400] shadow-sm">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-[#D40000] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Cart is Empty!</h1>
          <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm sm:text-base">
            You haven't picked any crackers for your Diwali celebration yet. Browse our Sivakasi collection and add your favorite items!
          </p>
          <Link
            href="/crackers"
            className="inline-flex items-center gap-2 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg border-2 border-[#FFC400] transition-transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-[#FFC400]" />
            <span>Browse Crackers Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8 flex items-center justify-between border-b-2 border-red-100 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950">MY SHOPPING CART</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review your items before generating your shop pickup invoice.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
          >
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border-2 border-amber-200 hover:border-[#D40000] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs transition-colors"
              >
                {/* Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D40000] border border-amber-200 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-[#D40000]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.piecesContent && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {item.piecesContent}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-[10px] font-semibold text-gray-500 uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {showPricing && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-[#D40000]">
                          ₹{item.price} each
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper, Line Total, Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:text-red-600 flex items-center justify-center font-bold shadow-xs transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center font-extrabold text-sm text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-[#FFC400] text-black font-black flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total (Only if showPricing is ON) */}
                  {showPricing && (
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs text-gray-400 block">Total</span>
                      <span className="font-black text-gray-900 text-base">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/crackers"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D40000] hover:underline"
              >
                <span>+ Add more crackers to cart</span>
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border-2 border-[#D40000] p-6 shadow-md space-y-6 sticky top-28">
              <h2 className="text-xl font-extrabold text-gray-900 border-b pb-3">
                ORDER ESTIMATE
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-bold text-gray-900">{totalItemsCount} units</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Total Amount</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl font-bold">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Diwali Discount ({discountPercentage}%)</span>
                    </span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Packaging & Box</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Mode</span>
                  <span className="font-bold text-gray-800">Counter Cash / UPI</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-base font-extrabold text-gray-900">Net Final Total</span>
                  <span className="text-3xl font-black text-[#D40000]">₹{netPayable}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#D40000] hover:bg-[#B00000] text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 text-base border-2 border-[#FFC400]"
                >
                  <span>Checkout & Generate Invoice</span>
                  <ArrowRight className="w-5 h-5 text-[#FFC400]" />
                </Link>

                <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                  No online payment is collected now. Pay when you collect at our shop.
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#D40000]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>How Payment Works</span>
                </div>
                <p>
                  Clicking Checkout generates your official PDF order invoice with discount applied. Bring it to our counter to pay and take your crackers!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
