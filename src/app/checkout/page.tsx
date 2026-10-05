'use client';

import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Sparkles, Loader2, Info, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { StoreSettings } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D40000] mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Preparing checkout...</p>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const discountPercentage = settings?.discountPercentage || 0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const netPayable = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is currently empty</h2>
        <p className="text-gray-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/crackers"
          className="inline-flex items-center gap-2 bg-[#D40000] text-white font-bold px-6 py-3 rounded-xl shadow-md border-2 border-[#FFC400]"
        >
          Browse Crackers
        </Link>
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
      setNameError('Customer name must be at least 2 characters');
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

      toast.success('Order placed successfully! Generating invoice...');

      // Clear local cart
      clearCart();

      // Redirect to confirmation
      router.push(`/order/${data.orderNumber}`);
    } catch (err: any) {
      setServerError(err.message || 'Network error. Please try again.');
      toast.error('Network error. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-[#D40000] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        <div className="bg-white rounded-3xl border-2 border-[#D40000] p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Header */}
          <div className="border-b-2 border-red-100 pb-6 mb-8 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-wider text-[#D40000] bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Express Counter Booking
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-2">
              CUSTOMER CHECKOUT
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Provide your details to generate your invoice. Payment is made at the counter during pickup.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Stock or Validation Alert</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Customer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] ${
                    nameError ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                  required
                />
                {nameError && <p className="text-xs text-red-600 mt-1.5 font-medium">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Mobile Number (10 Digits) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmitting}
                    className={`w-full pl-14 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D40000] ${
                      phoneError ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {phoneError && <p className="text-xs text-red-600 mt-1.5 font-medium">{phoneError}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  We'll use this phone number to look up your order at the shop counter.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-[#D40000]">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Important Collection Notice</span>
                </div>
                <p>
                  Please visit the shop with your generated invoice or phone number to pay and collect your order at the counter. <strong>No online payment required.</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#D40000] hover:bg-[#B00000] text-white font-black rounded-2xl shadow-xl transition-all duration-200 border-2 border-[#FFC400] flex items-center justify-center gap-2 text-base active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Validating & Generating Invoice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-[#FFC400]" />
                    <span>Generate Invoice (₹{netPayable})</span>
                  </>
                )}
              </button>
            </form>

            {/* Order Summary Snapshot */}
            <div className="md:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide border-b pb-2 mb-3">
                Order Summary ({items.length} items)
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-800 line-clamp-1">{it.name}</p>
                      {settings?.showPricing ? (
                        <p className="text-gray-500">
                          {it.quantity} × ₹{it.price}
                        </p>
                      ) : (
                        <p className="text-gray-500 font-semibold">Qty: {it.quantity}</p>
                      )}
                    </div>
                    {settings?.showPricing && (
                      <span className="font-bold text-gray-900">₹{it.price * it.quantity}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Total Amount:</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                    <span>Discount ({discountPercentage}%):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                  <span className="font-black text-sm text-gray-900">Final Net Total:</span>
                  <span className="font-black text-2xl text-[#D40000]">₹{netPayable}</span>
                </div>
                <span className="text-[11px] text-gray-500 block text-right mt-0.5 font-medium">
                  (Pay at counter upon pickup)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
