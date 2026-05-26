import { PageShell } from "@/components/PageShell";
import { AssignmentsEmpty } from "@/components/AssignmentsList";
import { MobileShell, MobileEmptyState } from "@/components/MobileShell";

export default function AssignmentsEmptyPage() {
  return (
    <>
      <PageShell
        glow={false}
        sidebar={{ active: "assignments", badges: { assignments: "32" } }}
        topbar={{ title: "Assignment", leadingIcon: "/figma/screen3/home-grid.svg" }}
        minHeight={780}
      >
        <AssignmentsEmpty />
      </PageShell>
      <MobileShell active="assignments" showFab>
        <MobileEmptyState />
      </MobileShell>
    </>
  );
}
