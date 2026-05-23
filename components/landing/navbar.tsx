import Link from "next/link";
import { ChevronDown } from "lucide-react";

function CivixLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm">
        <div className="h-3.5 w-3.5 rotate-45 rounded-sm bg-white/95" />
      </div>
      <span className="text-xl font-semibold tracking-tight text-slate-950">
        CIVIX
      </span>
    </div>
  );
}

const navItems = [
  { label: "Product", hasDropdown: true },
  { label: "Solutions", hasDropdown: true },
  { label: "Pricing", hasDropdown: false },
  { label: "Resources", hasDropdown: true },
  { label: "Company", hasDropdown: true },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" aria-label="CIVIX home">
          <CivixLogo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href="#"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-950"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-slate-700 transition hover:text-slate-950 sm:inline-flex"
          >
            Log in
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}