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

  const referralLine = order.referredBy ? `\n*Referred By:* ${order.referredBy}` : '';

  const rawMessage = `*New Diwali Cracker Order - Karadi Crackers* 🎆

*Order Number:* ${order.orderNumber}
*Customer Name:* ${order.customerName}
*Phone:* +91 ${order.customerPhone}${referralLine}
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

          {/* Action Buttons: WhatsApp (FIRST) & Download PDF */}
          <div className="space-y-3 mb-8">
            {/* WhatsApp CTA Banner Header */}
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Instant Confirmation: Send your order via WhatsApp first!</span>
            </div>

            {/* WhatsApp Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. 9786848686 (FIRST IN LIST) */}
              <a
                href={`https://wa.me/919786848686?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm border-2 border-white cursor-pointer"
              >
                {/* Official WhatsApp SVG Logo */}
                <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 97868 48686)</span>
              </a>

              {/* 2. 8072044403 */}
              <a
                href={`https://wa.me/918072044403?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm border-2 border-white cursor-pointer"
              >
                <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 80720 44403)</span>
              </a>

              {/* 3. 7708467470 */}
              <a
                href={`https://wa.me/917708467470?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm border-2 border-white cursor-pointer"
              >
                <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 77084 67470)</span>
              </a>
            </div>

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
            <div className="text-xs font-semibold text-gray-700 space-y-2 bg-white/80 p-3 rounded-xl border border-amber-200">
              <div className="text-gray-900 font-bold flex items-center gap-1.5 text-xs text-[#D40000]">
                <MapPin className="w-4 h-4 text-[#D40000] shrink-0" />
                <span>Collection Points (Both Branches Open):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200/80">
                  <span className="font-black text-[#D40000] text-[11px] block">Branch 1: Arasan steels</span>
                  <p className="text-[11px] text-gray-700 leading-tight mt-0.5">
                    120 feet road, Near Old Royal Enfield Showroom, Karaikudi.
                  </p>
                </div>
                <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200/80">
                  <span className="font-black text-[#D40000] text-[11px] block">Branch 2: New Karadi crackers</span>
                  <p className="text-[11px] text-gray-700 leading-tight mt-0.5">
                    Opp to Ramraj cotton, 100 feet Road, Karaikudi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-100 pl-2">
                <Phone className="w-3.5 h-3.5 text-[#D40000] shrink-0" />
                <span className="text-[11px]">Contact: +91 8072044403 / +91 9786848686 / +91 8682830542</span>
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
