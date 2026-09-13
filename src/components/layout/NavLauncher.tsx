import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Wallet,
  Target,
  TrendingUp,
  PiggyBank,
  Landmark,
  LineChart,
  Sparkles,
  BookOpen,
  Settings,
  LayoutGrid,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Menu Utama",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/transactions", label: "Riwayat Transaksi", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Modul",
    items: [
      { to: "/accounts", label: "Daftar Akun", icon: Wallet },
      { to: "/targets", label: "Target & Tagihan", icon: Target },
      { to: "/investments", label: "Portofolio Investasi", icon: TrendingUp },
      { to: "/networth", label: "Laporan Keuangan", icon: LineChart },
      { to: "/budgets", label: "Budgeting & Prediksi", icon: PiggyBank },
      { to: "/liabilities", label: "Utang", icon: Landmark },
    ],
  },
  {
    label: "Bantuan",
    items: [
      { to: "/flowai", label: "FlowAI Config", icon: Sparkles },
      { to: "/guide", label: "Panduan", icon: BookOpen },
    ],
  },
];

/** One menu row: label leading, glyph trailing — the iOS arrangement. */
function MenuRow({
  to,
  end,
  label,
  icon: Icon,
  onClick,
}: {
  to?: string;
  end?: boolean;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}) {
  const body = (isActive: boolean) => (
    <>
      <span className={clsx("text-[13.5px] tracking-[-0.01em]", isActive ? "font-semibold" : "font-normal")}>
        {label}
      </span>
      <Icon size={16} strokeWidth={isActive ? 2.3 : 1.8} className={clsx("shrink-0", !isActive && "opacity-60")} />
    </>
  );

  const rowClass = (isActive: boolean) =>
    clsx(
      "ios-menu-row w-full h-10 pl-[17px] pr-3.5 flex items-center justify-between gap-4 transition-colors",
      isActive
        ? "text-sky-600 dark:text-sky-300"
        : "text-neutral-900 dark:text-neutral-100"
    );

  if (!to) {
    return (
      <button type="button" onClick={onClick} className={rowClass(false)}>
        {body(false)}
      </button>
    );
  }

  return (
    <NavLink to={to} end={end} className={({ isActive }) => rowClass(isActive)}>
      {({ isActive }) => body(isActive)}
    </NavLink>
  );
}

/**
 * Replaces the fixed left rail: a floating launcher pinned to the bottom-left
 * corner that pops the navigation open in a rounded panel, offset from the edge.
 */
export function NavLauncher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Navigating always dismisses the panel, so it never lingers over the new page.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <>
      {/* Panel — rises out of the launcher, clear of the left edge */}
      <AnimatePresence>
        {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
          transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
          style={{ transformOrigin: "bottom left" }}
          className="ios-menu fixed bottom-24 left-14 z-50 w-[262px]"
        >
          <div className="max-h-[calc(100vh-11rem)] overflow-y-auto overscroll-contain">
          <div className="px-[17px] pt-2.5 pb-2 text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
            Finora · Wealth OS
          </div>

          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.label}>
              {idx > 0 && <div className="ios-menu-gap" />}
              {idx === 0 && (
                <MenuRow
                  label="Tambah Transaksi"
                  icon={PlusCircle}
                  onClick={() => navigate("/transactions", { state: { openCreate: true } })}
                />
              )}
              {section.items.map(({ to, label, icon, end }) => (
                <MenuRow key={to} to={to} end={end} label={label} icon={icon} />
              ))}
            </div>
          ))}

          <div className="ios-menu-gap" />
          <MenuRow to="/settings" label="Pengaturan" icon={Settings} />

          <div className="ios-menu-gap" />
          {/* Required attribution — see NOTICE.md. Do not remove, hide, or alter in distributed copies. */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>by</span>
            <span className="inline-flex items-end shrink-0 leading-none">
              <span className="text-[11px] font-extrabold tracking-tight text-neutral-700 dark:text-neutral-200">Gutive</span>
              <span className="w-1 h-1 rounded-full bg-lime-500 shrink-0 mx-px mb-px" />
              <span className="text-[11px] font-extrabold tracking-tight text-neutral-700 dark:text-neutral-200">co</span>
            </span>
          </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        animate={{ rotate: open ? 90 : 0 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="icloud-metal fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full
          flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex"
          >
            {open ? <X size={20} /> : <LayoutGrid size={20} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
