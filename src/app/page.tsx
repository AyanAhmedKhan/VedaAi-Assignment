import { PageShell } from "@/components/PageShell";
import { AssignmentForm } from "@/components/AssignmentForm";
import { MobileShell } from "@/components/MobileShell";
import { MobileCreateForm } from "@/components/mobile/MobileCreateForm";

export default function Home() {
  return (
    <>
      <PageShell glow={false} sidebar={{ active: "home" }} topbar={{ title: "Assignment" }}>
        <AssignmentForm />
      </PageShell>
      <MobileShell active="home">
        <MobileCreateForm />
      </MobileShell>
    </>
  );
}
