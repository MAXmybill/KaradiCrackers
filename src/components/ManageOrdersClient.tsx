'use client';

import { useState, useMemo } from 'react';
import { Order, OrderStatus, Cracker, Branch, PaymentType, OrderItem } from '@/types';
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
  AlertTriangle,
  Trash2,
  PlusCircle,
  CreditCard,
  Building2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface ManageOrdersClientProps {
  initialOrders: Order[];
  allCrackers?: Cracker[];
}

export default function ManageOrdersClient({
  initialOrders,
  allCrackers = [],
}: ManageOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Branch & Payment tabs
  const [branchTab, setBranchTab] = useState<'ALL' | Branch>('ALL');
  const [paymentTab, setPaymentTab] = useState<'ALL' | PaymentType>('ALL');

  // Delivery settlement modal state
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<Order | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch>('BRANCH_1');
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('SETTLED');
  const [discountType, setDiscountType] = useState<'none' | 'flat' | 'percentage'>('none');
  const [discountValue, setDiscountValue] = useState<string>('');

  // Editing order items modal / state (works for inspecting order or adding/removing items)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [tempItems, setTempItems] = useState<OrderItem[]>([]);
  const [isSavingItems, setIsSavingItems] = useState(false);
  const [showAddItemDropdown, setShowAddItemDropdown] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Out of stock lookup map
  const outOfStockMap = useMemo(() => {
    const map = new Map<string, boolean>();
    allCrackers.forEach((c) => {
      // Out of stock if isAvailable === false or quantity <= 0
      const isOut = c.isAvailable === false || (c.quantity !== undefined && c.quantity <= 0);
      map.set(c.id, isOut);
    });
    return map;
  }, [allCrackers]);

  // Status change handler
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    extraDiscount?: {
      type?: 'flat' | 'percentage';
      value?: number;
      amount?: number;
      finalTotal?: number;
    },
    branch?: Branch,
    paymentType?: PaymentType
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          extraDiscount,
          branch,
          paymentType,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
      if (editingOrder && editingOrder.id === orderId) {
        setEditingOrder(data.order);
      }

      if (newStatus === 'DELIVERED') {
        const branchLabel = branch === 'BRANCH_2' ? 'Ramraj Branch' : 'Arasan Branch';
        const payLabel = paymentType === 'CREDIT' ? 'CREDIT (Unpaid)' : 'SETTLED (Paid)';
        toast.success(
          `Order #${data.order.orderNumber} delivered from ${branchLabel} [${payLabel}]! Total: ₹${data.order.total}`
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

  // Settle Credit action
  const handleSettleCredit = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Mark Credit order #${orderNumber} as SETTLED (Paid in full)?`)) {
      return;
    }
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'settle_credit',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(data.order);
      toast.success(`Order #${orderNumber} marked as SETTLED!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to settle credit');
    } finally {
      setUpdatingId(null);
    }
  };

  // Open delivery modal
  const handleOpenDeliveryModal = (order: Order) => {
    setDeliveryModalOrder(order);
    setSelectedBranch(order.branch || 'BRANCH_1');
    setSelectedPaymentType(order.paymentType || 'SETTLED');
    setDiscountType('none');
    setDiscountValue('');
  };

  // Calculate settlement values for delivery modal
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

    await handleStatusChange(
      deliveryModalOrder.id,
      'DELIVERED',
      extraDiscount,
      selectedBranch,
      selectedPaymentType
    );
    setDeliveryModalOrder(null);
  };

  // Manage Items Modal (Remove / Add Items with No Stock indicator)
  const openEditItemsModal = (order: Order) => {
    setEditingOrder(order);
    setTempItems(JSON.parse(JSON.stringify(order.items)));
    setShowAddItemDropdown(false);
    setItemSearchQuery('');
  };

  const handleRemoveTempItem = (index: number) => {
    setTempItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTempItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveTempItem(index);
      return;
    }
    setTempItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  const handleAddCrackerToOrder = (cracker: Cracker) => {
    const existingIndex = tempItems.findIndex((it) => it.crackerId === cracker.id);
    if (existingIndex >= 0) {
      setTempItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    } else {
      const newItem: OrderItem = {
        crackerId: cracker.id,
        name: cracker.name,
        price: cracker.price,
        quantity: 1,
        originalPrice: cracker.originalPrice,
        itemCode: cracker.itemCode,
        piecesContent: cracker.piecesContent,
      };
      setTempItems((prev) => [...prev, newItem]);
    }
    toast.success(`Added ${cracker.name} to order`);
  };

  const handleSaveOrderItems = async () => {
    if (!editingOrder) return;
    if (tempItems.length === 0) {
      toast.error('An order must have at least one item.');
      return;
    }

    setIsSavingItems(true);
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_items',
          items: tempItems,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? data.order : o)));
      if (selectedOrder && selectedOrder.id === editingOrder.id) {
        setSelectedOrder(data.order);
      }
      setEditingOrder(data.order);
      toast.success(`Order #${data.order.orderNumber} updated! Total: ₹${data.order.total}`);
      setEditingOrder(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order items');
    } finally {
      setIsSavingItems(false);
    }
  };

  // Sort items inside order modal: Out of stock on top!
  const sortedTempItems = useMemo(() => {
    return [...tempItems].map((item, originalIndex) => ({
      item,
      originalIndex,
      isOutOfStock: item.crackerId ? outOfStockMap.get(item.crackerId) === true : false,
    })).sort((a, b) => {
      if (a.isOutOfStock && !b.isOutOfStock) return -1;
      if (!a.isOutOfStock && b.isOutOfStock) return 1;
      return 0;
    });
  }, [tempItems, outOfStockMap]);

  // Temp calculation for items modal
  const tempSubtotal = tempItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Financial summary calculations across branches
  const financialSummary = useMemo(() => {
    let b1Settled = 0;
    let b1Credit = 0;
    let b2Settled = 0;
    let b2Credit = 0;
    let allSettled = 0;
    let allCredit = 0;

    orders.forEach((ord) => {
      // Financial calculations apply to fulfilled orders
      if (ord.status === 'DELIVERED') {
        const isCredit = ord.paymentType === 'CREDIT';
        const isB2 = ord.branch === 'BRANCH_2';
        const isB1 = ord.branch === 'BRANCH_1';

        if (isB2) {
          if (isCredit) b2Credit += ord.total;
          else b2Settled += ord.total;
        } else if (isB1) {
          if (isCredit) b1Credit += ord.total;
          else b1Settled += ord.total;
        }

        if (isCredit) allCredit += ord.total;
        else allSettled += ord.total;
      }
    });

    return {
      b1: { settled: b1Settled, credit: b1Credit, total: b1Settled + b1Credit },
      b2: { settled: b2Settled, credit: b2Credit, total: b2Settled + b2Credit },
      all: { settled: allSettled, credit: allCredit, total: allSettled + allCredit },
    };
  }, [orders]);

  // Filter orders according to user rule:
  // - "All Branches" shows all orders (both pending ORDERED and fulfilled DELIVERED).
  // - "Branch 1" / "Branch 2" ONLY shows orders that have been DELIVERED (assigned to that branch with SETTLED or CREDIT).
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
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

      // Branch filter:
      // When filtering by specific Branch 1 or Branch 2, order MUST be fulfilled/delivered to that branch!
      let matchesBranch = true;
      if (branchTab === 'BRANCH_1') {
        matchesBranch = o.status === 'DELIVERED' && o.branch === 'BRANCH_1';
      } else if (branchTab === 'BRANCH_2') {
        matchesBranch = o.status === 'DELIVERED' && o.branch === 'BRANCH_2';
      } else {
        // ALL branches: shows everything
        matchesBranch = true;
      }

      // Payment filter
      let matchesPayment = true;
      if (paymentTab !== 'ALL') {
        if (paymentTab === 'CREDIT') {
          matchesPayment = o.paymentType === 'CREDIT';
        } else {
          matchesPayment = o.paymentType === 'SETTLED' || (!o.paymentType && o.status === 'DELIVERED');
        }
      }

      return matchesSearch && matchesStatus && matchesDate && matchesBranch && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, dateFilter, branchTab, paymentTab]);

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

  // Crackers for Add Item search
  const filteredAvailableCrackers = useMemo(() => {
    if (!itemSearchQuery.trim()) return allCrackers.slice(0, 25);
    const q = itemSearchQuery.toLowerCase();
    return allCrackers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.itemCode && c.itemCode.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
    );
  }, [allCrackers, itemSearchQuery]);

  return (
    <div className="bg-gray-50 min-h-screen text-slate-800">
      <AdminNav />

      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-950 flex items-center gap-1.5 leading-tight">
              <Building2 className="w-5 h-5 text-[#D40000]" />
              ORDERS & INVOICES MANAGEMENT
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500">
              Orders appear in <strong>All Branches</strong>. Once delivered & marked <strong>Settled</strong> or <strong>Credit</strong>, they move into their respective Branch list.
            </p>
          </div>

          <a
            href="/api/admin/orders/export"
            download
            className="inline-flex items-center gap-1.5 bg-[#FFC400] hover:bg-[#FFE082] text-black font-black px-3 py-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-95 border border-amber-400"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export CSV</span>
          </a>
        </div>

        {/* COMPACT FINANCIAL CARDS (Fitting in screen nicely) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-3.5">
          {/* ALL BRANCHES */}
          <div
            onClick={() => setBranchTab('ALL')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
              branchTab === 'ALL'
                ? 'bg-red-50/60 border-[#D40000] shadow-xs ring-1 ring-red-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-[#D40000]" />
                All Branches Combined
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-100 rounded text-gray-600">
                ₹{financialSummary.all.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-xs">
              <div className="bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
                <span className="text-[9px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-sm font-black text-emerald-700 font-rupee">₹{financialSummary.all.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                <span className="text-[9px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-sm font-black text-amber-700 font-rupee">₹{financialSummary.all.credit}</span>
              </div>
            </div>
          </div>

          {/* ARASAN BRANCH */}
          <div
            onClick={() => setBranchTab('BRANCH_1')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
              branchTab === 'BRANCH_1'
                ? 'bg-blue-50/60 border-blue-600 shadow-xs ring-1 ring-blue-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Arasan Branch
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 rounded text-blue-800">
                ₹{financialSummary.b1.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-xs">
              <div className="bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
                <span className="text-[9px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-sm font-black text-emerald-700 font-rupee">₹{financialSummary.b1.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                <span className="text-[9px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-sm font-black text-amber-700 font-rupee">₹{financialSummary.b1.credit}</span>
              </div>
            </div>
          </div>

          {/* RAMRAJ BRANCH */}
          <div
            onClick={() => setBranchTab('BRANCH_2')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
              branchTab === 'BRANCH_2'
                ? 'bg-purple-50/60 border-purple-600 shadow-xs ring-1 ring-purple-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                Ramraj Branch
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 rounded text-purple-800">
                ₹{financialSummary.b2.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100 text-xs">
              <div className="bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
                <span className="text-[9px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-sm font-black text-emerald-700 font-rupee">₹{financialSummary.b2.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                <span className="text-[9px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-sm font-black text-amber-700 font-rupee">₹{financialSummary.b2.credit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS & FILTERS BAR (Compact & Responsive) */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 mb-3 shadow-2xs flex flex-col gap-2">
          {/* Top row: Branch Tab & Payment Type Tab */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
            {/* Branch Selector Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
              <span className="text-[10px] font-black uppercase text-gray-500 px-1.5">Branch:</span>
              {[
                { id: 'ALL', label: 'All Branches' },
                { id: 'BRANCH_1', label: 'Arasan Branch' },
                { id: 'BRANCH_2', label: 'Ramraj Branch' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBranchTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    branchTab === tab.id
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Payment Type Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
              <span className="text-[10px] font-black uppercase text-gray-500 px-1.5">Payment:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'SETTLED', label: 'Settled (Paid)' },
                { id: 'CREDIT', label: 'Credit (Unpaid)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    paymentTab === tab.id
                      ? tab.id === 'CREDIT'
                        ? 'bg-amber-500 text-black font-black shadow-2xs'
                        : 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Search, Date & Status filters */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search order #, customer or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D40000]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                >
                  Clear Date
                </button>
              )}

              <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg">
                {['ALL', 'ORDERED', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#D40000] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ORDERS TABLE (Fits nicely with compact rows) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 text-gray-700 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Items / Stock</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Status & Payment</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const totalItems = ord.items.reduce((acc, i) => acc + i.quantity, 0);
                    const hasCounterDiscount =
                      ord.extraDiscountAmount && ord.extraDiscountAmount > 0;

                    const outOfStockCount = ord.items.filter(
                      (it) => (it.crackerId ? outOfStockMap.get(it.crackerId) === true : false)
                    ).length;

                    const branchName =
                      ord.branch === 'BRANCH_2'
                        ? 'Ramraj Branch'
                        : ord.branch === 'BRANCH_1'
                        ? 'Arasan Branch'
                        : 'Unassigned';

                    const isCredit = ord.paymentType === 'CREDIT';

                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${
                          isCredit ? 'bg-amber-50/20' : ''
                        }`}
                        onClick={() => openEditItemsModal(ord)}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                          {new Date(ord.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-gray-900 leading-tight">{ord.customerName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">+91 {ord.customerPhone}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              ord.branch === 'BRANCH_2'
                                ? 'bg-purple-100 text-purple-800'
                                : ord.branch === 'BRANCH_1'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {branchName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="font-semibold text-gray-700">
                              {totalItems} pcs ({ord.items.length} items)
                            </span>
                            {outOfStockCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-red-100 text-red-700 font-black text-[9px] rounded border border-red-200">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                                {outOfStockCount} No Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-black text-[#D40000] text-xs font-rupee">
                            ₹{ord.total}
                          </span>
                          {hasCounterDiscount ? (
                            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 block font-bold mt-0.5">
                              -₹{ord.extraDiscountAmount}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-0.5 items-start">
                            {ord.status === 'DELIVERED' ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                  DELIVERED
                                </span>

                                {isCredit ? (
                                  <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                    CREDIT
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.2 rounded bg-gray-100 text-gray-700">
                                    SETTLED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenDeliveryModal(ord)}
                                disabled={updatingId === ord.id}
                                className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-black border border-amber-500 shadow-2xs active:scale-95 transition-all cursor-pointer"
                              >
                                <Clock className="w-3 h-3 text-amber-900" />
                                <span>Deliver & Settle</span>
                              </button>
                            )}

                            {/* Quick Settle button for Credit orders */}
                            {ord.status === 'DELIVERED' && isCredit && (
                              <button
                                type="button"
                                onClick={() => handleSettleCredit(ord.id, ord.orderNumber)}
                                disabled={updatingId === ord.id}
                                className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer active:scale-95 transition-all mt-0.5"
                              >
                                <Check className="w-2.5 h-2.5 text-white" />
                                <span>Settle Credit (₹{ord.total})</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditItemsModal(ord)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Inspect & Edit Order Items"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/api/invoice/${ord.orderNumber}`}
                              target="_blank"
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Download Invoice PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPACT MODAL: INSPECT & EDIT ORDER ITEMS (Out of Stock Top, Remove, Add) */}
        {/* ========================================================================= */}
        {editingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 border-2 border-[#D40000] shadow-2xl relative max-h-[90vh] flex flex-col text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b mb-2 shrink-0">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Order Invoice
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        editingOrder.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {editingOrder.status}
                    </span>
                    {editingOrder.branch && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                        {editingOrder.branch === 'BRANCH_2' ? 'Ramraj Branch' : 'Arasan Branch'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-950 font-mono">
                    #{editingOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-200 grid grid-cols-3 gap-1 text-[11px] shrink-0">
                <div>
                  <span className="text-gray-500 block text-[10px]">Customer</span>
                  <span className="font-bold text-gray-900 truncate block">{editingOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Phone</span>
                  <span className="font-bold text-gray-900 font-mono">+91 {editingOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Date</span>
                  <span className="font-medium text-gray-700">
                    {new Date(editingOrder.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items List Heading with Add Items button */}
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <span className="font-black text-gray-700 uppercase tracking-wider text-[11px]">
                  Items ({tempItems.length} items • {tempItems.reduce((a, b) => a + b.quantity, 0)} pcs)
                </span>

                <button
                  type="button"
                  onClick={() => setShowAddItemDropdown(!showAddItemDropdown)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold cursor-pointer transition-all"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>{showAddItemDropdown ? 'Close' : 'Add Items'}</span>
                </button>
              </div>

              {/* ADD ITEM DROPDOWN / SEARCH PANEL */}
              {showAddItemDropdown && (
                <div className="mb-2 p-2 bg-blue-50/60 rounded-lg border border-blue-200 shrink-0">
                  <div className="relative mb-1.5">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search crackers to add..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 bg-white border border-blue-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto divide-y divide-blue-100 bg-white rounded border border-blue-200">
                    {filteredAvailableCrackers.length > 0 ? (
                      filteredAvailableCrackers.map((c) => {
                        const isOut = outOfStockMap.get(c.id) === true;
                        return (
                          <div
                            key={c.id}
                            className="p-1.5 flex items-center justify-between hover:bg-blue-50 text-[11px]"
                          >
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900">{c.name}</span>
                                {isOut && (
                                  <span className="text-[8px] font-black bg-red-100 text-red-700 px-1 rounded">
                                    No Stock
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500">₹{c.price}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddCrackerToOrder(c)}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="p-2 text-center text-[10px] text-gray-400">No products found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ITEMS LIST (Sorted: Out-of-Stock strictly at TOP) */}
              <div className="overflow-y-auto flex-1 border border-gray-200 rounded-lg divide-y divide-gray-100 min-h-[120px] max-h-[300px]">
                {sortedTempItems.map(({ item, originalIndex, isOutOfStock }) => (
                  <div
                    key={`${item.crackerId}-${originalIndex}`}
                    className={`p-2 flex items-center justify-between text-xs transition-colors ${
                      isOutOfStock ? 'bg-red-50/80 border-l-4 border-l-red-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900 text-xs">{item.name}</span>
                        {isOutOfStock && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] rounded shadow-2xs animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5 text-white" />
                            NO STOCK
                          </span>
                        )}
                        {item.itemCode && (
                          <span className="text-[9px] text-gray-400 font-mono">[{item.itemCode}]</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-0.5">
                        <span>₹{item.price} each</span>
                        <span>•</span>
                        <span>Item Total: ₹{item.price * item.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateTempItemQty(originalIndex, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 cursor-pointer font-black"
                        >
                          -
                        </button>
                        <span className="px-1.5 py-0.5 font-bold text-gray-900 min-w-5 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateTempItemQty(originalIndex, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-gray-600 hover:bg-gray-100 cursor-pointer font-black"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTempItem(originalIndex)}
                        className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Remove from Cart / Order"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals Bar */}
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-baseline shrink-0">
                <span className="font-black uppercase text-gray-700 text-xs">Calculated Total:</span>
                <span className="text-xl font-black text-[#D40000] font-rupee">₹{tempSubtotal}</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/api/invoice/${editingOrder.orderNumber}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 text-gray-700 text-[11px] font-bold hover:bg-gray-100"
                  >
                    <FileText className="w-3 h-3 text-red-600" />
                    <span>PDF</span>
                  </a>

                  {editingOrder.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = editingOrder;
                        setEditingOrder(null);
                        handleOpenDeliveryModal(ord);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-black shadow-2xs cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Deliver Order</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveOrderItems}
                    disabled={isSavingItems}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-[#D40000] hover:bg-[#B00000] shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingItems ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMPACT MODAL: DELIVERY & SETTLEMENT (Branch 1/2 + Settled/Credit + Discount) */}
        {/* ========================================================================= */}
        {deliveryModalOrder && (
          <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 border-2 border-[#D40000] shadow-2xl relative max-h-[92vh] overflow-y-auto text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-red-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-gray-950 leading-tight">
                      Fulfill Order & Payment
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                      #{deliveryModalOrder.orderNumber} • {deliveryModalOrder.customerName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDeliveryModalOrder(null)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Amount Display */}
              <div className="my-2.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider">
                  Bill Total ({deliveryModalOrder.items.reduce((a, b) => a + b.quantity, 0)} pcs)
                </span>
                <span className="text-xl font-black text-[#D40000] font-rupee">
                  ₹{modalCurrentTotal}
                </span>
              </div>

              {/* BRANCH SELECTION (Branch 1 vs Branch 2) */}
              <div className="mb-3">
                <label className="block text-[11px] font-black text-gray-900 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  Delivered from which Branch?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBranch('BRANCH_1')}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedBranch === 'BRANCH_1'
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-blue-950">Arasan Branch</span>
                      {selectedBranch === 'BRANCH_1' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[9px] text-gray-500 block">Arasan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBranch('BRANCH_2')}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedBranch === 'BRANCH_2'
                        ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-purple-950">Ramraj Branch</span>
                      {selectedBranch === 'BRANCH_2' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <span className="text-[9px] text-gray-500 block">Ramraj</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT TYPE: SETTLED vs CREDIT */}
              <div className="mb-3">
                <label className="block text-[11px] font-black text-gray-900 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-600" />
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('SETTLED')}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedPaymentType === 'SETTLED'
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-950">SETTLED (Paid)</span>
                      {selectedPaymentType === 'SETTLED' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[9px] text-emerald-700 block">Cash/UPI Paid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('CREDIT')}
                    className={`p-2 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedPaymentType === 'CREDIT'
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-amber-950">CREDIT (Pending)</span>
                      {selectedPaymentType === 'CREDIT' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[9px] text-amber-700 block">Customer owes payment</span>
                  </button>
                </div>
              </div>

              {/* Counter Extra Discount Mode Selector */}
              <div className="space-y-2 mb-3">
                <label className="block text-[11px] font-black text-gray-900">
                  Extra Discount at counter?
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('none');
                      setDiscountValue('');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      discountType === 'none'
                        ? 'bg-[#D40000] text-white border-[#D40000]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    No Extra
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('flat');
                      setDiscountValue('');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      discountType === 'flat'
                        ? 'bg-[#D40000] text-white border-[#D40000]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Amount (₹)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('percentage');
                      setDiscountValue('');
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      discountType === 'percentage'
                        ? 'bg-[#D40000] text-white border-[#D40000]'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Percent (%)
                  </button>
                </div>

                {discountType === 'flat' && (
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={modalCurrentTotal}
                        placeholder="Discount in ₹"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        autoFocus
                        className="w-full pl-6 pr-2 py-1 bg-white border border-gray-300 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D40000]"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {[10, 20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDiscountValue(String(amt))}
                          className="px-1.5 py-0.2 bg-white text-gray-800 border border-gray-300 rounded text-[10px] font-bold"
                        >
                          ₹{amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleQuickRoundOff(0)}
                        className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold"
                      >
                        Round ₹0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoundOff(5)}
                        className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold"
                      >
                        Round ₹5
                      </button>
                    </div>
                  </div>
                )}

                {discountType === 'percentage' && (
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Percentage %"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        autoFocus
                        className="w-full pl-2 pr-6 py-1 bg-white border border-gray-300 rounded text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#D40000]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Final Revenue Box */}
                <div
                  className={`p-2.5 rounded-xl border ${
                    selectedPaymentType === 'CREDIT'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[10px] font-black uppercase block">
                        {selectedPaymentType === 'CREDIT' ? 'Credit Due' : 'Revenue Collected'}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {selectedBranch === 'BRANCH_2' ? 'Ramraj Branch' : 'Arasan Branch'}
                      </span>
                    </div>
                    <span
                      className={`text-xl font-black font-rupee leading-none ${
                        selectedPaymentType === 'CREDIT' ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      ₹{calculatedFinalRevenue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryModalOrder(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeliverySettlement}
                  disabled={updatingId === deliveryModalOrder.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1 ${
                    selectedPaymentType === 'CREDIT'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    Confirm ({selectedBranch === 'BRANCH_2' ? 'Ramraj' : 'Arasan'}) - ₹{calculatedFinalRevenue}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
