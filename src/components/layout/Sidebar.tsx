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
  Layers,
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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white"
  );

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200/70 dark:border-neutral-800/80 flex flex-col h-full bg-white dark:bg-[#18191E]">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-neutral-50">
              Finora
            </span>
          </div>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
            Wealth OS
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-1">
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={18} />
          Pengaturan
        </NavLink>
        {/* Required attribution — see NOTICE.md. Do not remove, hide, or alter in distributed copies. */}
        <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-neutral-400">
          <span>by</span>
          <span className="inline-flex items-end shrink-0 leading-none">
            <span className="text-[11px] font-extrabold tracking-tight text-neutral-700 dark:text-neutral-200">Gutive</span>
            <span className="w-1 h-1 rounded-full bg-lime-500 shrink-0 mx-px mb-px" />
            <span className="text-[11px] font-extrabold tracking-tight text-neutral-700 dark:text-neutral-200">co</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
