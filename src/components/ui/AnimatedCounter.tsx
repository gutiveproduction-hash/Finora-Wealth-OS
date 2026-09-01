import { useEffect, useRef, useState } from "react";
import { useSpring } from "motion/react";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";

/** Spring-animated currency amount that counts up/down toward `value` and briefly
 * flashes green/red when the value changes (e.g. after a new transaction). */
export function AnimatedNumber({
  value,
  currency = "IDR",
  isPrivate = false,
  compact = false,
  className = "",
  prefix = "",
  suffix = "",
  flashOnChange = true,
}: {
  value: number;
  currency?: string;
  isPrivate?: boolean;
  compact?: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
  flashOnChange?: boolean;
}) {
  const spring = useSpring(value, { stiffness: 85, damping: 18, mass: 0.8 });
  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevValRef = useRef(value);

  useEffect(() => {
    if (flashOnChange && value !== prevValRef.current) {
      setFlash(value > prevValRef.current ? "up" : "down");
      prevValRef.current = value;
      const timer = setTimeout(() => setFlash(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [value, flashOnChange]);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => setDisplayValue(latest));
    return () => unsubscribe();
  }, [spring]);

  if (isPrivate) return <span className={className}>••••••••</span>;

  const flashClass = flash === "up" ? "text-emerald-500 transition-colors duration-500" : flash === "down" ? "text-rose-500 transition-colors duration-500" : "";

  return (
    <span className={`${className} ${flashClass}`}>
      {prefix}
      {compact ? formatCompactCurrency(displayValue, currency) : formatCurrency(displayValue, currency)}
      {suffix}
    </span>
  );
}

/** Spring-animated plain decimal number (no currency symbol), e.g. "3.4 bulan". */
export function AnimatedRawNumber({
  value,
  decimals = 1,
  className = "",
  suffix = "",
  prefix = "",
}: {
  value: number;
  decimals?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const spring = useSpring(value, { stiffness: 85, damping: 16 });
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplayVal(v));
    return () => unsub();
  }, [spring]);

  return (
    <span className={className}>
      {prefix}
      {displayVal.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Spring-animated percentage, e.g. "+4.2%". */
export function AnimatedPercent({
  value,
  className = "",
  includeSign = true,
}: {
  value: number;
  className?: string;
  includeSign?: boolean;
}) {
  const spring = useSpring(value, { stiffness: 90, damping: 16 });
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplayVal(v));
    return () => unsub();
  }, [spring]);

  const sign = includeSign && displayVal > 0 ? "+" : "";

  return (
    <span className={className}>
      {sign}
      {displayVal.toFixed(1)}%
    </span>
  );
}
