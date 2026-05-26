import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const A = "/figma/screen1";

type NavKey = "home" | "groups" | "assignments" | "toolkit" | "library" | "analytics";
type CTAKey = "create-assignment" | "toolkit";

const HomeIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2.5" y="2.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
    <rect x="11.5" y="2.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
    <rect x="2.5" y="11.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
    <rect x="11.5" y="11.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const GroupsIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="7.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 16l4-4 4 3 3-2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const FileTextIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 2.5h7l3.5 3.5v11a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 2.5V6h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M7 11h6M7 14h6M7 8h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const BookIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3.5 3.5A1.5 1.5 0 0 1 5 2h11v14H5a1.5 1.5 0 0 0-1.5 1.5V3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M16 16v2H5a1.5 1.5 0 0 1 0-3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const PieIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2v8h8a8 8 0 1 1-8-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 2.5a7.5 7.5 0 0 1 5.5 5.5H12V2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const navItems: { key: NavKey; icon: ReactNode; label: string; href: string }[] = [
  { key: "home", icon: HomeIcon, label: "Home", href: "/" },
  { key: "groups", icon: GroupsIcon, label: "My Groups", href: "/groups" },
  { key: "assignments", icon: FileTextIcon, label: "Assignments", href: "/assignments" },
  { key: "toolkit", icon: BookIcon, label: "AI Teacher’s Toolkit", href: "/output" },
  { key: "analytics", icon: PieIcon, label: "Analytics", href: "/analytics" },
  { key: "library", icon: PieIcon, label: "My Library", href: "/library" },
];

export function Sidebar({
  active = "home",
  cta = "create-assignment",
  badges = { library: "32" },
}: {
  active?: NavKey;
  cta?: CTAKey;
  badges?: Partial<Record<NavKey, string>>;
}) {
  const ctaLabel = cta === "toolkit" ? "AI Teacher’s Toolkit" : "Create Assignment";
  const ctaHref = cta === "toolkit" ? "/output" : "/";
  return (
    <aside className="absolute left-3 top-3 w-[304px] h-[744px] bg-white rounded-2xl shadow-sidebar p-6 flex flex-col items-center justify-between z-10">
      <div className="flex flex-col gap-14 items-center w-[251px]">
        <div className="flex items-center w-full">
          <Link href="/" className="flex gap-2 items-center">
            <div className="relative w-10 h-10 rounded-[15px] overflow-hidden bg-gradient-to-b from-brand-gradientFrom to-brand-gradientTo">
              <Image src={`${A}/logo-bg.jpg`} alt="" fill sizes="40px" className="object-cover rounded-[10px]" />
              <Image src={`${A}/logo-mark.svg`} alt="" width={28} height={28} className="absolute inset-0 m-auto" />
            </div>
            <span className="font-bricolage font-bold text-[28px] leading-5 tracking-[-0.06em] text-ink-primary">VedaAI</span>
          </Link>
        </div>

        <div className="flex items-center justify-center w-full">
          <Link
            href={ctaHref}
            className="relative flex-1 h-[42px] rounded-pill border-4 border-brand-orangeAlt bg-button-dark text-white flex items-center justify-center gap-2.5 px-4 py-2 shadow-navGlow"
          >
            <Image src={`${A}/logo-spark.svg`} alt="" width={18} height={17} />
            <span className="font-inter font-medium text-base tracking-[-0.04em] leading-7 whitespace-nowrap">{ctaLabel}</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-2 w-[251px]">
          {navItems.map((item) => {
            const isActive = item.key === active;
            const badge = badges[item.key];
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex gap-2 items-center px-3 py-2 rounded-lg ${isActive ? "bg-surface-off20" : ""}`}
              >
                <span
                  className={`relative w-5 h-5 shrink-0 inline-flex items-center justify-center ${
                    isActive ? "text-ink-primary" : "text-ink-secondary/80"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`flex-1 font-bricolage text-base tracking-[-0.04em] leading-[1.4] truncate ${
                    isActive ? "text-ink-primary font-medium" : "text-ink-secondary/80"
                  }`}
                >
                  {item.label}
                </span>
                {badge && (
                  <span className="bg-brand-orange text-white font-bricolage font-semibold text-sm leading-[1.4] tracking-[-0.04em] px-2.5 rounded-lg">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 items-start w-full">
        <Link href="/settings" className="flex gap-2 items-center px-3 py-2 w-full rounded-lg hover:bg-surface-off20">
          <div className="relative w-5 h-5">
            <Image src={`${A}/settings-stroke.svg`} alt="" fill sizes="20px" />
          </div>
          <span className="flex-1 font-bricolage text-base tracking-[-0.04em] text-ink-secondary/80 leading-[1.4]">Settings</span>
        </Link>
        <Link href="/profile" className="bg-surface-off20 rounded-2xl p-3 w-full hover:bg-surface-off">
          <div className="flex gap-2 items-center">
            <Image src={`${A}/avatar.png`} alt="" width={59} height={56} className="rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-bricolage font-bold text-base tracking-[-0.04em] text-ink-primary leading-[1.4] truncate">Delhi Public School</p>
              <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary leading-[1.4] truncate">Bokaro Steel City</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
