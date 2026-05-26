import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const M = "/figma/mobile";
const A = "/figma/screen1";

type TabKey = "home" | "assignments" | "library" | "toolkit";

const tabs: { key: TabKey; label: string; href: string; icon: ReactNode }[] = [
  {
    key: "home",
    label: "Home",
    href: "/",
    icon: (
      <div className="grid grid-cols-2 gap-[1px] w-[18px] h-[18px]">
        <span className="bg-current rounded-[2px] w-2 h-2" />
        <span className="bg-current rounded-[2px] w-2 h-2" />
        <span className="bg-current rounded-[2px] w-2 h-2" />
        <span className="bg-current rounded-[2px] w-2 h-2" />
      </div>
    ),
  },
  {
    key: "assignments",
    label: "Assignments",
    href: "/assignments",
    icon: <Image src={`${M}/nav-calendar.svg`} alt="" width={20} height={20} />,
  },
  {
    key: "library",
    label: "Library",
    href: "#",
    icon: <Image src={`${M}/nav-filetext.svg`} alt="" width={20} height={20} />,
  },
  {
    key: "toolkit",
    label: "AI Toolkit",
    href: "/output",
    icon: <Image src={`${M}/nav-aispark.svg`} alt="" width={20} height={20} />,
  },
];

export function MobileShell({
  active,
  showFab = false,
  children,
}: {
  active: TabKey;
  showFab?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="lg:hidden bg-surface-off40/40 min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
      {/* Top bar */}
      <header className="sticky top-0 z-20 px-3 pt-3 pb-2 backdrop-blur bg-white/60">
        <div className="bg-white rounded-2xl h-14 flex items-center justify-between pl-3 pr-3 gap-2">
          <Link href="/" className="flex gap-1.5 items-center min-w-0">
            <div className="relative w-7 h-7 rounded-[10px] overflow-hidden bg-gradient-to-b from-brand-gradientFrom to-brand-gradientTo shrink-0">
              <Image src={`${A}/logo-bg.jpg`} alt="" fill sizes="28px" className="object-cover" />
              <Image
                src={`${A}/logo-mark.svg`}
                alt=""
                width={20}
                height={20}
                className="absolute inset-0 m-auto"
              />
            </div>
            <span className="font-bricolage font-bold text-[18px] tracking-[-0.06em] text-ink-primary leading-[1.4]">
              VedaAI
            </span>
          </Link>
          <div className="flex gap-2 items-center shrink-0">
            <button
              type="button"
              className="relative w-8 h-8 bg-surface-off rounded-full flex items-center justify-center shrink-0"
              aria-label="Notifications"
            >
              <svg width="16" height="18" viewBox="0 0 20 22" fill="none">
                <path
                  d="M10 2C6.13 2 3 5.13 3 9v4l-1.29 1.29A1 1 0 0 0 2.42 16h15.16a1 1 0 0 0 .71-1.71L17 13V9c0-3.87-3.13-7-7-7Z"
                  stroke="#303030"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 19a2 2 0 0 0 4 0"
                  stroke="#303030"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute top-[4px] right-[6px] w-2 h-2 bg-brand-orange rounded-full ring-2 ring-surface-off" />
            </button>
            <Image
              src={`${A}/avatar-john.jpg`}
              alt="John Doe"
              width={28}
              height={28}
              className="rounded-full object-cover bg-surface-off shrink-0"
            />
            <button type="button" aria-label="Menu" className="w-5 h-5 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="#303030" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 pt-2 pb-28 w-full max-w-full overflow-x-hidden min-w-0">{children}</div>

      {/* Floating + button + bottom tab bar */}
      <div className="sticky bottom-0 z-20 px-2 pb-3 w-full">
        {showFab && (
          <div className="flex justify-end mb-3 pr-1">
            <button
              type="button"
              className="bg-white shadow-sidebar rounded-full w-12 h-12 flex items-center justify-center"
              aria-label="Create"
            >
              <Image src={`${M}/plus-fab.svg`} alt="" width={20} height={20} />
            </button>
          </div>
        )}
        <nav className="bg-button-primary rounded-3xl h-[68px] px-2 flex items-center justify-between shadow-sidebar w-full">
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`flex flex-col items-center gap-1 flex-1 min-w-0 ${
                  isActive ? "text-white" : "text-white/25"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{t.icon}</span>
                <span className="font-bricolage font-semibold text-[10px] tracking-[-0.04em] leading-[1.4] whitespace-nowrap">
                  {t.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MobileEmptyState() {
  return (
    <div className="flex flex-col items-center text-center px-4 pt-8">
      <div className="relative w-[220px] h-[220px] mb-3 flex items-center justify-center">
        <Image
          src={`${M}/illust-bg.svg`}
          alt=""
          width={176}
          height={176}
          className="absolute inset-0 m-auto"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[92px] h-[114px] bg-white rounded-2xl shadow-[0_14px_22px_rgba(146,146,146,0.19)] p-3 flex flex-col gap-2">
            <span className="block bg-[#011625] h-2 w-9 rounded-full" />
            <span className="block bg-surface-off40 h-2 w-full rounded-full" />
            <span className="block bg-surface-off40 h-2 w-full rounded-full" />
            <span className="block bg-surface-off40 h-2 w-full rounded-full" />
            <span className="block bg-surface-off40 h-2 w-3/4 rounded-full" />
          </div>
        </div>
        <Image
          src={`${M}/illust-doodles.svg`}
          alt=""
          width={208}
          height={131}
          className="absolute inset-0 m-auto pointer-events-none"
        />
        <Image
          src={`${M}/illust-cloud.svg`}
          alt=""
          width={56}
          height={36}
          className="absolute right-2 top-4"
        />
        <Image
          src={`${M}/illust-lens.svg`}
          alt=""
          width={104}
          height={104}
          className="absolute right-[8px] bottom-[18px]"
        />
      </div>
      <h2 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4] mt-3">
        No assignments yet
      </h2>
      <p className="font-bricolage text-base tracking-[-0.04em] text-ink-secondary/80 leading-[1.4] mt-3 max-w-sm">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <button
        type="button"
        className="bg-button-primary border-[1.5px] border-white/50 flex gap-2 items-center px-6 py-3 rounded-[48px] text-white mt-6"
      >
        <Image src={`${A}/plus-bold.svg`} alt="" width={18} height={18} />
        <span className="font-bricolage font-medium text-base tracking-[-0.04em]">
          Create Your First Assignment
        </span>
      </button>
    </div>
  );
}
