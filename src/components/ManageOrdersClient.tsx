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
        const branchLabel = branch === 'BRANCH_2' ? 'Branch 2' : 'Branch 1';
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
    // Clone items
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
      toast.success(`Order #${data.order.orderNumber} items updated successfully! New Total: ₹${data.order.total}`);
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
      if (ord.status === 'DELIVERED') {
        const isCredit = ord.paymentType === 'CREDIT';
        const isB2 = ord.branch === 'BRANCH_2';

        if (isB2) {
          if (isCredit) b2Credit += ord.total;
          else b2Settled += ord.total;
        } else {
          // Branch 1 is default
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

  // Filter orders by search, status, date, branch, and paymentType
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

      // Branch filter
      let matchesBranch = true;
      if (branchTab !== 'ALL') {
        if (branchTab === 'BRANCH_2') {
          matchesBranch = o.branch === 'BRANCH_2';
        } else {
          matchesBranch = o.branch === 'BRANCH_1' || !o.branch; // default branch 1
        }
      }

      // Payment filter
      let matchesPayment = true;
      if (paymentTab !== 'ALL') {
        if (paymentTab === 'CREDIT') {
          matchesPayment = o.paymentType === 'CREDIT';
        } else {
          // Settled is default when delivered, or explicitly SETTLED
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
    if (!itemSearchQuery.trim()) return allCrackers.slice(0, 30);
    const q = itemSearchQuery.toLowerCase();
    return allCrackers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.itemCode && c.itemCode.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
    );
  }, [allCrackers, itemSearchQuery]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and CSV Export Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-950 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#D40000]" />
              BRANCH ORDERS & INVOICES
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Review invoices, inspect out-of-stock items, manage Branch 1 & Branch 2 deliveries, and track Settled vs Credit payments.
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

        {/* FINANCIAL SUMMARY CARDS: BRANCH 1, BRANCH 2, ALL BRANCHES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* ALL BRANCHES */}
          <div
            onClick={() => setBranchTab('ALL')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              branchTab === 'ALL'
                ? 'bg-red-50/50 border-[#D40000] shadow-md ring-2 ring-red-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#D40000]" />
                All Branches Combined
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                Total ₹{financialSummary.all.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100">
              <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-lg font-black text-emerald-700 font-rupee">₹{financialSummary.all.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-lg font-black text-amber-700 font-rupee">₹{financialSummary.all.credit}</span>
              </div>
            </div>
          </div>

          {/* BRANCH 1 */}
          <div
            onClick={() => setBranchTab('BRANCH_1')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              branchTab === 'BRANCH_1'
                ? 'bg-blue-50/50 border-blue-600 shadow-md ring-2 ring-blue-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Branch 1
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 rounded-full text-blue-800">
                Total ₹{financialSummary.b1.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100">
              <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-lg font-black text-emerald-700 font-rupee">₹{financialSummary.b1.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-lg font-black text-amber-700 font-rupee">₹{financialSummary.b1.credit}</span>
              </div>
            </div>
          </div>

          {/* BRANCH 2 */}
          <div
            onClick={() => setBranchTab('BRANCH_2')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              branchTab === 'BRANCH_2'
                ? 'bg-purple-50/50 border-purple-600 shadow-md ring-2 ring-purple-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                Branch 2
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 rounded-full text-purple-800">
                Total ₹{financialSummary.b2.total}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-100">
              <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Settled (Paid)</span>
                <span className="text-lg font-black text-emerald-700 font-rupee">₹{financialSummary.b2.settled}</span>
              </div>
              <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Credit (Pending)</span>
                <span className="text-lg font-black text-amber-700 font-rupee">₹{financialSummary.b2.credit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS & FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-xs flex flex-col gap-4">
          {/* Top row: Branch Tab & Payment Type Tab */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            {/* Branch Selector Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <span className="text-[11px] font-black uppercase text-gray-400 px-2">Branch:</span>
              {[
                { id: 'ALL', label: 'All Branches' },
                { id: 'BRANCH_1', label: 'Branch 1' },
                { id: 'BRANCH_2', label: 'Branch 2' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBranchTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    branchTab === tab.id
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Payment Type Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <span className="text-[11px] font-black uppercase text-gray-400 px-2">Payment:</span>
              {[
                { id: 'ALL', label: 'All Payments' },
                { id: 'SETTLED', label: 'Settled (Paid)' },
                { id: 'CREDIT', label: 'Credit (Unpaid)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentTab === tab.id
                      ? tab.id === 'CREDIT'
                        ? 'bg-amber-500 text-black shadow-xs font-black'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Search, Date & Status filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Items / Stock</th>
                  <th className="py-3 px-4">Bill Amount</th>
                  <th className="py-3 px-4">Payment & Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => {
                    const totalItems = ord.items.reduce((acc, i) => acc + i.quantity, 0);
                    const hasCounterDiscount =
                      ord.extraDiscountAmount && ord.extraDiscountAmount > 0;

                    // Check if order contains any out of stock items
                    const outOfStockCount = ord.items.filter(
                      (it) => it.crackerId ? outOfStockMap.get(it.crackerId) === true : false
                    ).length;

                    const branchName =
                      ord.branch === 'BRANCH_2'
                        ? 'Branch 2'
                        : ord.branch === 'BRANCH_1'
                        ? 'Branch 1'
                        : '-';

                    const isCredit = ord.paymentType === 'CREDIT';

                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-amber-50/30 transition-colors cursor-pointer ${
                          isCredit ? 'bg-amber-50/20' : ''
                        }`}
                        onClick={() => openEditItemsModal(ord)}
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
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
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
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-700">
                              {totalItems} pcs ({ord.items.length} items)
                            </span>
                            {outOfStockCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 font-black text-[10px] rounded-md border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                {outOfStockCount} No Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-[#D40000] text-sm font-rupee">
                            ₹{ord.total}
                          </span>
                          {hasCounterDiscount ? (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-0.5 font-bold">
                              Extra -₹{ord.extraDiscountAmount}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1 items-start">
                            {ord.status === 'DELIVERED' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  DELIVERED
                                </span>

                                {isCredit ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                                    CREDIT
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                    SETTLED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenDeliveryModal(ord)}
                                disabled={updatingId === ord.id}
                                className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black border border-amber-500 shadow-xs active:scale-95 transition-all cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-900" />
                                <span>Deliver & Settle</span>
                              </button>
                            )}

                            {/* If Credit is pending, provide quick Settle button */}
                            {ord.status === 'DELIVERED' && isCredit && (
                              <button
                                type="button"
                                onClick={() => handleSettleCredit(ord.id, ord.orderNumber)}
                                disabled={updatingId === ord.id}
                                className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95 transition-all mt-0.5"
                              >
                                <Check className="w-3 h-3 text-white" />
                                <span>Settle Credit (₹{ord.total})</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect / Edit items button */}
                            <button
                              onClick={() => openEditItemsModal(ord)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Inspect & Edit Order Items"
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
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INSPECT & EDIT ORDER ITEMS MODAL (No Stock warning at top + Remove + Add) */}
        {/* ========================================================================= */}
        {editingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 border-2 border-[#D40000] shadow-2xl relative max-h-[92vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b mb-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Order Invoice Inspection
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        editingOrder.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {editingOrder.status}
                    </span>
                    {editingOrder.branch && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {editingOrder.branch === 'BRANCH_2' ? 'Branch 2' : 'Branch 1'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-gray-950 font-mono">
                    #{editingOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs shrink-0">
                <div>
                  <span className="text-gray-500 block">Customer</span>
                  <span className="font-bold text-gray-900">{editingOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="font-bold text-gray-900 font-mono">+91 {editingOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date</span>
                  <span className="font-medium text-gray-700">
                    {new Date(editingOrder.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items List Heading with Add Items button */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                  <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
                    Items In Order ({tempItems.length} items • {tempItems.reduce((a, b) => a + b.quantity, 0)} pcs)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Out-of-stock items are surfaced at the top. Remove or add items as needed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddItemDropdown(!showAddItemDropdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 text-xs font-bold cursor-pointer transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{showAddItemDropdown ? 'Close Add Form' : 'Add More Items'}</span>
                </button>
              </div>

              {/* ADD ITEM DROPDOWN / SEARCH PANEL */}
              {showAddItemDropdown && (
                <div className="mb-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-blue-950">Add Product to Order:</span>
                    <span className="text-[10px] text-blue-600">Showing available products</span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type cracker name or item code..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-blue-100 bg-white rounded-lg border border-blue-200">
                    {filteredAvailableCrackers.length > 0 ? (
                      filteredAvailableCrackers.map((c) => {
                        const isOut = outOfStockMap.get(c.id) === true;
                        return (
                          <div
                            key={c.id}
                            className="p-2 flex items-center justify-between hover:bg-blue-50/50 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900">{c.name}</span>
                                {isOut && (
                                  <span className="text-[9px] font-black bg-red-100 text-red-700 px-1 py-0.2 rounded">
                                    No Stock
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500">
                                {c.category} • ₹{c.price}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddCrackerToOrder(c)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-xs cursor-pointer shadow-xs"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="p-3 text-center text-xs text-gray-400">No matching products found.</p>
                    )}
                  </div>
                </div>
              )}

              {/* LIST OF ITEMS WITH OUT OF STOCK HIGHLIGHTED AT TOP */}
              <div className="overflow-y-auto flex-1 border border-gray-200 rounded-xl divide-y divide-gray-100 min-h-[140px]">
                {sortedTempItems.map(({ item, originalIndex, isOutOfStock }) => (
                  <div
                    key={`${item.crackerId}-${originalIndex}`}
                    className={`p-3 flex items-center justify-between text-xs transition-colors ${
                      isOutOfStock ? 'bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                        {isOutOfStock && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-md shadow-xs animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            NO STOCK / OUT OF STOCK
                          </span>
                        )}
                        {item.itemCode && (
                          <span className="text-[10px] text-gray-400 font-mono">[{item.itemCode}]</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-[11px] mt-0.5">
                        <span>₹{item.price} each</span>
                        <span>•</span>
                        <span>Item Total: ₹{item.price * item.quantity}</span>
                      </div>
                    </div>

                    {/* Quantity Adjustment & Remove */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateTempItemQty(originalIndex, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer font-black"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 font-bold text-xs text-gray-900 min-w-7 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateTempItemQty(originalIndex, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer font-black"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove from Order button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTempItem(originalIndex)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-colors cursor-pointer"
                        title="Remove from Cart / Order"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recalculated Order Totals */}
              <div className="mt-3 pt-3 border-t border-gray-200 shrink-0">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-500">Items Subtotal:</span>
                  <span className="font-bold text-gray-900 font-rupee">₹{tempSubtotal}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                  <span className="text-xs font-black uppercase text-gray-700">Calculated Order Total:</span>
                  <span className="text-2xl font-black text-[#D40000] font-rupee">₹{tempSubtotal}</span>
                </div>
              </div>

              {/* Action Buttons for Items Modal */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/invoice/${editingOrder.orderNumber}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>View PDF</span>
                  </a>

                  {editingOrder.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => {
                        const ord = editingOrder;
                        setEditingOrder(null);
                        handleOpenDeliveryModal(ord);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black text-xs font-black shadow-xs cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Proceed to Deliver</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveOrderItems}
                    disabled={isSavingItems}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-[#D40000] hover:bg-[#B00000] shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingItems ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Order Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELIVERY & COUNTER SETTLEMENT MODAL (Branch 1/2 + Settled/Credit + Discount) */}
        {/* ========================================================================= */}
        {deliveryModalOrder && (
          <div className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 border-2 border-[#D40000] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-950 leading-tight">
                      Delivery & Payment Settlement
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

              {/* BRANCH SELECTION (Branch 1 vs Branch 2) */}
              <div className="mb-4">
                <label className="block text-xs font-black text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Delivered from which Branch?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedBranch('BRANCH_1')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      selectedBranch === 'BRANCH_1'
                        ? 'bg-blue-50 border-blue-600 shadow-xs ring-1 ring-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-blue-950 block">Branch 1</span>
                      {selectedBranch === 'BRANCH_1' && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Main Outlet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBranch('BRANCH_2')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      selectedBranch === 'BRANCH_2'
                        ? 'bg-purple-50 border-purple-600 shadow-xs ring-1 ring-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-purple-950 block">Branch 2</span>
                      {selectedBranch === 'BRANCH_2' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Extension Branch</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT TYPE: SETTLED vs CREDIT */}
              <div className="mb-4">
                <label className="block text-xs font-black text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Payment Status: Settled or Credit?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('SETTLED')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      selectedPaymentType === 'SETTLED'
                        ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-950 block">SETTLED (Paid)</span>
                      {selectedPaymentType === 'SETTLED' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Paid on the spot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentType('CREDIT')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      selectedPaymentType === 'CREDIT'
                        ? 'bg-amber-50 border-amber-500 shadow-xs ring-1 ring-amber-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-amber-950 block">CREDIT (Unpaid)</span>
                      {selectedPaymentType === 'CREDIT' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="text-[10px] text-amber-700 block mt-0.5">Pending payment</span>
                  </button>
                </div>
              </div>

              {/* Counter Extra Discount Mode Selector */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-black text-gray-900 mb-1.5">
                    Was any extra discount applied at counter?
                  </label>

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
                      <span className="block text-[10px] font-normal opacity-85">Round-off</span>
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
                      <span className="block text-[10px] font-normal opacity-85">Special %</span>
                    </button>
                  </div>
                </div>

                {/* Flat input */}
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

                {/* Percentage input */}
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
                  </div>
                )}

                {/* Summary Card */}
                <div
                  className={`p-3.5 rounded-2xl border-2 ${
                    selectedPaymentType === 'CREDIT'
                      ? 'bg-amber-50/80 border-amber-300'
                      : 'bg-emerald-50/80 border-emerald-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Initial Order Bill:</span>
                    <span className="font-bold font-rupee">₹{modalCurrentTotal}</span>
                  </div>

                  {calculatedDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs text-red-700 font-bold mb-1.5">
                      <span>Extra Discount:</span>
                      <span className="font-rupee">-₹{calculatedDiscountAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200/80 flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-black uppercase block">
                        {selectedPaymentType === 'CREDIT' ? 'Credit Balance Due' : 'Collected Revenue'}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {selectedBranch === 'BRANCH_2' ? 'Branch 2' : 'Branch 1'} •{' '}
                        {selectedPaymentType === 'CREDIT' ? 'Marked as Credit' : 'Marked as Paid'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-2xl sm:text-3xl font-black font-rupee leading-none ${
                          selectedPaymentType === 'CREDIT' ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
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
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 ${
                    selectedPaymentType === 'CREDIT'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Confirm Delivery ({selectedBranch === 'BRANCH_2' ? 'Branch 2' : 'Branch 1'}) - ₹
                    {calculatedFinalRevenue}
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
