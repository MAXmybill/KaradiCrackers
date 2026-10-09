'use client';

import { useState, useMemo } from 'react';
import { Cracker, StoreSettings } from '@/types';
import AdminNav from '@/components/AdminNav';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Save,
  Tag,
  Percent,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ManageCrackersClientProps {
  initialCrackers: Cracker[];
  initialSettings?: StoreSettings;
}

export default function ManageCrackersClient({
  initialCrackers,
  initialSettings,
}: ManageCrackersClientProps) {
  const [crackers, setCrackers] = useState<Cracker[]>(initialCrackers);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCracker, setEditingCracker] = useState<Cracker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cracker | null>(null);

  // Bulk price percentage adjustment state
  const [bulkPercent, setBulkPercent] = useState<string>('10');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Store Settings (Pricing Visibility & Discount Percentage)
  const [settings, setSettings] = useState<StoreSettings>(
    initialSettings || {
      showPricing: true,
      discountPercentage: 20,
    }
  );
  const [savingSettings, setSavingSettings] = useState(false);

  // Quick inline edits state: crackerId -> { price, originalPrice }
  const [inlinePriceEdits, setInlinePriceEdits] = useState<{
    [id: string]: { price?: number; originalPrice?: number };
  }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Form state for Add/Edit Modal
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(''); // Selling price
  const [formOriginalPrice, setFormOriginalPrice] = useState(''); // Actual / MRP strikethrough price
  const [formCategory, setFormCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Dynamically derive unique existing categories from current crackers
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    crackers.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [crackers]);

  // Filtered list
  const filteredCrackers = crackers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' || (c.category && c.category === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Toggle showPricing in admin
  const handleToggleShowPricing = async () => {
    const nextVal = !settings.showPricing;
    setSettings((prev) => ({ ...prev, showPricing: nextVal }));
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showPricing: nextVal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      toast.success(
        nextVal
          ? 'Customer unit pricing is now visible (ON)'
          : 'Customer unit pricing is now HIDDEN (OFF)'
      );
    } catch (err: any) {
      toast.error('Failed to update pricing visibility');
      setSettings((prev) => ({ ...prev, showPricing: !nextVal }));
    } finally {
      setSavingSettings(false);
    }
  };

  // Update discount percentage in admin
  const handleDiscountChange = async (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setSettings((prev) => ({ ...prev, discountPercentage: clamped }));
  };

  const handleSaveDiscount = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage: settings.discountPercentage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      toast.success(`Discount updated to ${settings.discountPercentage}% OFF`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update discount');
    } finally {
      setSavingSettings(false);
    }
  };

  // Bulk Price Adjust (Increase or Decrease by percentage across ALL products)
  const handleBulkPriceAdjust = async (action: 'increase' | 'decrease') => {
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct <= 0) {
      toast.error('Please enter a valid percentage greater than 0');
      return;
    }

    const actionText = action === 'increase' ? 'increase' : 'decrease';
    const confirmMsg = `Are you sure you want to ${actionText.toUpperCase()} prices of ALL ${crackers.length} products by ${pct}%?`;
    if (!window.confirm(confirmMsg)) return;

    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/crackers/bulk-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: pct, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      if (data.crackers && Array.isArray(data.crackers)) {
        setCrackers(data.crackers);
      }
      toast.success(data.message || `All product prices ${actionText}d by ${pct}%!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to adjust prices');
    } finally {
      setBulkLoading(false);
    }
  };

  // Quick Toggle Availability
  const handleToggleAvailability = async (cracker: Cracker) => {
    const newStatus = !cracker.isAvailable;
    // Optimistic UI update
    setCrackers((prev) =>
      prev.map((c) => (c.id === cracker.id ? { ...c, isAvailable: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/admin/crackers/${cracker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }
      toast.success(
        `${cracker.name} is now ${newStatus ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}`
      );
    } catch (err: any) {
      toast.error('Failed to update status');
      // Rollback
      setCrackers((prev) =>
        prev.map((c) => (c.id === cracker.id ? { ...c, isAvailable: cracker.isAvailable } : c))
      );
    }
  };

  // Inline editing handler (price, originalPrice)
  const handleInlineChange = (
    id: string,
    field: 'price' | 'originalPrice',
    val: any
  ) => {
    setInlinePriceEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: val,
      },
    }));
  };

  const handleSaveInlinePrices = async (cracker: Cracker) => {
    const edit = inlinePriceEdits[cracker.id];
    if (!edit) return;

    setSavingId(cracker.id);
    const updates: any = {};
    if (edit.price !== undefined) updates.price = Number(edit.price);
    if (edit.originalPrice !== undefined) updates.originalPrice = Number(edit.originalPrice);

    try {
      const res = await fetch(`/api/admin/crackers/${cracker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }

      setCrackers((prev) =>
        prev.map((c) => (c.id === cracker.id ? { ...c, ...updates } : c))
      );

      // Clean inline edit record
      setInlinePriceEdits((prev) => {
        const copy = { ...prev };
        delete copy[cracker.id];
        return copy;
      });

      toast.success(`Updated ${cracker.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSavingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (cracker: Cracker) => {
    setEditingCracker(cracker);
    setFormName(cracker.name);
    setFormPrice(String(cracker.price));
    setFormOriginalPrice(cracker.originalPrice ? String(cracker.originalPrice) : '');
    setFormCategory(cracker.category || 'SPARKLERS');
    setIsCustomCategory(false);
    setFormIsAvailable(cracker.isAvailable);
    setIsAddModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingCracker(null);
    setFormName('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormCategory(existingCategories[0] || 'SPARKLERS');
    setIsCustomCategory(false);
    setFormIsAvailable(true);
    setIsAddModalOpen(false);
  };

  // Submit Add / Edit Modal
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const chosenCategory = formCategory.trim() || 'GENERAL';

    const payload: any = {
      name: formName.trim(),
      price: parseFloat(formPrice),
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
      quantity: 999999, // unlimited stock
      category: chosenCategory,
      isAvailable: formIsAvailable,
    };

    try {
      if (editingCracker) {
        // Edit existing
        const res = await fetch(`/api/admin/crackers/${editingCracker.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);

        setCrackers((prev) =>
          prev.map((c) => (c.id === editingCracker.id ? data.cracker : c))
        );
        toast.success(`Updated ${payload.name}`);
      } else {
        // Create new
        const res = await fetch('/api/admin/crackers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);

        setCrackers((prev) => [data.cracker, ...prev]);
        toast.success(`Added ${payload.name} to catalog!`);
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/crackers/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setCrackers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete cracker');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">
              MANAGE CRACKERS CATALOG & PRICING
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Control selling prices, actual strike prices, store pricing visibility, and percentage discount.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#D40000] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-[#B00000] transition-all shadow-md active:scale-95 cursor-pointer border border-[#FFC400]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cracker</span>
          </button>
        </div>

        {/* Global Store Settings Bar: Red & Festive Gold Styling */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Pricing Visibility Toggle */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {settings.showPricing ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-extrabold text-sm text-gray-900">
                  Storefront Pricing Visibility
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {settings.showPricing
                  ? 'ON: Customers see item unit rate & strikethrough actual price'
                  : 'OFF: Unit prices are hidden from customers, but bottom total/discount is visible'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleShowPricing}
              disabled={savingSettings}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.showPricing ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.showPricing ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Discount Percentage Setter */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#D40000]" />
                <span className="font-extrabold text-sm text-gray-900">
                  Bill Discount Percentage
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Set discount (e.g. 20%). Displays in bill as: Total - Discount = Final Net Total.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.discountPercentage}
                  onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                  className="w-20 pl-3 pr-6 py-1.5 rounded-xl border border-amber-300 bg-white text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D40000] text-center"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  %
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveDiscount}
                disabled={savingSettings}
                className="bg-[#D40000] text-white px-3 py-1.5 rounded-xl text-xs font-extrabold hover:bg-[#B00000] transition-colors shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Price Modifier (Increase or Decrease ALL Product Prices) */}
        <div className="bg-gradient-to-r from-amber-50 via-red-50/60 to-white rounded-2xl border-2 border-[#FFC400] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D40000] text-[#FFC400] flex items-center justify-center font-black text-xs shadow-xs">
                %
              </div>
              <h2 className="text-sm sm:text-base font-black text-gray-950 uppercase tracking-tight">
                Bulk Price Adjustment (All {crackers.length} Products)
              </h2>
            </div>
            <p className="text-xs text-gray-600 max-w-xl">
              Enter a percentage (e.g. <span className="font-bold text-gray-900">10%</span>) and click <span className="font-bold text-emerald-700">Increase</span> or <span className="font-bold text-red-600">Decrease</span> to automatically update the price of every cracker in the catalog simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="relative">
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.5"
                placeholder="10"
                value={bulkPercent}
                onChange={(e) => setBulkPercent(e.target.value)}
                disabled={bulkLoading}
                className="w-24 pl-3 pr-7 py-2 rounded-xl border-2 border-amber-300 bg-white text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D40000] text-center shadow-xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                %
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleBulkPriceAdjust('increase')}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {bulkLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>Increase Prices (+{bulkPercent}%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkPriceAdjust('decrease')}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {bulkLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>Decrease Prices (-{bulkPercent}%)</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#D40000]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#D40000]"
            >
              <option value="ALL">All Categories ({crackers.length})</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crackers Table: Clean, no item code, image, or content column */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-extrabold uppercase border-b">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Cracker Name</th>
                  <th className="py-3 px-2 sm:px-4">Category</th>
                  <th className="py-3 px-2 sm:px-4">Selling Price (₹)</th>
                  <th className="py-3 px-2 sm:px-4">Actual Price (Strike ₹)</th>
                  <th className="py-3 px-2 sm:px-4 text-center">Store Visibility</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredCrackers.length > 0 ? (
                  filteredCrackers.map((cracker) => {
                    const pendingEdit = inlinePriceEdits[cracker.id];
                    const currentSelling =
                      pendingEdit?.price !== undefined ? pendingEdit.price : cracker.price;
                    const currentOriginal =
                      pendingEdit?.originalPrice !== undefined
                        ? pendingEdit.originalPrice
                        : cracker.originalPrice || '';
                    const isEdited =
                      pendingEdit?.price !== undefined ||
                      pendingEdit?.originalPrice !== undefined;

                    return (
                      <tr key={cracker.id} className="hover:bg-amber-50/20 transition-colors">
                        {/* Name */}
                        <td className="py-3 px-3 sm:px-4">
                          <p className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            {cracker.name}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                          <span className="bg-amber-50 text-amber-900 font-extrabold px-2 py-0.5 rounded-md border border-amber-200 text-[10px] sm:text-[11px] inline-block">
                            {cracker.category || 'General'}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <span className="text-gray-500 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={currentSelling}
                              onChange={(e) =>
                                handleInlineChange(
                                  cracker.id,
                                  'price',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 sm:w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-black text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#D40000]"
                            />
                          </div>
                        </td>

                        {/* Actual Strikethrough Price */}
                        <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <span className="text-gray-400 font-bold line-through text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="MRP"
                              value={currentOriginal}
                              onChange={(e) =>
                                handleInlineChange(
                                  cracker.id,
                                  'originalPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 sm:w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 focus:bg-white focus:ring-1 focus:ring-[#D40000]"
                            />
                            {isEdited && (
                              <button
                                onClick={() => handleSaveInlinePrices(cracker)}
                                disabled={savingId === cracker.id}
                                className="p-1 bg-[#FFC400] text-black rounded-lg hover:bg-[#FFE082] shadow-xs cursor-pointer ml-1"
                                title="Save price changes"
                              >
                                {savingId === cracker.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Store Visibility */}
                        <td className="py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(cracker)}
                            className="inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-transform hover:scale-105"
                            title="Click to toggle store visibility"
                          >
                            {cracker.isAvailable ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black px-2.5 sm:px-3.5 py-1 rounded-full border border-emerald-300 shadow-xs">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600 animate-pulse" />
                                ON
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1 rounded-full border border-gray-300">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400" />
                                OFF
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => openEditModal(cracker)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Cracker"
                            >
                              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteTarget(cracker)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Cracker"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                      No crackers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#D40000] shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b mb-5">
                <h3 className="text-xl font-extrabold text-gray-900">
                  {editingCracker ? 'Edit Cracker' : 'Add New Cracker'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cracker Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. 10CM ELECTRIC SPARKLERS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Storefront Visibility
                  </label>
                  <select
                    value={formIsAvailable ? 'true' : 'false'}
                    onChange={(e) => setFormIsAvailable(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  >
                    <option value="true">ON (Visible in Store)</option>
                    <option value="false">OFF (Hidden from Store)</option>
                  </select>
                </div>

                {/* Selling price & Actual Strikethrough Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="14"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] font-bold"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">Amount customer pays</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Actual / MRP (₹ Strike)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="60"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">Shown struck through</p>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900 uppercase">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) {
                          setFormCategory('');
                        } else {
                          setFormCategory(existingCategories[0] || 'SPARKLERS');
                        }
                      }}
                      className="text-xs font-bold text-[#D40000] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isCustomCategory ? '← Choose Existing' : '+ Add New Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value.toUpperCase())}
                        placeholder="e.g. SPECIAL COLOUR SPARKLERS"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                      >
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!isCustomCategory && existingCategories.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Quick pick:</span>
                      {existingCategories.slice(0, 6).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormCategory(cat)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            formCategory === cat
                              ? 'bg-[#D40000] text-white'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#D40000] text-white font-extrabold text-sm hover:bg-[#B00000] shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingCracker ? 'Save Changes' : 'Create Cracker'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-red-500 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Delete Cracker?</h4>
              <p className="text-xs text-gray-600 mb-6">
                Are you sure you want to permanently remove <strong>{deleteTarget.name}</strong> from your catalog?
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
