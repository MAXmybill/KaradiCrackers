import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShoppingBag, FileText, Send, Store, ArrowRight, ShieldCheck, Award, Zap } from 'lucide-react';
import { getCrackers } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const crackers = await getCrackers(true);
  const featuredCrackers = crackers.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-sunburst text-white py-8 sm:py-24 border-b-6 sm:border-b-8 border-[#FFC400]">
        {/* Subtle decorative glow & overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-red-900/30 to-black/40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FFC400] text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-extrabold uppercase tracking-wider shadow-lg border-2 border-white">
                <Sparkles className="w-3.5 h-3.5 text-[#D40000]" />
                <span>Diwali 2026 Cracker Booking is Live</span>
              </div>

              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold text-[#FFC400] drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] leading-tight">
                LIGHT UP YOUR DIWALI!
              </h1>

              <p className="text-sm sm:text-xl text-white/95 max-w-2xl font-medium leading-relaxed drop-shadow">
                Pure Sivakasi factory-quality fireworks at wholesale rates. Choose your favorites,
                generate an instant order invoice, send it on WhatsApp, and collect directly at our counter!
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-1 sm:pt-2">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-white/20 text-[11px] sm:text-sm">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC400]" />
                  <span>100% Verified Stock</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-white/20 text-[11px] sm:text-sm">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC400]" />
                  <span>Instant PDF Invoice</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-white/20 text-[11px] sm:text-sm">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC400]" />
                  <span>Zero Online Payment</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="/crackers"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-[#FFC400] hover:bg-[#FFE082] text-black font-extrabold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 border-2 border-white group"
                >
                  <ShoppingBag className="w-5 h-5 text-[#D40000]" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-5 h-5 text-[#D40000] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/30 transition-all backdrop-blur"
                >
                  <span>How It Works</span>
                </Link>
              </div>
            </div>

            {/* Right Mascot Logo Banner */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 transform hover:scale-105 transition-transform duration-500 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                <Image
                  src="/logo.png"
                  alt="Karadi Crackers Panda Mascot"
                  fill
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#D40000] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3">
              HOW IT WORKS
            </h2>
            <p className="mt-2 text-gray-600 text-base">
              No logins, no payment gateways, and no credit card needed! Order in under 1 minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="relative bg-[#FFF9E6] p-6 rounded-2xl border-2 border-dashed border-[#FFC400] flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#D40000] text-[#FFC400] font-black text-2xl flex items-center justify-center mb-4 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pick Crackers</h3>
              <p className="text-sm text-gray-600">
                Browse our wide selection of sparklers, flower pots, rockets, and family gift boxes. Add your needed quantities to cart.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-[#FFF9E6] p-6 rounded-2xl border-2 border-dashed border-[#FFC400] flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#D40000] text-[#FFC400] font-black text-2xl flex items-center justify-center mb-4 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Invoice</h3>
              <p className="text-sm text-gray-600">
                Enter your name and mobile number at checkout. Our system creates an official PDF invoice instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-[#FFF9E6] p-6 rounded-2xl border-2 border-dashed border-[#FFC400] flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#D40000] text-[#FFC400] font-black text-2xl flex items-center justify-center mb-4 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Send on WhatsApp</h3>
              <p className="text-sm text-gray-600">
                Click one button to send your order invoice summary to our official WhatsApp number for express packing.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative bg-[#FFF9E6] p-6 rounded-2xl border-2 border-dashed border-[#FFC400] flex flex-col items-center text-center shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#D40000] text-[#FFC400] font-black text-2xl flex items-center justify-center mb-4 shadow-md">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pay & Collect</h3>
              <p className="text-sm text-gray-600">
                Visit our shop, provide your phone number, inspect your cracker parcel, and pay at the counter!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CRACKERS SECTION */}
      <section className="py-16 bg-[#FFF5F5] border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#D40000]">
                Diwali Highlights
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1">
                TOP SELLING FESTIVE CRACKERS
              </h2>
            </div>
            <Link
              href="/crackers"
              className="inline-flex items-center gap-2 font-bold text-[#D40000] hover:text-red-700 bg-white px-4 py-2 rounded-xl shadow-xs border border-red-200 text-sm"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCrackers.map((cracker) => (
              <ProductCard key={cracker.id} cracker={cracker} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/crackers"
              className="inline-flex items-center gap-3 bg-[#D40000] hover:bg-[#B00000] text-white font-black text-lg px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-[#FFC400]" />
              <span>Explore Complete Diwali Catalog</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
