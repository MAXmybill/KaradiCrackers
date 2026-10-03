'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  const [adminId, setAdminId] = useState('karadicrackers');
  const [password, setPassword] = useState('password123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: adminId.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
        toast.error(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      toast.success('Welcome back, Admin!');
      
      // Determine redirection target
      const targetUrl = fromParam && fromParam.startsWith('/admin') && fromParam !== '/admin/login' 
        ? fromParam 
        : '/admin';

      // Full window redirection to guarantee cookie availability on Next.js server components
      window.location.href = targetUrl;
    } catch (err: any) {
      setError('An error occurred during authentication');
      toast.error('Authentication error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-sunburst-subtle flex items-center justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-[#D40000] p-6 sm:p-10 shadow-2xl relative my-auto">
        {/* Top yellow stitch banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFC400] rounded-t-3xl" />

        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <Image src="/logo.png" alt="Karadi Crackers Logo" fill className="object-contain drop-shadow-md" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[#D40000] bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Protected Staff Area
          </span>
          <h1 className="text-2xl font-extrabold text-gray-950 mt-2">
            ADMIN PORTAL LOGIN
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage inventory stocks, price list, and view counter orders
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Admin Username / ID
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="karadicrackers"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold rounded-xl shadow-md transition-all border-2 border-[#FFC400] flex items-center justify-center gap-2 text-sm active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Secure Admin Login</span>
                <ArrowRight className="w-4 h-4 text-[#FFC400]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Karadi Crackers POS & Inventory Management System
          </p>
        </div>
      </div>
    </div>
  );
}
