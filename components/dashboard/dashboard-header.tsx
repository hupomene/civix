import Link from "next/link";
import { Bell, Search, User } from "lucide-react";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              CIVIX
            </Link>
            <span>/</span>
            <span>{title}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-1 hidden text-sm text-slate-500 md:block">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500 transition hover:bg-slate-50 md:flex">
            <Search className="h-4 w-4" />
            Search
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50">
            <Bell className="h-4 w-4" />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}