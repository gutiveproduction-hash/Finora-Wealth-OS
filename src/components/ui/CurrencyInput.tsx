import { useState, type InputHTMLAttributes } from "react";
import { formatCurrency } from "@/lib/format";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Raw numeric value as a string, e.g. "1000000". */
  value: string;
  onChange: (value: string) => void;
  /** ISO currency code, e.g. "IDR" or "USD" — controls the symbol/format shown while not focused. */
  currency: string;
}

/** Currencies displayed without decimals (matches formatCurrency). */
const ZERO_DECIMAL = new Set(["IDR", "JPY"]);

/** Turns what the user typed into a plain number string.
 *
 * Indonesian users habitually type thousands separators ("1.000.000"). Previously only
 * non-digits other than "." were stripped, so that survived as "1.000.000", `Number()`
 * gave NaN, and the amount was silently saved as 0 — or the form refused to submit with
 * no message at all. For zero-decimal currencies every separator is a thousands
 * separator; otherwise the last separator is the decimal point and the rest are noise. */
export function parseAmountInput(raw: string, currency: string): string {
  const cleaned = raw.replace(/[^0-9.,]/g, "");
  if (ZERO_DECIMAL.has(currency)) return cleaned.replace(/[.,]/g, "");

  const lastSeparator = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
  if (lastSeparator === -1) return cleaned;

  const whole = cleaned.slice(0, lastSeparator).replace(/[.,]/g, "");
  const fraction = cleaned.slice(lastSeparator + 1).replace(/[.,]/g, "");
  // "1.000.000" — a trailing group of exactly 3 digits after several separators is a
  // thousands group, not a fraction.
  const separatorCount = (cleaned.match(/[.,]/g) ?? []).length;
  if (separatorCount > 1 && fraction.length === 3) return whole + fraction;
  return `${whole}.${fraction}`;
}

/** A money input that shows a live currency-formatted value (e.g. "Rp 1.000.000" or
 * "$1,000.00") while unfocused, and the raw editable number while the user is typing. */
export function CurrencyInput({ value, onChange, currency, className, onFocus, onBlur, ...rest }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const numeric = Number(value);
  const displayValue = !focused && value !== "" && !Number.isNaN(numeric) ? formatCurrency(numeric, currency) : value;

  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      className={className ?? "input"}
      value={displayValue}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onChange={(e) => onChange(parseAmountInput(e.target.value, currency))}
    />
  );
}
