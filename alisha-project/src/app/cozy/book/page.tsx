"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LittleBookStudio } from "@/components/LittleBookStudio";

function Gate() {
  const params = useSearchParams();
  const id = params.get("id");
  return <LittleBookStudio key={id ?? "new"} creationId={id} justSaved={params.get("saved")} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="wrap page">Opening your little book…</p>}>
      <Gate />
    </Suspense>
  );
}
