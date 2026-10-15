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
  Sparkles,
  Percent,
  Tag,
  DollarSign,
  Receipt,
  Store,
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

  // Delivery settlement modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [discountType, setDiscountType] = useState<'none' | 'flat' | 'percentage'>('none');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Status change handler
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    extraDiscount?: {
      type?: 'flat' | 'percentage';
      value?: number;
      amount?: number;
      finalTotal?: number;
    }
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          extraDiscount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }

      if (newStatus === 'DELIVERED') {
        toast.success(
          `Order #${data.order.orderNumber} marked as DELIVERED! Collected Revenue: ₹${data.order.total}`
        );
      } else {
        toast.info(`Order #${data.order.orderNumber} reverted to ORDERED.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Intercept changing status to DELIVERED to prompt for counter discount
  const handleStatusSelect = (order: Order, newStatus: OrderStatus) => {
    if (newStatus === 'DELIVERED' && order.status !== 'DELIVERED') {
      setDeliveryModalOrder(order);
      setDiscountType('none');
      setDiscountValue('');
    } else if (newStatus === 'ORDERED' && order.status === 'DELIVERED') {
      if (
        window.confirm(
          `Revert order #${order.orderNumber} back to ORDERED? Any counter discount will be cleared.`
        )
      ) {
        handleStatusChange(order.id, 'ORDERED');
      }
    }
  };

  // Calculate settlement values for modal
  const modalCurrentTotal = deliveryModalOrder
    ? deliveryModalOrder.originalTotal !== undefined
      ? deliveryModalOrder.originalTotal
      : deliveryModalOrder.total
    : 0;

  const numDiscountVal = parseFloat(discountValue) || 0;
  let calculatedDiscountAmount = 0;
  if (discountType === 'flat') {
    calculatedDiscountAmount = Math.min(modalCurrentTotal, Math.max(0, numDiscountVal));
  } else if (discountType === 'percentage') {
    calculatedDiscountAmount = Math.min(
      modalCurrentTotal,
      Math.round((modalCurrentTotal * Math.min(100, Math.max(0, numDiscountVal))) / 100)
    );
  }
  const calculatedFinalRevenue = Math.max(0, modalCurrentTotal - calculatedDiscountAmount);

  // Quick helper to round off to 0 or 5
  const handleQuickRoundOff = (targetEnd: 0 | 5) => {
    const remainder = modalCurrentTotal % 10;
    let discount = 0;
    if (targetEnd === 0) {
      discount = remainder;
    } else {
      discount = remainder >= 5 ? remainder - 5 : remainder + 5;
    }
    setDiscountType('flat');
    setDiscountValue(String(discount));
  };

  const confirmDeliverySettlement = async () => {
    if (!deliveryModalOrder) return;

    const extraDiscount =
      discountType !== 'none' && calculatedDiscountAmount > 0
        ? {
            type: discountType,
            value: numDiscountVal,
            amount: calculatedDiscountAmount,
            finalTotal: calculatedFinalRevenue,
          }
        : {
            type: 'flat' as const,
            value: 0,
            amount: 0,
            finalTotal: modalCurrentTotal,
          };

    await handleStatusChange(deliveryModalOrder.id, 'DELIVERED', extraDiscount);
    setDeliveryModalOrder(null);
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
              Review customer reservations, update fulfillment, and record collected revenue.
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
                className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  <th className="py-3 px-4">Revenue / Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const totalItems = ord.items.reduce((acc, i) => acc + i.quantity, 0);
                    const hasCounterDiscount =
                      ord.extraDiscountAmount && ord.extraDiscountAmount > 0;

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
                        <td className="py-3 px-4">
                          <span className="font-black text-[#D40000] text-sm font-rupee">
                            ₹{ord.total}
                          </span>
                          {hasCounterDiscount ? (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-0.5 font-bold">
                              Extra -₹{ord.extraDiscountAmount} (
                              {ord.extraDiscountType === 'percentage'
                                ? `${ord.extraDiscountValue}%`
                                : 'flat'}
                              )
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          {ord.status === 'DELIVERED' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                DELIVERED
                              </span>
                              <button
                                type="button"
                                title="Revert to ORDERED"
                                onClick={() => handleStatusSelect(ord, 'ORDERED')}
                                className="text-[10px] text-gray-400 hover:text-red-600 underline font-semibold cursor-pointer"
                              >
                                Revert
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusSelect(ord, 'DELIVERED')}
                              disabled={updatingId === ord.id}
                              className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-black border border-amber-500 shadow-xs active:scale-95 transition-all cursor-pointer hover:shadow"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-900" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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

        {/* ORDER DETAILS MODAL */}
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
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Meta Box */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Customer Name</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {selectedOrder.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone Number</span>
                  <span className="font-bold text-gray-900 text-sm font-mono">
                    +91 {selectedOrder.customerPhone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Order Date</span>
                  <span className="font-medium text-gray-700">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Current Status</span>
                  <span className="font-extrabold text-[#D40000]">
                    {selectedOrder.status}
                  </span>
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
                      <span className="font-bold text-gray-900 font-rupee">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown with Extra Counter Discount if applied */}
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                  {selectedOrder.originalTotal !== undefined &&
                    selectedOrder.originalTotal !== selectedOrder.total && (
                      <div className="flex justify-between text-gray-500">
                        <span>Original Bill:</span>
                        <span className="font-bold font-rupee">
                          ₹{selectedOrder.originalTotal}
                        </span>
                      </div>
                    )}

                  {selectedOrder.extraDiscountAmount && selectedOrder.extraDiscountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>
                        Counter Extra Discount (
                        {selectedOrder.extraDiscountType === 'percentage'
                          ? `${selectedOrder.extraDiscountValue}%`
                          : 'flat'}
                        ):
                      </span>
                      <span className="font-rupee">
                        -₹{selectedOrder.extraDiscountAmount}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">
                      Final Collected Revenue:
                    </span>
                    <span className="text-2xl font-black text-[#D40000] font-rupee">
                      ₹{selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-gray-600">Status:</span>
                  {selectedOrder.status === 'DELIVERED' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        DELIVERED
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatusSelect(selectedOrder, 'ORDERED')}
                        className="text-xs text-gray-500 hover:text-red-600 underline font-semibold cursor-pointer"
                      >
                        Revert to ORDERED
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusSelect(selectedOrder, 'DELIVERED')}
                      className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-black border border-amber-500 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-900" />
                      <span>Mark as DELIVERED</span>
                    </button>
                  )}
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

        {/* DELIVERY & COUNTER SETTLEMENT MODAL */}
        {deliveryModalOrder && (
          <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 border-2 border-[#D40000] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-950 leading-tight">
                      Confirm Delivery & Counter Payment
                    </h3>
                    <p className="text-[11px] text-gray-500 font-mono">
                      #{deliveryModalOrder.orderNumber} • {deliveryModalOrder.customerName} (+91{' '}
                      {deliveryModalOrder.customerPhone})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDeliveryModalOrder(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Amount Display */}
              <div className="my-3.5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/90 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                    Current Bill Total
                  </span>
                  <span className="text-xs text-gray-600">
                    {deliveryModalOrder.items.reduce((a, b) => a + b.quantity, 0)} pcs in order
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#D40000] font-rupee">
                    ₹{modalCurrentTotal}
                  </span>
                </div>
              </div>

              {/* Extra Discount Question & Mode Selector */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-gray-900 mb-1.5">
                    Was any extra discount applied at the counter?
                  </label>

                  {/* 3 Option Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('none');
                        setDiscountValue('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        discountType === 'none'
                          ? 'bg-[#D40000] text-white border-[#D40000] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>No Extra</span>
                      <span className="block text-[10px] font-normal opacity-85">₹0 Off</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('flat');
                        setDiscountValue('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        discountType === 'flat'
                          ? 'bg-[#D40000] text-white border-[#D40000] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>Amount (₹)</span>
                      <span className="block text-[10px] font-normal opacity-85">Round-off / Flat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountValue('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer text-center ${
                        discountType === 'percentage'
                          ? 'bg-[#D40000] text-white border-[#D40000] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>Percent (%)</span>
                      <span className="block text-[10px] font-normal opacity-85">Special % Off</span>
                    </button>
                  </div>
                </div>

                {/* Input Field when Flat or Percentage is selected */}
                {discountType === 'flat' && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-gray-800">
                      Enter Extra Discount Amount in ₹
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={modalCurrentTotal}
                        placeholder="e.g. 35"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                      />
                    </div>

                    {/* Quick round-off chips for fast billing */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-gray-400">Quick:</span>
                      {[10, 20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDiscountValue(String(amt))}
                          className="px-2 py-0.5 bg-white hover:bg-amber-100 text-gray-800 border border-gray-300 rounded text-[11px] font-bold cursor-pointer"
                        >
                          ₹{amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleQuickRoundOff(0)}
                        className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Round to ₹0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoundOff(5)}
                        className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Round to ₹5
                      </button>
                    </div>
                  </div>
                )}

                {discountType === 'percentage' && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-gray-800">
                      Enter Extra Discount Percentage (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 5"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        autoFocus
                        className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                        %
                      </span>
                    </div>

                    {/* Quick percentage chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-gray-400">Quick:</span>
                      {[2, 3, 5, 7, 10, 15].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountValue(String(pct))}
                          className="px-2 py-0.5 bg-white hover:bg-amber-100 text-gray-800 border border-gray-300 rounded text-[11px] font-bold cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Revenue Calculation Card */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 rounded-2xl border-2 border-emerald-300">
                  <div className="flex justify-between items-center text-xs text-emerald-950 mb-1">
                    <span>Initial Order Bill:</span>
                    <span className="font-bold font-rupee">₹{modalCurrentTotal}</span>
                  </div>

                  {calculatedDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-bold mb-1.5">
                      <span>
                        Counter Extra Discount (
                        {discountType === 'percentage' ? `${numDiscountVal}%` : 'flat'}):
                      </span>
                      <span className="font-rupee">-₹{calculatedDiscountAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black uppercase text-emerald-950 block">
                        Final Collected Revenue
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        (Store dashboard revenue)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-rupee leading-none">
                        ₹{calculatedFinalRevenue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeliverySettlement}
                  disabled={updatingId === deliveryModalOrder.id}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Confirm Delivery & Record ₹{calculatedFinalRevenue}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
