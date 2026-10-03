import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const shopAddress =
    process.env.NEXT_PUBLIC_SHOP_ADDRESS ||
    '12, Sivakasi Main Road, Near Gandhi Statue, Virudhunagar / Sivakasi, Tamil Nadu - 626123';
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+91 98765 43210';
  const shopWhatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '919876543210';

  return (
    <footer className="bg-[#B00000] text-white border-t-4 border-[#FFC400]">
      {/* Top Banner inside Footer */}
      <div className="bg-[#900000] py-6 px-4 border-b border-red-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow">
              <Image src="/logo.jpg" alt="Karadi Logo" width={40} height={40} className="rounded-full" />
            </div>
            <div>
              <h4 className="font-extrabold text-[#FFC400] text-lg">Karadi Crackers - Safe & Genuine</h4>
              <p className="text-xs text-amber-100">100% Sivakasi Standard Green Crackers • Lowest Direct Rates</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-amber-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-amber-300/30">
              <ShieldCheck className="w-4 h-4 text-[#FFC400]" />
              <span>Tested & Certified</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-amber-300/30">
              <Clock className="w-4 h-4 text-[#FFC400]" />
              <span>Open 8:00 AM - 10:30 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shop About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-2xl font-black text-[#FFC400] tracking-wide">KARADI CRACKERS</h3>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed mb-4">
              Celebrate this Diwali with our premium range of colorful sparklers, exciting aerial sky shots,
              flower pots, and sound crackers. Book your crackers online effortlessly, download your invoice,
              and pick up your package at our counter with zero hassle!
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-200 font-medium">
              <Sparkles className="w-4 h-4 text-[#FFC400]" />
              <span>No online payment required. Pay when you collect.</span>
            </div>
          </div>

          {/* Quick Links & Info */}
          <div>
            <h4 className="text-lg font-bold text-[#FFC400] mb-4 border-b border-red-700 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <Link href="/" className="hover:text-[#FFC400] transition-colors flex items-center gap-2">
                  <span>→</span> Home Page
                </Link>
              </li>
              <li>
                <Link href="/crackers" className="hover:text-[#FFC400] transition-colors flex items-center gap-2">
                  <span>→</span> View Crackers Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FFC400] transition-colors flex items-center gap-2">
                  <span>→</span> View My Cart & Invoice
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${shopWhatsapp}?text=${encodeURIComponent('Hello Karadi Crackers! I would like to inquire about Diwali cracker availability.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFC400] transition-colors flex items-center gap-2"
                >
                  <span>→</span> WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Store Location & Contact */}
          <div>
            <h4 className="text-lg font-bold text-[#FFC400] mb-4 border-b border-red-700 pb-2">
              Visit Our Shop
            </h4>
            <div className="space-y-3 text-sm text-gray-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#FFC400] shrink-0 mt-0.5" />
                <span className="leading-snug">{shopAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFC400] shrink-0" />
                <span>{shopPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#FFC400] shrink-0" />
                <span>WhatsApp: +{shopWhatsapp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-red-800 flex flex-col sm:flex-row items-center justify-between text-xs text-red-200 gap-3">
          <p>© {new Date().getFullYear()} Karadi Crackers. All rights reserved. Sivakasi Fireworks.</p>
          <div className="flex items-center gap-4">
            <span>Safety Guidelines Followed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
