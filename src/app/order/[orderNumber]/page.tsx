import { getOrderByNumber, getStoreSettings } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileDown,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import OrderConfetti from '@/components/OrderConfetti';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([
    getOrderByNumber(orderNumber),
    getStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const showPricing = settings?.showPricing ?? true;
  const shopWhatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '919876543210';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const invoiceDownloadUrl = `${siteUrl}/api/invoice/${order.orderNumber}`;

  // Build Itemized WhatsApp Message
  const itemsText = order.items
    .map(
      (item, idx) =>
        showPricing
          ? `${idx + 1}. ${item.name} (${item.quantity} pcs @ ₹${item.price}) = ₹${
              item.quantity * item.price
            }`
          : `${idx + 1}. ${item.name} (${item.quantity} pcs)`
    )
    .join('\n');

  const discountLine =
    order.discountPercentage && order.discountPercentage > 0
      ? `\n*Subtotal:* ₹${order.subtotal || order.total}\n*Diwali Discount (${order.discountPercentage}%):* -₹${order.discountAmount || 0}`
      : '';

  const rawMessage = `*New Diwali Cracker Order - Karadi Crackers* 🎆

*Order Number:* ${order.orderNumber}
*Customer Name:* ${order.customerName}
*Phone:* +91 ${order.customerPhone}
*Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN')}

*Itemized List:*
${itemsText}
${discountLine}
*Final Amount Payable:* ₹${order.total}

📄 *PDF Invoice Link:*
${invoiceDownloadUrl}

_I will visit the shop and collect my order._`;

  const encodedWhatsAppUrl = `https://wa.me/${shopWhatsapp}?text=${encodeURIComponent(rawMessage)}`;

  return (
    <div className="bg-white min-h-screen py-4 sm:py-16">
      <OrderConfetti />

      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#D40000] p-4 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Top Yellow Ribbon */}
          <div className="h-2.5 sm:h-3 bg-[#FFC400] -mx-4 sm:-mx-10 -mt-4 sm:-mt-10 mb-6 sm:mb-8" />

          {/* Success Checkmark & Title */}
          <div className="text-center space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200">
              Order Registered Successfully
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950">
              THANK YOU, {order.customerName.toUpperCase()}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
              Your Diwali cracker reservation is placed. Your unique order number is:
            </p>
            <div className="inline-block bg-[#D40000] text-[#FFC400] font-black text-lg sm:text-2xl px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-md border-2 border-[#FFC400]">
              {order.orderNumber}
            </div>
          </div>

          {/* Action Buttons: WhatsApp & Download PDF */}
          <div className="space-y-3 mb-8">
            {/* WhatsApp Express Button */}
            <a
              href={encodedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-base sm:text-lg border-2 border-white"
            >
              <MessageSquare className="w-6 h-6 fill-current" />
              <span>Send on WhatsApp</span>
            </a>

            {/* Download PDF Button */}
            <a
              href={`/api/invoice/${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 bg-white hover:bg-gray-50 text-gray-900 font-extrabold rounded-2xl shadow-sm transition-colors border-2 border-gray-300 flex items-center justify-center gap-2 text-sm sm:text-base hover:border-[#D40000] cursor-pointer"
            >
              <FileDown className="w-5 h-5 text-[#D40000]" />
              <span>Download PDF Invoice</span>
            </a>
          </div>

          {/* Collection Notice Box */}
          <div className="bg-[#FFF9E6] border-2 border-dashed border-[#FFC400] rounded-2xl p-5 mb-8 text-amber-950">
            <h3 className="font-extrabold text-base text-[#D40000] flex items-center gap-2 mb-2">
              <StoreIcon className="w-5 h-5" />
              <span>Visit the Shop & Pay at Counter</span>
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              Visit our shop, tell your phone number (<strong>+91 {order.customerPhone}</strong>) or show your order number (<strong>{order.orderNumber}</strong>), collect your crackers, and pay directly at the counter.
            </p>
            <div className="text-xs font-semibold text-gray-700 space-y-1 bg-white/70 p-3 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D40000]" />
                <span>{process.env.NEXT_PUBLIC_SHOP_ADDRESS || '12, Sivakasi Main Road, Sivakasi, Tamil Nadu'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D40000]" />
                <span>Contact: {process.env.NEXT_PUBLIC_SHOP_PHONE || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          {/* Order Details Preview */}
          <div className="border border-gray-200 rounded-2xl p-5">
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide border-b pb-2 mb-3">
              Reserved Items Summary
            </h3>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-gray-900">{item.name}</span>
                    {showPricing ? (
                      <span className="text-gray-500 block text-xs">
                        {item.quantity} × ₹{item.price}
                      </span>
                    ) : (
                      <span className="text-gray-500 block text-xs font-semibold">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                  {showPricing && (
                    <span className="font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-gray-200 mt-2 space-y-2 text-xs sm:text-sm">
              {order.discountPercentage && order.discountPercentage > 0 ? (
                <>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">₹{order.subtotal || order.total}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                    <span>Diwali Discount ({order.discountPercentage}%):</span>
                    <span>-₹{order.discountAmount || 0}</span>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-extrabold text-sm text-gray-800">Final Total Payable at Counter:</span>
                <span className="font-black text-2xl text-[#D40000]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 text-center pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-bold text-gray-600 hover:text-[#D40000] transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/crackers"
              className="text-sm font-bold text-[#D40000] hover:underline flex items-center gap-1"
            >
              <span>Explore More Crackers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
