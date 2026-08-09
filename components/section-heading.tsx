import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-[32px]">
        {title}
      </h2>
      {description && (
        <p className={cn("mt-3 max-w-xl text-[15px] leading-relaxed text-muted", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
