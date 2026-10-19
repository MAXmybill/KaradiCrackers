'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Percent,
  Tag,
  PackageOpen,
  ArrowLeft,
} from 'lucide-react';
import { StoreSettings, CartItem } from '@/types';
import { toast } from 'sonner';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#D40000] border-t-[#FFC400] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-800 font-extrabold text-sm">Loading cart...</p>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const totalItemsCount = getTotalItems();
  const showPricing = settings.showPricing;
  const discountPercentage = settings.discountPercentage || 0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const netPayable = Math.max(0, subtotal - discountAmount);

  const handleClearCart = () => {
    if (window.confirm('Clear all items from your cart?')) {
      clearCart();
      toast.info('Cart cleared');
    }
  };

  const handleQtyChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeItem(item.id);
      toast.info(`Removed ${item.name}`);
    } else {
      updateQuantity(item.id, newQty);
    }
  };

  const handleDirectInput = (item: CartItem, valStr: string) => {
    if (valStr === '') {
      updateQuantity(item.id, 0);
      return;
    }
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val >= 0) {
      if (val === 0) {
        removeItem(item.id);
        toast.info(`Removed ${item.name}`);
      } else {
        updateQuantity(item.id, val);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-amber-50/40 to-white px-4 py-10">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFC400] shadow-lg text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D40000] to-[#990000] text-[#FFC400] flex items-center justify-center mx-auto mb-4 shadow-md border border-[#FFC400]">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-gray-950 mb-1.5 tracking-tight">
            Your Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
            No items in your cart yet. Choose your favorite Diwali crackers from our wholesale catalog!
          </p>

          <Link
            href="/crackers"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#D40000] hover:bg-[#B00000] text-white font-black text-sm px-5 py-3 rounded-xl shadow-md border-2 border-[#FFC400] transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#FFC400]" />
            <span>Browse Crackers Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#FFC400]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-12 pt-1 sm:pt-4">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">

        {/* Slim, Compact Header */}
        <div className="mb-3 sm:mb-4 pb-2.5 border-b border-red-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/crackers"
              className="text-gray-500 hover:text-[#D40000] p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Catalog"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black text-gray-950 tracking-tight leading-none uppercase">
                  SHOPPING CART
                </h1>
                <span className="text-[10px] sm:text-xs font-black bg-[#FFC400] text-gray-950 px-2 py-0.5 rounded-full shadow-2xs">
                  {totalItemsCount} units
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:block">
                Review your list before generating your official shop pickup PDF invoice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {discountPercentage > 0 && (
              <span className="text-[10px] sm:text-xs font-black bg-[#D40000] text-[#FFC400] px-2.5 py-1 rounded-lg border border-[#FFC400] flex items-center gap-1 shadow-2xs">
                <Percent className="w-3 h-3 text-[#FFC400]" />
                <span>{discountPercentage}% OFF APPLIED</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Direct List (No Category Split) + Right Sticky In-View Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative">

          {/* LEFT: Continuous Clean Product List without Category Banners */}
          <div className="lg:col-span-8 min-w-0">
            <div className="bg-white rounded-xl sm:rounded-2xl border sm:border-2 border-red-100 shadow-xs overflow-hidden">

              {/* Desktop / Tablet Table: Clean continuous table with NO category split */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {showPricing ? (
                      <tr className="bg-gray-100/90 text-gray-700 text-[11px] font-black uppercase tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-4 sm:px-6">PRODUCT NAME</th>
                        <th className="py-2.5 px-3 text-center w-28">UNIT PRICE</th>
                        <th className="py-2.5 px-3 text-center w-36">QUANTITY</th>
                        <th className="py-2.5 px-4 text-right w-28">TOTAL</th>
                        <th className="py-2.5 px-3 text-center w-12"></th>
                      </tr>
                    ) : (
                      <tr className="bg-gray-100/90 text-gray-700 text-[11px] font-black uppercase tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-4 sm:px-6">PRODUCT NAME</th>
                        <th className="py-2.5 px-4 text-center w-40">QUANTITY</th>
                        <th className="py-2.5 px-3 text-center w-12"></th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {items.map((item) => {
                      const lineTotal = item.price * item.quantity;
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-amber-50/40 bg-white"
                        >
                          {/* Product Name + Item Code + Category & Pieces Specs */}
                          <td className="py-2.5 sm:py-3 px-4 sm:px-6 align-middle">
                            <div>
                              <h2 className="font-bold text-gray-900 text-xs sm:text-sm leading-normal">
                                {item.name}
                              </h2>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {item.itemCode && (
                                  <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wide">
                                    {item.itemCode}
                                  </span>
                                )}
                                {item.category && (
                                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    {item.category}
                                  </span>
                                )}
                                {item.piecesContent && (
                                  <span className="font-mono text-[10px] font-semibold text-gray-400 tracking-wide">
                                    • {item.piecesContent}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Unit Price */}
                          {showPricing && (
                            <td className="py-2.5 sm:py-3 px-3 text-center align-middle whitespace-nowrap">
                              <div className="flex flex-col items-center">
                                <span className="text-xs sm:text-sm font-black text-[#D40000] font-rupee">
                                  ₹{item.price}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-[10px] font-semibold text-gray-400 line-through font-rupee">
                                    ₹{item.originalPrice}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Quantity Stepper */}
                          <td className="py-2.5 sm:py-3 px-3 text-center align-middle whitespace-nowrap">
                            <div className="inline-flex items-center bg-gray-50 border border-gray-300 rounded-xl p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item, -1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleDirectInput(item, e.target.value)}
                                className="w-9 sm:w-11 text-center font-black text-xs sm:text-sm text-gray-900 bg-transparent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item, 1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FFC400] text-black hover:bg-[#FFE082] flex items-center justify-center font-black text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Line Total */}
                          {showPricing && (
                            <td className="py-2.5 sm:py-3 px-4 text-right align-middle whitespace-nowrap">
                              <span className="text-xs sm:text-sm font-black font-rupee text-[#D40000]">
                                ₹{lineTotal}
                              </span>
                            </td>
                          )}

                          {/* Remove Action */}
                          <td className="py-2.5 sm:py-3 px-3 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Single-Line Row View: Continuous list without category splits */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="px-2.5 py-2 flex items-center justify-between gap-1.5 hover:bg-amber-50/30 transition-colors"
                    >
                      {/* Left: Product Name with Item Code & Content Below */}
                      <div className="min-w-0 flex-1 pr-1">
                        <h2 className="font-bold text-gray-900 text-xs leading-tight break-words">
                          {item.name}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {item.itemCode && (
                            <span className="font-mono text-[9px] font-semibold text-gray-400 tracking-wide leading-none">
                              {item.itemCode}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.2 rounded leading-none border border-amber-200">
                              {item.category}
                            </span>
                          )}
                          {item.piecesContent && (
                            <span className="font-mono text-[9px] font-semibold text-gray-400 tracking-wide leading-none">
                              • {item.piecesContent}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Unit Price + Compact Stepper + Line Total + Trash in One Single Line */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Unit Price */}
                        {showPricing && (
                          <div className="text-right leading-none shrink-0 w-9">
                            <span className="text-[11px] font-black text-[#D40000] block font-rupee">
                              ₹{item.price}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-[8px] text-gray-400 line-through block font-rupee">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Compact Stepper matching catalog */}
                        <div className="inline-flex items-center bg-gray-50 border border-gray-300 rounded-lg p-0.5 shadow-2xs shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, -1)}
                            className="w-5 h-5 rounded-md bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleDirectInput(item, e.target.value)}
                            className="w-7 text-center font-black text-xs text-gray-900 bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, 1)}
                            className="w-5 h-5 rounded-md bg-[#FFC400] text-black hover:bg-[#FFE082] flex items-center justify-center font-black text-xs transition-colors shadow-2xs cursor-pointer active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        {showPricing && (
                          <div className="text-right leading-none shrink-0 w-11">
                            <span className="text-[11px] font-black block font-rupee text-[#D40000]">
                              ₹{lineTotal}
                            </span>
                          </div>
                        )}

                        {/* Tiny remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 text-gray-300 hover:text-red-600 flex items-center justify-center cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Back to Catalog Link */}
            <div className="mt-2.5 px-1 flex items-center justify-between">
              <Link
                href="/crackers"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#D40000] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more crackers</span>
              </Link>
              <span className="text-[11px] text-gray-400 font-medium">
                {items.length} items in cart
              </span>
            </div>
          </div>

          {/* RIGHT: Truly Sticky Summary Column (Col 4) - Stays 100% in view without scrolling */}
          <div className="lg:col-span-4 relative self-stretch">
            <div className="sticky top-[75px] sm:top-[90px] z-30 max-h-[calc(100vh-100px)] flex flex-col justify-between overflow-y-auto">
              <div className="bg-white rounded-2xl border-2 border-[#D40000] shadow-lg p-3.5 sm:p-4 relative">
                {/* Dashed stitch accent */}
                <div className="absolute inset-1 rounded-xl border border-dashed border-[#FFC400]/50 pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  {/* Card Title & Discount Pill */}
                  <div className="flex items-center justify-between pb-2 border-b border-red-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D40000]" />
                      <h2 className="text-sm sm:text-base font-black text-gray-950 tracking-tight">
                        ORDER ESTIMATE
                      </h2>
                    </div>

                    {discountPercentage > 0 && (
                      <span className="text-[10px] font-black uppercase bg-[#D40000] text-[#FFC400] px-2 py-0.5 rounded-full shadow-2xs">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Summary Rows */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <PackageOpen className="w-3.5 h-3.5 text-gray-400" />
                        <span>Total Items</span>
                      </span>
                      <span className="font-extrabold text-gray-900">
                        {totalItemsCount} units ({items.length} types)
                      </span>
                    </div>

                    {showPricing && (
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal</span>
                        <span className="font-extrabold text-gray-900 font-rupee">
                          ₹{subtotal}
                        </span>
                      </div>
                    )}

                    {/* Festive Discount Row */}
                    {discountPercentage > 0 && showPricing && (
                      <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Diwali Discount ({discountPercentage}%)</span>
                        </span>
                        <span className="font-black text-emerald-700 font-rupee">
                          -₹{discountAmount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Packaging & Quality Box</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>

                    {/* FREE Gift on ₹3000 Offer Box */}
                    {netPayable >= 3000 ? (
                      <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2 shadow-2xs">
                        <span className="text-base shrink-0">🎁</span>
                        <div className="leading-tight">
                          <p className="text-[11px] font-black text-amber-900">
                            FREE Unique Cracker Gift Unlocked!
                          </p>
                          <p className="text-[10px] text-amber-800">
                            Collect your special gift packet at counter pickup.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-50/90 border border-dashed border-amber-300 rounded-xl text-amber-900 flex items-center gap-2">
                        <span className="text-base shrink-0">✨</span>
                        <p className="text-[10.5px] font-bold leading-tight">
                          Add <span className="font-black text-[#D40000]">₹{3000 - netPayable}</span> more to get <span className="font-black underline">FREE Unique Cracker Gifts!</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Highlight Net Final Total Box */}
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-dashed border-[#D40000]/60">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-black uppercase text-gray-700 tracking-wider">
                        Net Final Total
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#D40000] font-rupee tracking-tight leading-none">
                        ₹{netPayable}
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA Checkout Button */}
                  <div className="space-y-1.5 pt-0.5">
                    <Link
                      href="/checkout"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D40000] hover:bg-[#B00000] text-white font-black py-2.5 sm:py-3 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm border-2 border-[#FFC400]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFC400]" />
                      <span>Checkout & Generate Invoice</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
                    </Link>

                    <p className="text-center text-[10px] text-gray-500 font-medium">
                      🔒 Zero online payment now • Pay at shop counter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MOBILE STICKY BOTTOM DOCK */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#D40000] text-white px-3 py-2 border-t-2 border-[#FFC400] shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wide">
                Total ({totalItemsCount} units)
              </span>
              {discountPercentage > 0 && (
                <span className="text-[8px] font-black bg-[#FFC400] text-black px-1 rounded">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
            <div className="text-lg font-black text-[#FFC400] font-rupee leading-none">
              ₹{netPayable}
            </div>
          </div>

          <Link
            href="/checkout"
            className="inline-flex items-center gap-1 bg-[#FFC400] hover:bg-[#FFE082] text-black font-black text-xs px-3.5 py-2 rounded-lg shadow-md border border-white active:scale-95 transition-transform"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D40000]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
