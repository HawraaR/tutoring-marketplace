import { useState, useEffect, useRef } from "react";
import { Menu, Search, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom"; // Import Link for navigation

interface HeaderProps {
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
  onSettings?: () => void;
  onLogout?: () => void;
  /** Optional subtitle to display under the welcome message */
  subtitle?: string;
}

export function Header({
  onMenuClick,
  onSearch,
  onSettings,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Debounce search input to prevent excessive API calls/re-renders
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 3. Close dropdown on Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  // 4. Safely resolve display name with fallbacks
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  // 5. Generate initials for a polished avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev);
    if (isMobileSearchOpen) {
      setSearchQuery(""); // Clear search when closing mobile view
    }
  };

  // const handleLogout = () => {
  //   setIsDropdownOpen(false);
  //   if (onLogout) {
  //     onLogout();
  //   } else {
  //     console.warn("onLogout prop is not provided to Header component");
  //   }
  // };

  // const handleSettings = () => {
  //   setIsDropdownOpen(false);
  //   if (onSettings) {
  //     onSettings();
  //   } else {
  //     console.warn("onSettings prop is not provided to Header component");
  //   }
  // };

  return (
    <header className="relative flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface-card px-4 py-3 md:px-8">
      {/* Left Section: Menu & Welcome */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          className="rounded-md p-2 text-ink hover:bg-surface-hover transition-colors md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 ">
          <h1 className="font-serif truncate text-2xl font-bold text-ink">
            Welcome, {displayName}
          </h1>
          {/* <p className="hidden text-sm text-muted sm:block">
            {subtitle ||
              "Autumn 2026 · 3 sessions this week · 11.5 hours logged"}
          </p> */}
        </div>
      </div>

      {/* Right Section: Search & Profile */}
      <div
        className="relative flex items-center gap-3 md:gap-4"
        ref={dropdownRef}
      >
        {/* Desktop Search */}
        <label className="relative hidden flex-1 max-w-xs md:block">
          <span className="sr-only">Search courses or tutors</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search courses or tutors"
            className="w-full rounded-md border border-border-subtle bg-surface-bg py-2 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
        </label>

        {/* Mobile Search Toggle */}
        <button
          type="button"
          aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
          className="rounded-md p-2 text-ink hover:bg-surface-hover transition-colors md:hidden"
          onClick={toggleMobileSearch}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* User Profile Trigger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-full bg-surface-bg p-0.5 text-ink ring-1 ring-border-subtle hover:bg-surface-hover hover:ring-brand-primary transition-all"
          aria-label={`Open user profile menu for ${displayName}`}
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
            {initials}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md border border-border-subtle bg-surface-card py-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            {/* User Info Summary in Dropdown (Optional but nice UX) */}
            <div className="border-b border-border-subtle px-3 py-2">
              <p className="truncate text-sm font-medium text-ink">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted">
                {user?.email || "user@example.com"}
              </p>
            </div>

            {/* Menu Items */}
            
            <Link
              to="/settings" // Change to `to="/settings"` if using react-router-dom
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-blue-50 hover:bg-surface-hover transition-colors text-left"
              onClick={() => {
                setIsDropdownOpen(false); // Close dropdown on click
                if (onSettings) onSettings(); // Trigger parent callback if provided
              }}
            >
              <Settings className="h-4 w-4 text-muted" />
              Settings
            </Link>

            <div className="my-1 border-t border-border-subtle" />

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {isMobileSearchOpen && (
        <div className="absolute top-full left-0 right-0 z-40 border-b border-border-subtle bg-surface-card p-4 shadow-sm md:hidden">
          <label className="relative block">
            <span className="sr-only">Search courses or tutors</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search courses or tutors"
              autoFocus
              className="w-full rounded-md border border-border-subtle bg-surface-bg py-2.5 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </label>
        </div>
      )}
    </header>
  );
}
