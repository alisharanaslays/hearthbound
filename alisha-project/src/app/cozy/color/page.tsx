"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ColoringStudio } from "@/components/ColoringStudio";

function Gate() {
  const params = useSearchParams();
  const id = params.get("id");
  return <ColoringStudio key={id ?? "new"} creationId={id} justSaved={params.get("saved")} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="wrap page">Opening the coloring page…</p>}>
      <Gate />
    </Suspense>
  );
}
