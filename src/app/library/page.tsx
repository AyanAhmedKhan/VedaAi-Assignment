import { PageShell } from "@/components/PageShell";
import { MobileShell } from "@/components/MobileShell";
import { MobileSimplePage } from "@/components/mobile/MobileMisc";
import { LibraryPanel } from "@/components/LibraryPanel";

export default function LibraryPage() {
  return (
    <>
      <PageShell glow={false} minHeight={780} sidebar={{ active: "library" }} topbar={{ title: "My Library" }}>
        <LibraryPanel />
      </PageShell>
      <MobileShell active="home">
        <MobileSimplePage title="My Library" subtitle="All your previously generated papers." />
      </MobileShell>
    </>
  );
}
