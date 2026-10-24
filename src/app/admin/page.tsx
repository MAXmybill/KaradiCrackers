import { getCrackers, getOrders } from '@/lib/db';
import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {
  Package,
  CheckCircle,
  ShoppingBag,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [crackers, orders] = await Promise.all([getCrackers(false), getOrders()]);

  const totalProducts = crackers.length;
  const availableProducts = crackers.filter((c) => c.isAvailable).length;
  const lowStockCount = crackers.filter((c) => c.isAvailable && c.quantity <= 15).length;
  const outOfStockCount = crackers.filter((c) => !c.isAvailable).length;

  const totalOrders = orders.length;
  const orderedOrders = orders.filter((o) => o.status === 'ORDERED' || (o.status as any) === 'PENDING').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED' || (o.status as any) === 'COLLECTED').length;

  // Branch 1 & Branch 2 breakdowns
  const b1Orders = orders.filter((o) => o.branch === 'BRANCH_1');
  const b2Orders = orders.filter((o) => o.branch === 'BRANCH_2');

  const b1SettledRevenue = b1Orders
    .filter((o) => o.paymentType === 'SETTLED' || (o.status === 'DELIVERED' && !o.paymentType))
    .reduce((sum, o) => sum + o.total, 0);
  const b1CreditAmount = b1Orders
    .filter((o) => o.paymentType === 'CREDIT')
    .reduce((sum, o) => sum + o.total, 0);

  const b2SettledRevenue = b2Orders
    .filter((o) => o.paymentType === 'SETTLED' || (o.status === 'DELIVERED' && !o.paymentType))
    .reduce((sum, o) => sum + o.total, 0);
  const b2CreditAmount = b2Orders
    .filter((o) => o.paymentType === 'CREDIT')
    .reduce((sum, o) => sum + o.total, 0);

  // Overall totals across all branches
  const totalSettledRevenue = orders
    .filter((o) => o.paymentType === 'SETTLED' || (o.status === 'DELIVERED' && !o.paymentType))
    .reduce((sum, o) => sum + o.total, 0);
  const totalCreditAmount = orders
    .filter((o) => o.paymentType === 'CREDIT')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome row */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              STORE MANAGEMENT DASHBOARD
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live snapshot of Karadi Crackers inventory, sales, and counter reservations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/crackers"
              className="inline-flex items-center gap-2 bg-[#7B1FA2] text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-[#6A1B9A] transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" />
              <span>Manage Products</span>
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 bg-[#FFC400] text-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-[#FFE082] transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Orders</span>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">{outOfStockCount} hidden (turned OFF)</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Active Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Catalog (ON)</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{availableProducts}</p>
              <p className="text-xs text-emerald-700 mt-1 font-semibold">Live in store</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">{deliveredOrders} delivered & paid</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Ordered (Pending Delivery) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D40000] shadow-xs flex items-center justify-between bg-red-50/20">
            <div>
              <p className="text-xs font-extrabold text-[#D40000] uppercase tracking-wider">Ordered</p>
              <p className="text-3xl font-black text-[#D40000] mt-1">{orderedOrders}</p>
              <p className="text-xs text-[#D40000] mt-1 font-bold">Awaiting delivery / pickup</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#D40000] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Secondary Insights & Recent Orders Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Orders List */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-base font-extrabold text-gray-900">Recent Customer Bookings</h2>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#7B1FA2] hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-y">
                    <tr>
                      <th className="py-2.5 px-3">Order No</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-800">
                          {ord.customerName}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          +91 {ord.customerPhone}
                        </td>
                        <td className="py-3 px-3 font-black text-[#D40000]">
                          ₹{ord.total}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No orders registered yet.</p>
            )}
          </div>

          {/* Quick Shortcuts & Inventory Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Branch 1, Branch 2 & All Branches Revenue & Credit Breakdown */}
            <div className="bg-gradient-to-br from-[#4A148C] to-[#311B92] text-white rounded-2xl p-5 shadow-md border-2 border-purple-400 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-300/30 pb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FFC400]" />
                  Branches Financial Summary
                </span>
                <Link href="/admin/orders" className="text-[11px] text-purple-200 hover:text-white underline font-bold">
                  Details →
                </Link>
              </div>

              {/* Total Across All Branches */}
              <div className="bg-black/25 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                  All Branches Combined
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-emerald-300 font-bold">Settled (Paid):</span>
                  <span className="text-xl font-black text-emerald-300">₹{totalSettledRevenue}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-amber-300 font-bold">Credit (Pending):</span>
                  <span className="text-lg font-black text-amber-300">₹{totalCreditAmount}</span>
                </div>
              </div>

              {/* Branch 1 Card */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#FFC400]">Branch 1</span>
                  <span className="text-[10px] text-purple-200 font-semibold">{b1Orders.length} orders</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-emerald-200">Settled:</span>
                  <span className="font-bold text-emerald-300">₹{b1SettledRevenue}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-amber-200">Credit:</span>
                  <span className="font-bold text-amber-300">₹{b1CreditAmount}</span>
                </div>
              </div>

              {/* Branch 2 Card */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#FFC400]">Branch 2</span>
                  <span className="text-[10px] text-purple-200 font-semibold">{b2Orders.length} orders</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-emerald-200">Settled:</span>
                  <span className="font-bold text-emerald-300">₹{b2SettledRevenue}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-amber-200">Credit:</span>
                  <span className="font-bold text-amber-300">₹{b2CreditAmount}</span>
                </div>
              </div>
            </div>

            {/* Bulk Price Adjustment Shortcut Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border-2 border-[#FFC400] p-5 shadow-xs">
              <h3 className="font-extrabold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#D40000] text-[#FFC400] flex items-center justify-center font-black text-xs">
                  %
                </span>
                <span>Bulk Price Adjustment</span>
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Increase or decrease prices across all {totalProducts} items by any percentage (e.g. 10%).
              </p>
              <Link
                href="/admin/crackers"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow-xs transition-colors"
              >
                <span>Adjust Prices in Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Catalog Visibility Status Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <h3 className="font-extrabold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Storefront Status</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-medium text-emerald-900">Active Live in Store (ON)</span>
                  <span className="font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md">
                    {availableProducts} products
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-gray-100 rounded-xl border border-gray-200">
                  <span className="font-medium text-gray-800">Hidden from Store (OFF)</span>
                  <span className="font-black text-gray-700 bg-white px-2 py-0.5 rounded-md">
                    {outOfStockCount} products
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t">
                <Link
                  href="/admin/crackers"
                  className="text-xs font-bold text-[#D40000] hover:underline flex items-center justify-between"
                >
                  <span>Manage Products & Visibility</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
