'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Cracker } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, AlertCircle, ChevronDown, Check, X } from 'lucide-react';

interface CrackersCatalogClientProps {
  initialCrackers: Cracker[];
}

export default function CrackersCatalogClient({ initialCrackers }: CrackersCatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    initialCrackers.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [initialCrackers]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectAll = () => {
    setSelectedCategories([]);
  };

  const filteredCrackers = useMemo(() => {
    return initialCrackers.filter((item) => {
      if (!item.isAvailable) return false;

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategories.length === 0 ||
        (item.category && selectedCategories.includes(item.category));

      return matchesSearch && matchesCategory;
    });
  }, [initialCrackers, searchTerm, selectedCategories]);

  return (
    <div className="space-y-4 sm:space-y-8 pt-2">
      {/* Sticky Search & Filter Bar: Flush below the sticky header without covering product cards */}
      <div className="sticky top-[94px] sm:top-[112px] z-40 bg-white/95 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border-2 border-[#FFC400] shadow-md transition-all">
        <div className="flex items-center gap-2 sm:gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crackers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D40000] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Filter Checkbox Dropdown */}
          <div className="relative w-40 sm:w-60 shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between bg-amber-50 border border-amber-300 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 hover:bg-amber-100/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-1.5 truncate pr-1">
                <Filter className="w-3.5 h-3.5 text-[#D40000] shrink-0" />
                <span className="text-[11px] sm:text-sm font-bold text-gray-900 truncate">
                  {selectedCategories.length === 0
                    ? 'All Categories'
                    : selectedCategories.length === 1
                    ? selectedCategories[0]
                    : `${selectedCategories.length} Categories`}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-amber-700 shrink-0 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu with Checkboxes */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border-2 border-[#FFC400] rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Select Categories
                  </span>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-[11px] text-[#D40000] font-bold hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {/* "All Categories" option */}
                  <label
                    onClick={selectAll}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer text-xs font-semibold text-gray-800 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedCategories.length === 0
                          ? 'bg-[#D40000] border-[#D40000] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedCategories.length === 0 && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>All Categories</span>
                  </label>

                  {/* Individual Categories Checkboxes */}
                  {availableCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 cursor-pointer text-xs font-semibold text-gray-800 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#D40000] border-[#D40000] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Varieties Count on Desktop */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-2 rounded-xl">
              {filteredCrackers.length} varieties ready
            </span>
          </div>
        </div>

        {/* Selected categories tags when filter applied */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 mr-1">Filtered by:</span>
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 bg-red-100 text-[#D40000] text-[11px] font-bold px-2 py-0.5 rounded-md"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-bold text-gray-500 hover:text-[#D40000] underline ml-1 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {filteredCrackers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 pt-1">
          {filteredCrackers.map((cracker) => (
            <ProductCard key={cracker.id} cracker={cracker} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-gray-200 my-8">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#D40000] flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Crackers Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5">
            We could not find any crackers matching your filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
            }}
            className="bg-[#FFC400] hover:bg-[#FFE082] text-black font-extrabold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
