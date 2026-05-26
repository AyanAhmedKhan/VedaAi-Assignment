import { PageShell } from "@/components/PageShell";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { MobileShell } from "@/components/MobileShell";
import { MobileAnalytics } from "@/components/mobile/MobileMisc";

export default function AnalyticsPage() {
  return (
    <>
      <PageShell glow={false} minHeight={900} sidebar={{ active: "analytics" }} topbar={{ title: "Analytics" }}>
        <AnalyticsPanel />
      </PageShell>
      <MobileShell active="home">
        <MobileAnalytics />
      </MobileShell>
    </>
  );
}
