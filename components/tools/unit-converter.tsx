"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryId =
  | "length"
  | "area"
  | "volume"
  | "mass"
  | "time"
  | "temperature"
  | "energy"
  | "pressure"
  | "speed";

interface UnitDef {
  id: string;
  label: string;
  /** Linear conversion y = m·x + c to the category's base unit. */
  m: number;
  c: number;
}

interface CategoryDef {
  id: UnitId;
  label: string;
  units: UnitDef[];
}

type UnitId = string;

const CATEGORIES: CategoryDef[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "m", label: "metres", m: 1, c: 0 },
      { id: "km", label: "kilometres", m: 1000, c: 0 },
      { id: "cm", label: "centimetres", m: 0.01, c: 0 },
      { id: "mm", label: "millimetres", m: 0.001, c: 0 },
      { id: "mi", label: "miles", m: 1609.344, c: 0 },
      { id: "yd", label: "yards", m: 0.9144, c: 0 },
      { id: "ft", label: "feet", m: 0.3048, c: 0 },
      { id: "in", label: "inches", m: 0.0254, c: 0 },
    ],
  },
  {
    id: "area",
    label: "Area",
    units: [
      { id: "m2", label: "m²", m: 1, c: 0 },
      { id: "km2", label: "km²", m: 1e6, c: 0 },
      { id: "cm2", label: "cm²", m: 0.0001, c: 0 },
      { id: "mm2", label: "mm²", m: 1e-6, c: 0 },
      { id: "ha", label: "hectares", m: 10000, c: 0 },
      { id: "ac", label: "acres", m: 4046.856, c: 0 },
      { id: "ft2", label: "ft²", m: 0.092903, c: 0 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    units: [
      { id: "L", label: "litres", m: 0.001, c: 0 },
      { id: "mL", label: "millilitres", m: 1e-6, c: 0 },
      { id: "m3", label: "m³", m: 1, c: 0 },
      { id: "cm3", label: "cm³", m: 1e-6, c: 0 },
      { id: "gal", label: "gallons (UK)", m: 0.00454609, c: 0 },
      { id: "galus", label: "gallons (US)", m: 0.00378541, c: 0 },
      { id: "qt", label: "quarts (US)", m: 0.000946353, c: 0 },
    ],
  },
  {
    id: "mass",
    label: "Mass",
    units: [
      { id: "kg", label: "kilograms", m: 1, c: 0 },
      { id: "g", label: "grams", m: 0.001, c: 0 },
      { id: "mg", label: "milligrams", m: 1e-6, c: 0 },
      { id: "t", label: "tonnes", m: 1000, c: 0 },
      { id: "lb", label: "pounds", m: 0.45359237, c: 0 },
      { id: "oz", label: "ounces", m: 0.0283495, c: 0 },
      { id: "st", label: "stones", m: 6.35029, c: 0 },
    ],
  },
  {
    id: "time",
    label: "Time",
    units: [
      { id: "s", label: "seconds", m: 1, c: 0 },
      { id: "ms", label: "milliseconds", m: 0.001, c: 0 },
      { id: "min", label: "minutes", m: 60, c: 0 },
      { id: "h", label: "hours", m: 3600, c: 0 },
      { id: "d", label: "days", m: 86400, c: 0 },
      { id: "wk", label: "weeks", m: 604800, c: 0 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "C", label: "°C", m: 1, c: 0 },
      { id: "F", label: "°F", m: 5 / 9, c: -32 * (5 / 9) },
      { id: "K", label: "K", m: 1, c: -273.15 },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    units: [
      { id: "J", label: "joules", m: 1, c: 0 },
      { id: "kJ", label: "kilojoules", m: 1000, c: 0 },
      { id: "cal", label: "calories", m: 4.184, c: 0 },
      { id: "kcal", label: "kilocalories", m: 4184, c: 0 },
      { id: "kWh", label: "kilowatt-hours", m: 3600000, c: 0 },
      { id: "eV", label: "electronvolts", m: 1.602177e-19, c: 0 },
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    units: [
      { id: "Pa", label: "pascals", m: 1, c: 0 },
      { id: "kPa", label: "kilopascals", m: 1000, c: 0 },
      { id: "bar", label: "bar", m: 100000, c: 0 },
      { id: "atm", label: "atmospheres", m: 101325, c: 0 },
      { id: "mmHg", label: "mmHg", m: 133.322, c: 0 },
      { id: "psi", label: "psi", m: 6894.76, c: 0 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    units: [
      { id: "ms", label: "m/s", m: 1, c: 0 },
      { id: "kmh", label: "km/h", m: 1 / 3.6, c: 0 },
      { id: "mph", label: "mph", m: 0.44704, c: 0 },
      { id: "kn", label: "knots", m: 0.514444, c: 0 },
      { id: "fts", label: "ft/s", m: 0.3048, c: 0 },
    ],
  },
];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

interface UnitConverterProps {
  className?: string;
}

export function UnitConverter({ className }: UnitConverterProps) {
  const [categoryId, setCategoryId] = useState<string>("length");
  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const [fromId, setFromId] = useState(category.units[0].id);
  const [toId, setToId] = useState(category.units[1].id);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (value.trim() === "") return "";
    const num = Number(value);
    if (!Number.isFinite(num)) return "Invalid number";
    const from = category.units.find((u) => u.id === fromId)!;
    const to = category.units.find((u) => u.id === toId)!;
    const inBase = num * from.m + from.c;
    const out = (inBase - to.c) / to.m;
    if (!Number.isFinite(out)) return "Invalid";
    return format(out);
  }, [category, fromId, toId, value]);

  function format(n: number): string {
    if (n === Infinity || n === -Infinity) return "Invalid";
    const abs = Math.abs(n);
    if (abs !== 0 && abs >= 1e10) return n.toExponential(5).replace(/\.?0+e/, "e");
    if (abs !== 0 && abs < 1e-6) return n.toExponential(5).replace(/\.?0+e/, "e");
    return String(parseFloat(n.toPrecision(10)));
  }

  function swap() {
    setFromId(toId);
    setToId(fromId);
    setCopied(false);
  }

  function copy() {
    if (result === null) return;
    void navigator.clipboard?.writeText(result).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function changeCategory(id: string) {
    const next = CATEGORIES.find((c) => c.id === id)!;
    setCategoryId(id);
    setFromId(next.units[0].id);
    setToId(next.units[1].id);
    setCopied(false);
  }

  return (
    <div className={className}>
      {/* Category */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => changeCategory(c.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              c.id === categoryId ? "bg-ink-solid text-on-ink" : "bg-surface text-muted hover:text-ink"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <select
          aria-label="From unit"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {category.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>

        <textarea
          aria-label="Value to convert"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.\-eE]/g, ""))}
          placeholder="Enter a value"
          rows={2}
          inputMode="decimal"
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        <div className="flex items-center justify-between">
          <select
            aria-label="To unit"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <button
            onClick={swap}
            aria-label="Swap units"
            className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowDownUp size={16} />
          </button>
        </div>

        {/* Result */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-xs text-muted">Result</p>
            <p className="truncate font-mono text-lg font-medium text-accent">
              {result ?? "\u00A0"}
            </p>
          </div>
          <button
            onClick={copy}
            disabled={result === null}
            aria-label="Copy result"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40"
          >
            <Copy size={14} />
          </button>
        </div>
        {copied && <p className="text-right text-xs text-signal-green">Copied</p>}
      </div>
    </div>
  );
}