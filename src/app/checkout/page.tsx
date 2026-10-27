'use client';

import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Loader2,
  Percent,
  CheckCircle2,
  Lock,
  Store,
  Phone,
  User,
  PackageCheck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { StoreSettings } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, getTotalItems, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <p className="text-gray-800 font-extrabold text-sm">Preparing checkout...</p>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const totalItemsCount = getTotalItems();
  const discountPercentage = settings?.discountPercentage || 0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const netPayable = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-amber-50/40 to-white px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFC400] shadow-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D40000] flex items-center justify-center mx-auto mb-3 border border-amber-200">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-950 mb-1">Your cart is empty</h2>
          <p className="text-xs text-gray-600 mb-5">Please pick items from our catalog before checking out.</p>
          <Link
            href="/crackers"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#D40000] hover:bg-[#B00000] text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md border-2 border-[#FFC400] transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#FFC400]" />
            <span>Browse Crackers</span>
          </Link>
        </div>
      </div>
    );
  }

  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    if (!/^[6-9]/.test(cleaned)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setNameError('');
    setPhoneError('');

    let hasError = false;

    if (!customerName.trim() || customerName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      hasError = true;
    }

    const cleanedPhone = customerPhone.replace(/\D/g, '');
    const phoneValidationMsg = validatePhone(cleanedPhone);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanedPhone,
          referredBy: referredBy.trim(),
          items: items.map((i) => ({
            crackerId: i.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.error || 'Failed to place order. Please review your cart.');
        toast.error(data.error || 'Failed to place order');
        setIsSubmitting(false);
        return;
      }

      toast.success('Invoice generated successfully!');
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch (err: any) {
      setServerError(err.message || 'Network error. Please try again.');
      toast.error('Network error. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-amber-50/15 to-white py-2 sm:py-6 pb-20">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">

        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#D40000] mb-2 sm:mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart ({totalItemsCount} units)</span>
        </Link>

        {/* Main Checkout Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#D40000] p-3.5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle dashed inner border */}
          <div className="absolute inset-1 rounded-xl sm:rounded-2xl border border-dashed border-[#FFC400]/50 pointer-events-none" />

          {/* Compact Header Bar */}
          <div className="relative z-10 border-b border-red-100 pb-2.5 sm:pb-3 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#D40000] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <Sparkles className="w-3 h-3 text-[#FFC400]" />
                <span>Express Counter Pickup Booking</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-gray-950 mt-1 leading-none tracking-tight">
                CUSTOMER CHECKOUT
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {discountPercentage > 0 && (
                <span className="text-[10px] sm:text-xs font-black bg-[#D40000] text-[#FFC400] px-2.5 py-0.5 rounded-full border border-[#FFC400]">
                  {discountPercentage}% Festive Discount
                </span>
              )}
            </div>
          </div>

          {serverError && (
            <div className="relative z-10 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Order Error</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          {/* 2-Column Responsive Layout - Compact & Fits in Viewport */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 items-start">

            {/* Left: Input Form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 space-y-2.5 sm:space-y-3">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Customer Name</span>
                    <span className="text-red-600">*</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">For invoice name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D40000] transition-all ${
                    nameError ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-gray-50/50 focus:bg-white'
                  }`}
                  required
                />
                {nameError && <p className="text-[10px] text-red-600 mt-1 font-semibold">{nameError}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>Mobile Number (10 Digits)</span>
                    <span className="text-red-600">*</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Pickup lookup</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value.replace(/\D/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-3 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D40000] transition-all tracking-wider ${
                      phoneError ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-gray-50/50 focus:bg-white'
                    }`}
                    required
                  />
                </div>
                {phoneError && <p className="text-[10px] text-red-600 mt-1 font-semibold">{phoneError}</p>}
              </div>

              {/* Referred By Field */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Referred By</span>
                    <span className="text-gray-400 font-normal text-[10px]">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Friend / agent name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vignesh / Store Staff"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 focus:bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D40000] transition-all"
                />
              </div>

              {/* Compact Collection Notice */}
              <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
                <Store className="w-4 h-4 text-[#D40000] shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <strong className="text-gray-900">Zero Online Payment:</strong> Pay by Cash or UPI directly at our shop counter when collecting your crackers.
                </p>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3.5 px-4 bg-[#D40000] hover:bg-[#B00000] text-white font-black rounded-xl shadow-lg transition-all duration-200 border-2 border-[#FFC400] flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Official Invoice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFC400]" />
                    <span>Generate Invoice & Lock Booking (₹{netPayable})</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400 font-medium">
                🔒 Instant PDF download + WhatsApp ready order receipt
              </p>
            </form>

            {/* Right: Order Summary Snapshot (Compact & Clean) */}
            <div className="md:col-span-5 bg-gradient-to-b from-gray-50/90 to-amber-50/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
                <h3 className="font-black text-gray-900 text-xs uppercase tracking-wider">
                  Order Summary
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {totalItemsCount} units
                </span>
              </div>

              {/* Items List (Compact max height with smooth scroll) */}
              <div className="space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100">
                {items.map((it) => (
                  <div key={it.id} className="pt-1.5 first:pt-0 flex justify-between items-center text-[11px]">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-gray-800 truncate">{it.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {it.quantity} × ₹{it.price}
                      </p>
                    </div>
                    <span className="font-black text-gray-900 font-rupee shrink-0">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-gray-300 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900 font-rupee">₹{subtotal}</span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50/80 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Diwali Discount ({discountPercentage}%):</span>
                    </span>
                    <span className="font-black font-rupee">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 text-[10px]">
                  <span>Packaging & Box:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200">
                  <span className="font-black text-xs text-gray-900 uppercase">Net Payable:</span>
                  <span className="font-black text-xl sm:text-2xl text-[#D40000] font-rupee leading-none">
                    ₹{netPayable}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
