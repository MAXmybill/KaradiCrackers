import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrderByNumber, getStoreSettings } from '@/lib/db';
import OrderConfetti from '@/components/OrderConfetti';
import {
  CheckCircle2,
  FileDown,
  ArrowRight,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderConfirmationPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([
    getOrderByNumber(orderNumber),
    getStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const showPricing = settings?.showPricing ?? true;
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

  return (
    <div className="bg-gradient-to-b from-amber-50/20 via-white to-gray-50 py-3 sm:py-6 px-2 sm:px-4">
      <OrderConfetti />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border-2 border-[#D40000] p-3 sm:p-5 shadow-xl relative overflow-hidden">
          {/* Top Yellow Ribbon */}
          <div className="h-2 bg-[#FFC400] -mx-3 sm:-mx-5 -mt-3 sm:-mt-5 mb-3" />

          {/* Compact Success Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-3 border-b border-red-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Order Placed
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    Pay at counter on pickup
                  </span>
                </div>
                <h1 className="text-base sm:text-xl font-black text-gray-950 leading-tight">
                  THANK YOU, {order.customerName.toUpperCase()}!
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <a
                href={`/api/invoice/${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 text-xs border border-[#FFC400] cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#FFC400]" />
                <span>Download PDF Invoice</span>
              </a>

              <div className="text-right flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase hidden sm:inline">Order #:</span>
                <span className="bg-amber-100 text-[#D40000] font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-2xs border border-amber-300 font-mono">
                  {order.orderNumber}
                </span>
              </div>
            </div>
          </div>

          {/* TOP ACTION BAR: WhatsApp (3 numbers) + Download PDF shortcut */}
          <div className="my-2.5 p-2 sm:p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-950 uppercase tracking-tight">
                <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Instant Confirmation: Send your order via WhatsApp first!</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
                Tap number to send invoice on WhatsApp
              </span>
            </div>

            {/* 3 WhatsApp Buttons in 1 Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <a
                href={`https://wa.me/919786848686?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 text-xs border border-white cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 97868 48686)</span>
              </a>

              <a
                href={`https://wa.me/918072044403?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 text-xs border border-white cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 80720 44403)</span>
              </a>

              <a
                href={`https://wa.me/917708467470?text=${encodeURIComponent(rawMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl shadow-xs transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 text-xs border border-white cursor-pointer"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp (+91 77084 67470)</span>
              </a>
            </div>
          </div>

          {/* TWO-COLUMN COMPACT LAYOUT (FITS DIRECTLY INSIDE VIEWPORT) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start my-2.5">
            {/* LEFT COLUMN (7 COLS): Reserved Items Summary */}
            <div className="md:col-span-7 border border-gray-200 rounded-xl p-3 bg-gray-50/40">
              <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                <span className="font-black text-xs text-gray-900 uppercase tracking-tight flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D40000]" />
                  <span>Items ({order.items.reduce((a, b) => a + b.quantity, 0)} pcs)</span>
                </span>
                <span className="text-[11px] font-bold text-gray-500">
                  {order.items.length} types
                </span>
              </div>

              {/* Items List (compact scroll max 160px) */}
              <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto pr-1 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center">
                    <div className="pr-2 truncate">
                      <span className="font-bold text-gray-900 truncate block">{item.name}</span>
                      <span className="text-[10px] text-gray-500">
                        {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 font-rupee shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-2 border-t border-dashed border-gray-200 mt-1 space-y-1 text-xs">
                {order.discountPercentage && order.discountPercentage > 0 ? (
                  <>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-900">₹{order.subtotal || order.total}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      <span>Diwali Discount ({order.discountPercentage}%):</span>
                      <span>-₹{order.discountAmount || 0}</span>
                    </div>
                  </>
                ) : null}

                <div className="flex justify-between items-baseline pt-1 border-t border-gray-200">
                  <span className="font-black text-xs text-gray-900">Total Payable:</span>
                  <span className="font-black text-xl text-[#D40000] font-rupee">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (5 COLS): Collection & Pickup Info */}
            <div className="md:col-span-5 space-y-2">
              {/* Pickup & Collection Points Box */}
              <div className="bg-[#FFFDF4] border border-amber-300/80 rounded-xl p-2.5 text-amber-950 text-xs">
                <div className="flex items-center gap-1 text-[#D40000] font-black text-xs uppercase mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Collection Branches</span>
                </div>

                <div className="space-y-1.5 text-[11px] leading-tight">
                  <div className="p-1.5 bg-white rounded-lg border border-amber-200/60">
                    <span className="font-black text-blue-950 block">Branch 1: Arasan steels</span>
                    <p className="text-gray-600">120 feet road, Near Old Royal Enfield Showroom, Karaikudi.</p>
                  </div>

                  <div className="p-1.5 bg-white rounded-lg border border-amber-200/60">
                    <span className="font-black text-purple-950 block">Branch 2: New Karadi crackers</span>
                    <p className="text-gray-600">Opp to Ramraj cotton, 100 feet Road, Karaikudi.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-1.5 mt-1 border-t border-amber-200/60 text-[10px] text-gray-600 font-mono">
                  <Phone className="w-3 h-3 text-[#D40000] shrink-0" />
                  <span>8072044403 / 9786848686 / 8682830542</span>
                </div>
              </div>

              {/* PDF Invoice Download Button */}
              <a
                href={`/api/invoice/${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-900 font-extrabold rounded-xl shadow-xs transition-colors border-2 border-gray-300 flex items-center justify-center gap-2 text-xs hover:border-[#D40000] cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#D40000]" />
                <span>Download PDF Invoice</span>
              </a>
            </div>
          </div>

          {/* Compact Bottom Links */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="font-bold text-gray-500 hover:text-[#D40000] transition-colors"
            >
              ← Home
            </Link>
            <Link
              href="/crackers"
              className="font-bold text-[#D40000] hover:underline flex items-center gap-1"
            >
              <span>Explore More Crackers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
