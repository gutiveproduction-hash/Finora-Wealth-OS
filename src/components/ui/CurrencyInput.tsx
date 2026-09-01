import { useState, type InputHTMLAttributes } from "react";
import { formatCurrency } from "@/lib/format";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Raw numeric value as a string, e.g. "1000000". */
  value: string;
  onChange: (value: string) => void;
  /** ISO currency code, e.g. "IDR" or "USD" — controls the symbol/format shown while not focused. */
  currency: string;
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
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
    />
  );
}
