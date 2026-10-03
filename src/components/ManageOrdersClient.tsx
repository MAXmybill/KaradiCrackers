'use client';

import { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import AdminNav from '@/components/AdminNav';
import {
  Search,
  Download,
  Filter,
  Eye,
  FileText,
  X,
  Phone,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ManageOrdersClientProps {
  initialOrders: Order[];
}

export default function ManageOrdersClient({ initialOrders }: ManageOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Status change handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const orderDateStr = new Date(o.createdAt).toISOString().slice(0, 10);
      matchesDate = orderDateStr === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and CSV Export Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">
              COUNTER ORDERS & INVOICES
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review customer reservations, update fulfillment, and export accounting records.
            </p>
          </div>

          <a
            href="/api/admin/orders/export"
            download
            className="inline-flex items-center gap-2 bg-[#FFC400] hover:bg-[#FFE082] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 border-2 border-amber-400"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Export Orders to CSV</span>
          </a>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-700 focus:outline-none"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-red-600 hover:underline font-bold"
              >
                Clear Date
              </button>
            )}

            {/* Status chips */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {['ALL', 'ORDERED', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-[#D40000] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const totalItems = ord.items.reduce((acc, i) => acc + i.quantity, 0);

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {new Date(ord.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{ord.customerName}</p>
                          <p className="text-xs text-gray-500 font-mono">+91 {ord.customerPhone}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {totalItems} pcs ({ord.items.length} types)
                        </td>
                        <td className="py-3 px-4 font-black text-[#D40000]">
                          ₹{ord.total}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="ORDERED">ORDERED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={`/api/invoice/${ord.orderNumber}`}
                              target="_blank"
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Download Invoice PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#D40000] shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Order Details
                  </span>
                  <h3 className="text-xl font-black text-gray-950 font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Meta Box */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Customer Name</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone Number</span>
                  <span className="font-bold text-gray-900 text-sm font-mono">+91 {selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Order Date</span>
                  <span className="font-medium text-gray-700">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Current Status</span>
                  <span className="font-extrabold text-[#D40000]">{selectedOrder.status}</span>
                </div>
              </div>

              {/* Itemized list */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Items In Order
                </h4>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-52 overflow-y-auto">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{it.name}</p>
                        <p className="text-gray-500">
                          {it.quantity} pcs @ ₹{it.price} each
                        </p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-baseline mt-3 px-1">
                  <span className="text-sm font-bold text-gray-700">Grand Total:</span>
                  <span className="text-2xl font-black text-[#D40000]">₹{selectedOrder.total}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-600">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                    }
                    className="text-xs font-bold px-2 py-1.5 rounded-lg border border-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ORDERED">ORDERED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <a
                  href={`/api/invoice/${selectedOrder.orderNumber}`}
                  target="_blank"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D40000] hover:bg-[#B00000] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#FFC400]" />
                  <span>Download Invoice PDF</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
