"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Documents",
    href: "#",
    icon: FileText,
  },
  {
    label: "AI Reviews",
    href: "#",
    icon: Sparkles,
  },
  {
    label: "Risks",
    href: "#",
    icon: TriangleAlert,
  },
  {
    label: "Reports",
    href: "#",
    icon: BarChart3,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/projects") {
    return pathname === "/projects" || pathname.startsWith("/projects/");
  }

  return false;
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <Link href="/" className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600">
          <div className="h-3.5 w-3.5 rotate-45 rounded-sm bg-white" />
        </div>

        <div>
          <div className="text-lg font-bold tracking-tight">CIVIX</div>
          <div className="text-xs text-slate-500">
            Construction Intelligence
          </div>
        </div>
      </Link>

      <nav className="mt-10 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-semibold">AI Review Engine</p>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Upload permit packages and generate compliance-focused review
            insights.
          </p>
        </div>
      </div>
    </aside>
  );
}