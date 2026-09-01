import { motion } from "motion/react";
import { Link } from "react-router-dom";
import type { Account } from "@/types";
import { formatCurrency } from "@/lib/format";

export function AccountBalancesList({ accounts, isPrivate }: { accounts: Account[]; isPrivate: boolean }) {
  const sorted = [...accounts].filter((a) => !a.archived).sort((a, b) => b.balance - a.balance);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Saldo Akun</h2>
        <Link to="/accounts" className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline">
          Kelola
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-neutral-400 py-8 text-center">Belum ada akun.</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((account, idx) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * idx, duration: 0.3 }}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: account.color || "#64748b" }} />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{account.name}</span>
              </div>
              <span
                className={`text-xs font-bold font-mono-numbers shrink-0 ${
                  account.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {isPrivate ? "••••••" : formatCurrency(account.balance, account.currency)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
