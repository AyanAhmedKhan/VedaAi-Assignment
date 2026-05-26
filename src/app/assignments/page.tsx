import { PageShell } from "@/components/PageShell";
import { AssignmentsList } from "@/components/AssignmentsList";
import { MobileShell } from "@/components/MobileShell";
import { MobileAssignmentsList } from "@/components/mobile/MobileAssignmentsList";

export default function AssignmentsPage() {
  return (
    <>
      <PageShell
        glow={false}
        sidebar={{ active: "assignments", badges: { assignments: "32" } }}
        topbar={{ title: "Assignment", leadingIcon: "/figma/screen2/home-grid.svg" }}
        minHeight={843}
      >
        <AssignmentsList />
      </PageShell>
      <MobileShell active="assignments" showFab>
        <MobileAssignmentsList />
      </MobileShell>
    </>
  );
}
