"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SketchDetail } from "@/components/SketchDetail";

function DetailGate() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  return <SketchDetail id={params.id} justSaved={search.get("saved") === "1"} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="wrap page"><p role="status">Opening this creation…</p></div>}>
      <DetailGate />
    </Suspense>
  );
}
