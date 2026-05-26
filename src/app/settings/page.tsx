import { PageShell } from "@/components/PageShell";
import { SettingsPanel } from "@/components/SettingsPanel";
import { MobileShell } from "@/components/MobileShell";
import { MobileSettings } from "@/components/mobile/MobileMisc";

export default function SettingsPage() {
  return (
    <>
      <PageShell glow={false} minHeight={780} sidebar={{ active: "home" }} topbar={{ title: "Settings" }}>
        <SettingsPanel />
      </PageShell>
      <MobileShell active="home">
        <MobileSettings />
      </MobileShell>
    </>
  );
}
