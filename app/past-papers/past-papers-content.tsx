"use client";

import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/section-heading";
import { FilterForm, usePaperFilterForm } from "@/components/past-papers/paper-filter-form";

export function PastPapersContent() {
  const router = useRouter();

  const { formProps } = usePaperFilterForm((paperId, type) => {
    router.push(`/past-papers/${paperId}?mode=${type === "mark-scheme" ? "ms" : "qp"}`);
  });

  return (
    <div className="container-content py-16">
      <Breadcrumbs items={[{ label: "Past Papers" }]} />

      <div className="mt-6">
        <SectionHeading
          eyebrow="Past Papers"
          title="Find any Cambridge paper in seconds"
          description="All fields are required. Fill in a field and press Enter to jump to the next one — pressing Enter on the last field opens the paper."
        />
      </div>

      <div className="mt-8">
        <FilterForm {...formProps} />
      </div>
    </div>
  );
}
