export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 shrink-0 rounded-full p-0.5 flex items-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#18191E] ${
        checked ? "bg-emerald-500 justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
      }`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow" />
    </button>
  );
}
