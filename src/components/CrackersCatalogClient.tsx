'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Cracker, StoreSettings } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import {
  Search,
  Filter,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Percent,
  ArrowRight,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CrackersCatalogClientProps {
  initialCrackers: Cracker[];
  settings: StoreSettings;
}

const SYNC_INTERVAL_SECONDS = 120; // Auto-syncs every 2 minutes

export default function CrackersCatalogClient({
  initialCrackers,
  settings: initialSettings,
}: CrackersCatalogClientProps) {
  const [crackersList, setCrackersList] = useState<Cracker[]>(initialCrackers);
  const [currentSettings, setCurrentSettings] = useState<StoreSettings>(initialSettings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { items, addItem, updateQuantity, removeItem, getTotalAmount, getTotalItems } =
    useCartStore();

  const showPricing = currentSettings?.showPricing ?? true;
  const discountPercentage = currentSettings?.discountPercentage ?? 20;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    crackersList.forEach((c) => {
      if (c.category) set.add(c.category.trim());
    });
    return Array.from(set).sort();
  }, [crackersList]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectAll = () => {
    setSelectedCategories([]);
  };

  const filteredCrackers = useMemo(() => {
    return crackersList.filter((item) => {
      if (!item.isAvailable) return false;

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategories.length === 0 ||
        (item.category && selectedCategories.includes(item.category));

      return matchesSearch && matchesCategory;
    });
  }, [crackersList, searchTerm, selectedCategories]);

  // Group filtered crackers by Category
  const groupedByCategory = useMemo(() => {
    const groups: { [category: string]: Cracker[] } = {};
    filteredCrackers.forEach((cracker) => {
      const cat = cracker.category?.trim() || 'GENERAL CRACKERS';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(cracker);
    });
    return groups;
  }, [filteredCrackers]);

  // Calculations for sticky cart summary bar (guarded by mounted to prevent hydration mismatch)
  const totalUnits = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getTotalAmount() : 0;
  const discountAmount = Math.round((subtotal * (discountPercentage || 0)) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Helper to get cart quantity for an item
  const getItemCartQty = (id: string) => {
    if (!mounted) return 0;
    const found = items.find((it) => it.id === id);
    return found ? found.quantity : 0;
  };

  const handleQtyChange = (cracker: Cracker, delta: number) => {
    const currentQty = getItemCartQty(cracker.id);
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      if (currentQty > 0) {
        removeItem(cracker.id);
        toast.info(`Removed ${cracker.name} from list`);
      }
    } else {
      if (currentQty === 0) {
        addItem(
          {
            id: cracker.id,
            name: cracker.name,
            price: cracker.price,
            originalPrice: cracker.originalPrice,
            itemCode: cracker.itemCode,
            piecesContent: cracker.piecesContent,
            category: cracker.category,
            imageUrl: cracker.imageUrl,
          },
          1
        );
        toast.success(`Added ${cracker.name}`, { icon: '🎇' });
      } else {
        updateQuantity(cracker.id, newQty);
      }
    }
  };

  const handleDirectInput = (cracker: Cracker, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    if (isNaN(val) || val <= 0) {
      removeItem(cracker.id);
    } else {
      const currentQty = getItemCartQty(cracker.id);
      if (currentQty === 0) {
        addItem(
          {
            id: cracker.id,
            name: cracker.name,
            price: cracker.price,
            originalPrice: cracker.originalPrice,
            itemCode: cracker.itemCode,
            piecesContent: cracker.piecesContent,
            category: cracker.category,
            imageUrl: cracker.imageUrl,
          },
          val
        );
      } else {
        updateQuantity(cracker.id, val);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pt-0 sm:pt-1 pb-32">
      {/* Sticky Search & Category Filter Header with Brand Karadi Red/Gold Festive Theme */}
      <div className="sticky top-[68px] sm:top-[104px] z-40 bg-white/95 backdrop-blur-md p-2 sm:p-4 rounded-xl sm:rounded-2xl border sm:border-2 border-[#FFC400] shadow-sm sm:shadow-md transition-all">
        <div className="flex items-center gap-2 sm:gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crackers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Filter Checkbox Dropdown */}
          <div className="relative w-32 sm:w-60 shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              suppressHydrationWarning
              className="w-full flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 hover:bg-amber-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-1 sm:gap-1.5 truncate pr-1">
                <Filter className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#D40000] shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-gray-900 truncate">
                  {selectedCategories.length === 0
                    ? 'All'
                    : selectedCategories.length === 1
                    ? selectedCategories[0]
                    : `${selectedCategories.length} selected`}
                </span>
              </div>
              <ChevronDown
                className={`w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-800 shrink-0 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu with Checkboxes */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border-2 border-[#FFC400] rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Categories
                  </span>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-[11px] text-[#D40000] font-bold hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  <label
                    onClick={selectAll}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer text-xs font-semibold text-gray-800 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedCategories.length === 0
                          ? 'bg-[#D40000] border-[#D40000] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedCategories.length === 0 && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>All Categories</span>
                  </label>

                  {availableCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer text-xs font-semibold text-gray-800 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#D40000] border-[#D40000] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Items count badge (visible on tablet/desktop) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
              {filteredCrackers.length} Items Available
            </span>
          </div>
        </div>
      </div>

      {/* Category Wise Product Listing - Responsive Table/Cards Layout without CONTENT column */}
      {Object.keys(groupedByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([categoryName, categoryCrackers]) => (
            <div
              key={categoryName}
              className="bg-white rounded-2xl sm:rounded-3xl border-2 border-red-100 shadow-xs overflow-hidden"
            >
              {/* Category Header Row - Karadi Red & Gold Theme */}
              <div className="py-2.5 sm:py-3.5 px-3.5 sm:px-6 bg-[#D40000] text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFC400] shadow-sm shrink-0" />
                  <h2 className="text-xs sm:text-base font-black tracking-wider uppercase text-white truncate">
                    {categoryName}
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs font-black bg-[#FFC400] text-gray-950 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs shrink-0">
                  {categoryCrackers.length} {categoryCrackers.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Desktop / Tablet Table View (hidden on small screens < sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {showPricing ? (
                      <tr className="bg-gray-100/90 text-gray-700 text-[11px] font-black uppercase tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-4 sm:px-6">PRODUCT NAME</th>
                        <th className="py-2.5 px-4 text-center w-36">UNIT PRICE</th>
                        <th className="py-2.5 px-4 text-center w-40">QUANTITY</th>
                        <th className="py-2.5 px-4 sm:px-6 text-right w-32">TOTAL</th>
                      </tr>
                    ) : (
                      <tr className="bg-gray-100/90 text-gray-700 text-[11px] font-black uppercase tracking-wider border-b border-gray-200">
                        <th className="py-2.5 px-4 sm:px-6">PRODUCT NAME</th>
                        <th className="py-2.5 px-4 text-center w-44">QUANTITY</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {categoryCrackers.map((cracker) => {
                      const qty = getItemCartQty(cracker.id);
                      const lineTotal = cracker.price * qty;

                      return (
                        <tr
                          key={cracker.id}
                          className={`transition-colors hover:bg-amber-50/40 ${
                            qty > 0 ? 'bg-amber-50/25' : ''
                          }`}
                        >
                          {/* Product Name */}
                          <td className="py-3 px-4 sm:px-6 align-middle">
                            <h3 className="font-extrabold text-gray-900 uppercase tracking-tight text-xs sm:text-sm leading-snug">
                              {cracker.name}
                            </h3>
                          </td>

                          {/* Unit Price (Only if showPricing is ON) */}
                          {showPricing && (
                            <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                              <div className="flex flex-col items-center">
                                <span className="text-sm sm:text-base font-black text-[#D40000]">
                                  ₹{cracker.price}
                                </span>
                                {cracker.originalPrice && cracker.originalPrice > cracker.price && (
                                  <span className="text-[11px] font-semibold text-gray-400 line-through">
                                    ₹{cracker.originalPrice}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Quantity Stepper */}
                          <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                            <div className="inline-flex items-center bg-gray-50 border border-gray-300 rounded-xl p-0.5 sm:p-1 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(cracker, -1)}
                                disabled={qty <= 0}
                                suppressHydrationWarning
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={qty === 0 ? '' : qty}
                                placeholder="0"
                                onChange={(e) => handleDirectInput(cracker, e.target.value)}
                                suppressHydrationWarning
                                className="w-10 sm:w-12 text-center font-black text-xs sm:text-sm text-gray-900 bg-transparent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleQtyChange(cracker, 1)}
                                suppressHydrationWarning
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FFC400] text-black hover:bg-[#FFE082] flex items-center justify-center font-black text-xs transition-colors shadow-xs cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Line Total (Only if showPricing is ON) */}
                          {showPricing && (
                            <td className="py-3 px-4 sm:px-6 text-right align-middle whitespace-nowrap">
                              <span
                                className={`text-xs sm:text-sm font-black ${
                                  qty > 0 ? 'text-[#D40000]' : 'text-gray-400'
                                }`}
                              >
                                ₹{lineTotal}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Single-Line Row View (Optimized for 320px - 640px screens) */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {categoryCrackers.map((cracker) => {
                  const qty = getItemCartQty(cracker.id);

                  return (
                    <div
                      key={cracker.id}
                      className={`px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                        qty > 0 ? 'bg-amber-50/40' : 'bg-white'
                      }`}
                    >
                      {/* Left: Product Name */}
                      <div className="min-w-0 flex-1 pr-1">
                        <h3 className="font-extrabold text-gray-900 uppercase tracking-tight text-[11px] leading-tight truncate" title={cracker.name}>
                          {cracker.name}
                        </h3>
                      </div>

                      {/* Right: Price + Stepper in Single Line (No inline line total) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Unit Price */}
                        {showPricing && (
                          <div className="text-right leading-none shrink-0">
                            <span className="text-xs sm:text-sm font-black text-[#D40000] block">
                              ₹{cracker.price}
                            </span>
                            {cracker.originalPrice && cracker.originalPrice > cracker.price && (
                              <span className="text-[9px] text-gray-400 line-through block mt-0.5">
                                ₹{cracker.originalPrice}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quantity Stepper */}
                        <div className="inline-flex items-center bg-gray-50 border border-gray-300 rounded-lg p-0.5 shadow-2xs shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cracker, -1)}
                            disabled={qty <= 0}
                            suppressHydrationWarning
                            className="w-6 h-6 rounded-md bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-xs transition-colors disabled:opacity-25 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty === 0 ? '' : qty}
                            placeholder="0"
                            onChange={(e) => handleDirectInput(cracker, e.target.value)}
                            suppressHydrationWarning
                            className="w-7 text-center font-black text-xs text-gray-900 bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cracker, 1)}
                            suppressHydrationWarning
                            className="w-6 h-6 rounded-md bg-[#FFC400] text-black hover:bg-[#FFE082] flex items-center justify-center font-black text-xs transition-colors shadow-xs cursor-pointer active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 my-8">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#D40000] flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Crackers Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5">
            We could not find any crackers matching your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
            }}
            className="bg-[#FFC400] hover:bg-[#FFE082] text-black font-extrabold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR (Clean navigation to Cart/Checkout without calculations) */}
      {totalUnits > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t-4 border-[#FFC400] shadow-[0_-8px_30px_rgba(0,0,0,0.2)] px-3 py-2.5 sm:px-4 sm:py-3.5 animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Units Selected Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-red-50 text-[#D40000] border border-red-200 sm:border-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shrink-0">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D40000]" />
              <span>
                {totalUnits} {totalUnits === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* View Cart / Checkout Button */}
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#D40000] hover:bg-[#B00000] text-white font-black px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-md border-2 border-[#FFC400] transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer truncate"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC400] shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
