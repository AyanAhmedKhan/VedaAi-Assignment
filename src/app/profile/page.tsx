import { PageShell } from "@/components/PageShell";
import { ProfilePanel } from "@/components/ProfilePanel";
import { MobileShell } from "@/components/MobileShell";
import { MobileProfile } from "@/components/mobile/MobileMisc";

export default function ProfilePage() {
  return (
    <>
      <PageShell glow={false} minHeight={780} sidebar={{ active: "home" }} topbar={{ title: "Profile" }}>
        <ProfilePanel />
      </PageShell>
      <MobileShell active="home">
        <MobileProfile />
      </MobileShell>
    </>
  );
}
