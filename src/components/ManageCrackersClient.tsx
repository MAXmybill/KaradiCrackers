'use client';

import { useState, useMemo } from 'react';
import { Cracker } from '@/types';
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
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ManageCrackersClientProps {
  initialCrackers: Cracker[];
}

export default function ManageCrackersClient({ initialCrackers }: ManageCrackersClientProps) {
  const [crackers, setCrackers] = useState<Cracker[]>(initialCrackers);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCracker, setEditingCracker] = useState<Cracker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cracker | null>(null);

  // Quick inline edits state: crackerId -> { price }
  const [inlinePriceEdits, setInlinePriceEdits] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Form state for Add/Edit Modal
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
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

  // Inline Price change handler
  const handlePriceChange = (id: string, val: number) => {
    setInlinePriceEdits((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSavePrice = async (cracker: Cracker) => {
    const newPrice = inlinePriceEdits[cracker.id];
    if (newPrice === undefined) return;

    setSavingId(cracker.id);
    try {
      const res = await fetch(`/api/admin/crackers/${cracker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(newPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error);
      }

      setCrackers((prev) =>
        prev.map((c) => (c.id === cracker.id ? { ...c, price: Number(newPrice) } : c))
      );

      // Clean inline edit record
      setInlinePriceEdits((prev) => {
        const copy = { ...prev };
        delete copy[cracker.id];
        return copy;
      });

      toast.success(`Updated price for ${cracker.name}`);
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
    setFormCategory(cracker.category || 'Sparklers');
    setIsCustomCategory(false);
    setFormIsAvailable(cracker.isAvailable);
    setIsAddModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingCracker(null);
    setFormName('');
    setFormPrice('');
    setFormCategory(existingCategories[0] || 'Sparklers');
    setIsCustomCategory(false);
    setFormIsAvailable(true);
    setIsAddModalOpen(false);
  };

  // Submit Add / Edit Modal
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const chosenCategory = formCategory.trim() || 'General';

    const payload = {
      name: formName.trim(),
      price: parseFloat(formPrice),
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950">
              MANAGE CRACKERS CATALOG
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Instant ON/OFF visibility toggle and price adjustment. All active items offer unlimited bookings.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#D40000] hover:bg-[#B00000] text-white font-extrabold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95 border-2 border-[#FFC400] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cracker</span>
          </button>
        </div>

        {/* Filter bar with Category tabs */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crackers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
            />
          </div>

          {/* Category filter dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-gray-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D40000]"
            >
              <option value="ALL">All Categories ({crackers.length})</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({crackers.filter((c) => c.category === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crackers Table (Strictly NO stock column, pure Price & Visibility ON/OFF) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-100/70 text-gray-600 font-bold uppercase text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Cracker Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (₹)</th>
                  <th className="py-3 px-4 text-center">Storefront Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCrackers.length > 0 ? (
                  filteredCrackers.map((cracker) => {
                    const isPriceEdited = inlinePriceEdits[cracker.id] !== undefined;
                    const displayPrice = isPriceEdited
                      ? inlinePriceEdits[cracker.id]
                      : cracker.price;

                    return (
                      <tr
                        key={cracker.id}
                        className={`hover:bg-amber-50/30 transition-colors ${
                          !cracker.isAvailable ? 'bg-gray-50/70 opacity-80' : ''
                        }`}
                      >
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#D40000] border border-amber-200 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-[#D40000]" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">
                                {cracker.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {cracker.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <Tag className="w-3 h-3 text-[#D40000]" />
                            <span>{cracker.category || 'General'}</span>
                          </span>
                        </td>

                        {/* Price Quick Edit */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-semibold">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={displayPrice}
                              onChange={(e) =>
                                handlePriceChange(cracker.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-24 px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#D40000]"
                            />
                            {isPriceEdited && (
                              <button
                                onClick={() => handleSavePrice(cracker)}
                                disabled={savingId === cracker.id}
                                className="p-1 bg-[#FFC400] text-black rounded-lg hover:bg-[#FFE082] shadow-xs cursor-pointer"
                                title="Save price"
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

                        {/* Availability Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(cracker)}
                            className="inline-flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
                            title="Click to toggle store visibility"
                          >
                            {cracker.isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-300 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                ON (Visible in Store)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3.5 py-1 rounded-full border border-gray-300">
                                <span className="w-2 h-2 rounded-full bg-gray-400" />
                                OFF (Hidden from Store)
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(cracker)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Cracker"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteTarget(cracker)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Cracker"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                      No crackers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal with Category Auto-Suggestion & Option to Add New */}
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
                    placeholder="e.g. 15 cm Electric Sparklers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="120"
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
                </div>

                {/* Category Selection with Auto-Suggestion & Add New Option */}
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
                          setFormCategory(existingCategories[0] || 'Sparklers');
                        }
                      }}
                      className="text-xs font-bold text-[#D40000] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isCustomCategory ? '← Choose Existing Category' : '+ Add New Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="Type new category name (e.g. Ground Spinners, Giant Bombs)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                        autoFocus
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        This category will be created and saved into the catalog automatically.
                      </p>
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

                  {/* Quick-select pill suggestions from existing categories */}
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
