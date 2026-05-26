import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { AssignmentOutput } from "@/components/AssignmentOutput";
import { MobileShell } from "@/components/MobileShell";
import { MobileAssignmentOutput } from "@/components/mobile/MobileAssignmentOutput";

export default function OutputPage() {
  return (
    <Suspense fallback={null}>
      <PageShell
        glow={false}
        minHeight={1715}
        sidebar={{ active: "toolkit", cta: "toolkit", badges: { assignments: "32" } }}
        topbar={{ title: "Create New", withSpark: true }}
      >
        <AssignmentOutput />
      </PageShell>
      <MobileShell active="toolkit">
        <MobileAssignmentOutput />
      </MobileShell>
    </Suspense>
  );
}
