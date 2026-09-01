import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  PiggyBank,
  Landmark,
  LineChart,
  Settings,
  Github,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { to: "/accounts", label: "Akun", icon: Wallet },
  { to: "/investments", label: "Portofolio", icon: TrendingUp },
  { to: "/budgets", label: "Anggaran", icon: PiggyBank },
  { to: "/liabilities", label: "Utang", icon: Landmark },
  { to: "/networth", label: "Kekayaan Bersih", icon: LineChart },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full bg-white dark:bg-neutral-900">
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
          M
        </div>
        <div>
          <div className="font-semibold leading-tight">My Networth</div>
          <div className="text-[11px] text-neutral-400 leading-tight">Personal Finance</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )
          }
        >
          <Settings size={18} />
          Pengaturan
        </NavLink>
        <a
          href="https://github.com"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-neutral-400"
          title="Proyek open source — cek README untuk link repo"
        >
          <Github size={16} />
          Open Source (MIT)
        </a>
      </div>
    </aside>
  );
}
