"use client";

import { useRef, useState, type RefObject } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { DropdownFilter } from "@/components/dropdown-filter";
import { NumberFilterInput } from "@/components/number-filter-input";
import { filterOptions } from "@/data/papers";
import { subjectCodeDirectory } from "@/data/subjects";
import { buildPaperId } from "@/lib/paper-descriptor";
import { cn } from "@/lib/utils";
import { PaperKind, Session } from "@/lib/types";

export const UNSET = "unset";

export const typeOptions: { label: string; value: PaperKind | typeof UNSET }[] = [
  { label: "Select type...", value: UNSET },
  { label: "QP", value: "question-paper" },
  { label: "MS", value: "mark-scheme" },
];

export interface PaperFilterInitialValues {
  subjectCode?: string;
  year?: string;
  session?: Session;
  variant?: string;
  type?: PaperKind;
}

interface FilterFormProps {
  subjectCode: string;
  onSubjectCodeChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  session: Session | typeof UNSET;
  onSessionChange: (value: string) => void;
  variant: string;
  onVariantChange: (value: string) => void;
  type: PaperKind | typeof UNSET;
  onTypeChange: (value: string) => void;
  attempted: boolean;
  codeUnrecognized: boolean;
  missingFields: string[];
  isComplete: boolean;
  activeFilterCount: number;
  onConfirm: () => void;
  onClear: () => void;
  subjectRef: RefObject<HTMLInputElement>;
  yearRef: RefObject<HTMLInputElement>;
  sessionRef: RefObject<HTMLSelectElement>;
  variantRef: RefObject<HTMLInputElement>;
  typeRef: RefObject<HTMLSelectElement>;
  hideHeading?: boolean;
}

/**
 * Owns all state/validation/refs for the subject-code/year/session/variant/type
 * filter form. `onConfirmed` fires once every field is valid, with the
 * resolved paper ID and chosen document type — the caller decides what to do
 * with that (navigate on the search page, navigate + close a modal in the
 * viewer).
 */
export function usePaperFilterForm(
  onConfirmed: (paperId: string, type: PaperKind) => void,
  initial?: PaperFilterInitialValues
) {
  const [subjectCode, setSubjectCode] = useState(initial?.subjectCode ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [session, setSession] = useState<Session | typeof UNSET>(initial?.session ?? UNSET);
  const [variant, setVariant] = useState(initial?.variant ?? "");
  const [type, setType] = useState<PaperKind | typeof UNSET>(initial?.type ?? UNSET);

  const [attempted, setAttempted] = useState(false);
  const [codeUnrecognized, setCodeUnrecognized] = useState(false);

  const subjectRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<HTMLSelectElement>(null);
  const variantRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);

  const missingFields: string[] = [];
  if (!subjectCode) missingFields.push("Subject Code");
  if (!year) missingFields.push("Year");
  if (session === UNSET) missingFields.push("Session");
  if (!variant) missingFields.push("Variant");
  if (type === UNSET) missingFields.push("Type");
  const isComplete = missingFields.length === 0;
  const activeFilterCount = subjectCode || year || session !== UNSET || variant || type !== UNSET ? 5 : 0;

  function handleSubjectCodeChange(value: string) {
    setSubjectCode(value);
    if (codeUnrecognized) setCodeUnrecognized(false);
  }

  function handleConfirmAttempt() {
    if (!subjectCode) {
      setAttempted(true);
      subjectRef.current?.focus();
      return;
    }
    const subject = subjectCodeDirectory[subjectCode];
    if (!subject) {
      setAttempted(true);
      setCodeUnrecognized(true);
      subjectRef.current?.focus();
      return;
    }
    if (!year) {
      setAttempted(true);
      yearRef.current?.focus();
      return;
    }
    if (session === UNSET) {
      setAttempted(true);
      sessionRef.current?.focus();
      return;
    }
    if (!variant) {
      setAttempted(true);
      variantRef.current?.focus();
      return;
    }
    if (type === UNSET) {
      setAttempted(true);
      typeRef.current?.focus();
      return;
    }
    const paperId = buildPaperId({ code: subjectCode, subject, year, session, variant });
    typeRef.current?.blur();
    onConfirmed(paperId, type);
  }

  function clearFilters() {
    setSubjectCode("");
    setYear("");
    setSession(UNSET);
    setVariant("");
    setType(UNSET);
    setAttempted(false);
    setCodeUnrecognized(false);
    subjectRef.current?.focus();
  }

  const formProps: FilterFormProps = {
    subjectCode,
    onSubjectCodeChange: handleSubjectCodeChange,
    year,
    onYearChange: setYear,
    session,
    onSessionChange: (v) => setSession(v as Session | typeof UNSET),
    variant,
    onVariantChange: setVariant,
    type,
    onTypeChange: (v) => setType(v as PaperKind | typeof UNSET),
    attempted,
    codeUnrecognized,
    missingFields,
    isComplete,
    activeFilterCount,
    onConfirm: handleConfirmAttempt,
    onClear: clearFilters,
    subjectRef,
    yearRef,
    sessionRef,
    variantRef,
    typeRef,
  };

  return { formProps };
}

export function FilterForm({
  subjectCode,
  onSubjectCodeChange,
  year,
  onYearChange,
  session,
  onSessionChange,
  variant,
  onVariantChange,
  type,
  onTypeChange,
  attempted,
  codeUnrecognized,
  missingFields,
  isComplete,
  activeFilterCount,
  onConfirm,
  onClear,
  subjectRef,
  yearRef,
  sessionRef,
  variantRef,
  typeRef,
  hideHeading,
}: FilterFormProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
      {!hideHeading && (
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <SlidersHorizontal size={15} className="text-accent" />
          Filters
          {activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
            >
              <X size={13} />
              Clear all
            </button>
          )}
        </div>
      )}

      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", !hideHeading && "mt-4")}>
        <NumberFilterInput
          ref={subjectRef}
          label="Subject Code"
          value={subjectCode}
          onChange={onSubjectCodeChange}
          placeholder="e.g. 9709"
          maxLength={4}
          onEnter={() => yearRef.current?.focus()}
          invalid={attempted && (!subjectCode || codeUnrecognized)}
        />

        <NumberFilterInput
          ref={yearRef}
          label="Year"
          value={year}
          onChange={onYearChange}
          placeholder="e.g. 2025"
          maxLength={4}
          onEnter={() => sessionRef.current?.focus()}
          invalid={attempted && !year}
        />

        <DropdownFilter
          ref={sessionRef}
          label="Session"
          value={session}
          onChange={onSessionChange}
          onEnter={() => variantRef.current?.focus()}
          required
          invalid={attempted && session === UNSET}
          options={[
            { label: "Select session...", value: UNSET },
            ...filterOptions.sessions.map((s) => ({ label: s, value: s })),
          ]}
        />

        <NumberFilterInput
          ref={variantRef}
          label="Variant"
          value={variant}
          onChange={onVariantChange}
          placeholder="e.g. 2"
          maxLength={2}
          onEnter={() => typeRef.current?.focus()}
          invalid={attempted && !variant}
        />

        <DropdownFilter
          ref={typeRef}
          label="Type"
          value={type}
          onChange={onTypeChange}
          onEnter={onConfirm}
          required
          invalid={attempted && type === UNSET}
          options={typeOptions}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onConfirm}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink-solid px-5 text-sm font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
        >
          <Check size={15} />
          Confirm selection
        </button>
        {attempted && codeUnrecognized && (
          <p className="text-xs font-medium text-red-500">
            &quot;{subjectCode}&quot; isn&apos;t a subject code we recognise. Double-check the syllabus code and try again.
          </p>
        )}
        {attempted && !codeUnrecognized && !isComplete && (
          <p className="text-xs font-medium text-red-500">Please fill in: {missingFields.join(", ")}</p>
        )}
      </div>
    </div>
  );
}
