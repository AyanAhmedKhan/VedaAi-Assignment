import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type SidebarProps = Parameters<typeof Sidebar>[0];
type TopBarProps = Parameters<typeof TopBar>[0];

export function PageShell({
  background = "gradient",
  minHeight = 1340,
  glow = true,
  sidebar,
  topbar,
  children,
}: {
  background?: "gradient" | "neutral";
  minHeight?: number;
  glow?: boolean;
  sidebar?: SidebarProps;
  topbar?: TopBarProps;
  children: ReactNode;
}) {
  const bgClass = background === "gradient" ? "page-gradient" : "bg-[#e6e6e6]";
  return (
    <main className={`${bgClass} min-h-screen w-full hidden lg:block`}>
      <div
        className={`relative mx-auto w-[1440px] ${glow ? "brand-glow overflow-hidden" : ""}`}
        style={{ minHeight }}
      >
        <Sidebar {...sidebar} />
        <TopBar {...topbar} />
        {children}
      </div>
    </main>
  );
}
