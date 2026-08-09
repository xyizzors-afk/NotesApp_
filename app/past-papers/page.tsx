import { Suspense } from "react";
import { PastPapersContent } from "./past-papers-content";

export default function PastPapersPage() {
  return (
    <Suspense fallback={<div className="container-content py-16 text-sm text-muted">Loading filters…</div>}>
      <PastPapersContent />
    </Suspense>
  );
}
