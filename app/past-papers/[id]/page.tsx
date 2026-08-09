import { Suspense, use } from "react";
import Link from "next/link";
import { FileWarning } from "lucide-react";
import { PaperViewer } from "@/components/viewer/paper-viewer";
import { resolvePaper } from "@/lib/paper-descriptor";

export const metadata = {
  title: "Paper Viewer | Coursify",
};

export default function PdfViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const paper = resolvePaper(id);

  if (!paper) {
    return (
      <div className="container-content flex flex-col items-center gap-3 py-24 text-center">
        <FileWarning size={28} className="text-muted" />
        <h1 className="font-display text-xl font-semibold text-ink">Paper not found</h1>
        <p className="max-w-sm text-sm text-muted">
          We couldn&apos;t find a past paper with that ID. It may have been moved or removed.
        </p>
        <Link
          href="/past-papers"
          className="mt-2 inline-flex h-10 items-center rounded-full bg-ink-solid px-5 text-sm font-medium text-on-ink hover:bg-ink-solid/90"
        >
          Back to Past Papers
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-muted">Loading viewer…</div>}>
      <PaperViewer key={paper.id} paper={paper} />
    </Suspense>
  );
}