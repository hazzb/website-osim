import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../Breadcrumbs.jsx";
import {
  FiFilter,
  FiSearch,
  FiX,
  FiChevronDown,
  FiMoreVertical,
  FiArrowLeft,
} from "react-icons/fi";

const PageHeader = ({
  title,
  subtitle,
  actions,
  primaryAction,
  searchBar,
  filters,
  genderFilter,
  extraActions,
  onBack,
  breadcrumbText,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const actionMenuRef = useRef(null);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside for Action Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else if (typeof onBack === "string") window.location.href = onBack;
  };

  return (
    <div
      className={`sticky top-[56px] z-[90] bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-200/60 ${
        isScrolled ? "shadow-md py-2" : "py-0"
      }`}
    >
      {/* BREADCRUMBS - Hide when scrolled for compact sticky header */}
      {!isScrolled && (
        <div className="bg-slate-50 border-b border-slate-100 animate-fadeIn">
          <div className="max-w-7xl mx-auto px-1 md:px-0">
            <Breadcrumbs overrideLastText={breadcrumbText} isCompact />
          </div>
        </div>
      )}

      <div
        className={`px-3 md:px-6 max-w-7xl mx-auto transition-all ${isScrolled ? "py-1" : "py-4 md:py-6"}`}
      >
        {/* MAIN HEADER ROW */}
        <div className="flex items-center gap-2 w-full">
          {/* BACK BUTTON (if provided) */}
          {onBack && !showMobileSearch && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-primary transition-all shrink-0"
              title="Kembali"
            >
              <FiArrowLeft size={16} />
            </button>
          )}

          {/* TITLE - Responsive truncate */}
          {!showMobileSearch && (
            <div className="flex-1 min-w-0">
              <h1
                className={`font-bold text-slate-800 tracking-tight truncate transition-all ${
                  isScrolled ? "text-base md:text-lg" : "text-lg md:text-2xl"
                }`}
                title={title}
              >
                {title}
              </h1>
              {subtitle && !isScrolled && (
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* MOBILE SEARCH (when active) */}
          {searchBar && showMobileSearch && (
            <div className="flex-1 flex items-center gap-2">
              {searchBar}
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          {/* RIGHT CONTROLS - Always visible */}
          {!showMobileSearch && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* GENDER FILTER - Always visible, compact */}
              {genderFilter && (
                <div className="hidden xs:block">{genderFilter}</div>
              )}

              {/* DESKTOP SEARCH */}
              {searchBar && (
                <div className="hidden md:block w-32 lg:w-48">{searchBar}</div>
              )}

              {/* MOBILE SEARCH ICON */}
              {searchBar && (
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all bg-white"
                  title="Cari"
                >
                  <FiSearch size={16} />
                </button>
              )}

              {/* EXTRA ACTIONS (View toggles, etc) */}
              {extraActions && (
                <div className="hidden sm:flex shrink-0">{extraActions}</div>
              )}

              {/* FILTER BUTTON */}
              {(filters || genderFilter) && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showFilters
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                  title="Filter"
                >
                  <FiFilter size={14} />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              )}

              {/* PRIMARY ACTION - Always visible */}
              {primaryAction && (
                <div className="shrink-0 shadow-sm rounded-lg overflow-hidden">
                  {primaryAction}
                </div>
              )}

              {/* ACTION BUTTONS - Always in dropdown menu for clean UI */}
              {actions && (
                <div className="relative" ref={actionMenuRef}>
                  <button
                    onClick={() => setShowActionMenu(!showActionMenu)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${
                      showActionMenu
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                    }`}
                    title="Menu Aksi"
                  >
                    <FiMoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {showActionMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[100] animate-fadeIn">
                      <div className="py-2 flex flex-col">
                        {React.Children.map(actions, (action, idx) => (
                          <div
                            key={idx}
                            onClick={() => setShowActionMenu(false)}
                            className="w-full text-left"
                          >
                            <div className="[&>button]:w-full [&>button]:justify-start [&>button]:border-none [&>button]:shadow-none [&>button]:rounded-none [&>button]:px-4 [&>button]:py-2.5 [&>button]:text-sm hover:bg-slate-50 transition-colors">
                              {action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FILTER DRAWER (Collapsible) */}
        {showFilters && (filters || genderFilter || extraActions) && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn transition-all">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Extra Actions on mobile (like View Switcher) */}
              {extraActions && (
                <div className="sm:hidden w-full flex flex-col gap-1.5 mb-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Opsi Tampilan
                  </span>
                  <div className="w-fit">{extraActions}</div>
                </div>
              )}

              {/* Gender filter on mobile (if not shown above) */}
              {genderFilter && (
                <div className="xs:hidden w-full sm:w-auto">{genderFilter}</div>
              )}
              {/* Other filters */}
              {filters}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
