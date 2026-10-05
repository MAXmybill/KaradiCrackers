'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      toast.error('Logout error');
    }
  };

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Crackers', href: '/admin/crackers', icon: Package },
    { label: 'Orders History', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <nav className="bg-white border-b-2 border-red-100 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Portal title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
              <Image src="/logo.png" alt="Logo" fill sizes="(max-width: 640px) 36px, 40px" className="object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-lg text-[#D40000] tracking-tight">
                KARADI ADMIN
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase ml-1.5 bg-gray-100 px-1.5 py-0.5 rounded-full hidden sm:inline">
                POS
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#D40000] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#D40000] hover:bg-red-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions: View Store & Logout */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
