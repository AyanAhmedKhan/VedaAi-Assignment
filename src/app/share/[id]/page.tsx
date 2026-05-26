import { Suspense } from "react";
import { SharePaper } from "@/components/SharePaper";

export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <SharePaper id={id} />
    </Suspense>
  );
}
