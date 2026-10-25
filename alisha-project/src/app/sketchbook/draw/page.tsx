"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DrawingStudio } from "@/components/DrawingStudio";

function DrawGate() {
  const params = useSearchParams();
  const id = params.get("id");
  return <DrawingStudio key={id ?? "new"} id={id} justSaved={params.get("saved") === "1"} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="wrap page"><p role="status">Opening the page…</p></div>}>
      <DrawGate />
    </Suspense>
  );
}
