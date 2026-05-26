"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useProfile } from "@/store/profile";

const A = "/figma/screen1";

type Notif = {
  id: string;
  title: string;
  body: string;
  assignmentId?: string;
  read: boolean;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TopBar({
  title = "Assignment",
  withSpark = false,
  leadingIcon,
  backHref = "/",
}: {
  title?: string;
  withSpark?: boolean;
  leadingIcon?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const profile = useProfile((s) => s.profile);

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  async function loadNotifs() {
    try {
      const r = await api.notifications();
      setNotifs(r.items);
      setUnread(r.unread);
    } catch {}
  }

  useEffect(() => {
    loadNotifs();
    const i = setInterval(loadNotifs, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function openNotifs() {
    setNotifOpen((v) => !v);
    setMenuOpen(false);
    if (!notifOpen && unread > 0) {
      try {
        await api.markNotificationsRead();
        setUnread(0);
        setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
      } catch {}
    }
  }

  return (
    <div
      ref={wrapRef}
      className="absolute left-[327px] top-3 w-[1100px] h-14 bg-white/75 rounded-2xl pl-6 pr-3 flex items-center gap-2.5 z-20"
    >
      <Link
        href={backHref}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0"
        aria-label="Back"
      >
        <Image src={`${A}/arrow-left-24.svg`} alt="" width={24} height={24} />
      </Link>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {withSpark && (
          <Image src="/figma/screen4/topbar-spark.svg" alt="" width={18} height={18} />
        )}
        {leadingIcon && (
          <Image src={leadingIcon} alt="" width={20} height={20} className="opacity-80" />
        )}
        <span className="font-bricolage font-semibold text-base tracking-[-0.04em] text-ink-muted truncate">
          {title}
        </span>
      </div>

      {/* Command palette hint */}
      <button
        type="button"
        aria-label="Open command palette"
        onClick={() => {
          const evt = new KeyboardEvent("keydown", {
            key: "k",
            ctrlKey: !/Mac|iPhone|iPad/.test(navigator.platform),
            metaKey: /Mac|iPhone|iPad/.test(navigator.platform),
            bubbles: true,
          });
          document.dispatchEvent(evt);
        }}
        className="hidden md:flex h-9 px-3 rounded-full bg-surface-off hover:bg-surface-off40/60 items-center gap-2 font-bricolage text-xs text-ink-secondary border border-transparent hover:border-black/5 transition"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Search</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white text-ink-secondary border border-black/5">
          ⌘K
        </kbd>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          onClick={openNotifs}
          className="relative w-9 h-9 bg-surface-off rounded-full flex items-center justify-center"
          aria-label="Notifications"
        >
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2C6.13 2 3 5.13 3 9v4l-1.29 1.29A1 1 0 0 0 2.42 16h15.16a1 1 0 0 0 .71-1.71L17 13V9c0-3.87-3.13-7-7-7Z"
              stroke="#303030"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 19a2 2 0 0 0 4 0" stroke="#303030" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unread > 0 && (
            <span className="absolute top-[4px] right-[5px] min-w-[16px] h-4 px-1 bg-brand-orange text-white text-[10px] font-bold leading-none rounded-full ring-2 ring-surface-off flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <div
          className={`absolute right-0 top-[48px] w-[380px] bg-white/95 backdrop-blur-xl rounded-2xl border border-black/5 shadow-[0_24px_50px_rgba(0,0,0,0.16)] flex flex-col origin-top-right transition-all duration-150 overflow-hidden ${
            notifOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
          }`}
        >
          <div className="px-4 py-3 flex items-center justify-between border-b border-surface-off40/60 bg-gradient-to-br from-white to-surface-off/40">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 20 22" fill="none">
                  <path
                    d="M10 2C6.13 2 3 5.13 3 9v4l-1.29 1.29A1 1 0 0 0 2.42 16h15.16a1 1 0 0 0 .71-1.71L17 13V9c0-3.87-3.13-7-7-7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-bricolage font-bold text-[15px] text-ink-primary">
                  Notifications
                </span>
                <span className="font-bricolage text-[11px] text-ink-muted">
                  {notifs.length} total · {unread} unread
                </span>
              </div>
            </div>
            {unread > 0 ? (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await api.markNotificationsRead();
                  setUnread(0);
                  setNotifs((ns) => ns.map((x) => ({ ...x, read: true })));
                }}
                className="text-[11px] font-bricolage font-semibold text-brand-orange hover:underline"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-[11px] font-bricolage text-ink-muted">All caught up</span>
            )}
          </div>
          <div className="p-1.5 flex flex-col gap-0.5 max-h-[440px] overflow-auto">
            {notifs.length === 0 && (
              <div className="px-2 py-10 text-center flex flex-col items-center gap-2">
                <span className="w-12 h-12 rounded-full bg-surface-off flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 22" fill="none" className="text-ink-muted">
                    <path
                      d="M10 2C6.13 2 3 5.13 3 9v4l-1.29 1.29A1 1 0 0 0 2.42 16h15.16a1 1 0 0 0 .71-1.71L17 13V9c0-3.87-3.13-7-7-7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="font-bricolage font-semibold text-sm text-ink-primary">
                  You're all caught up
                </p>
                <p className="font-bricolage text-xs text-ink-muted">
                  New activity will show up here.
                </p>
              </div>
            )}
            {notifs.map((n) => (
              <NotifItem key={n.id} n={n} onNavigate={() => setNotifOpen(false)} />
            ))}
          </div>
        </div>
      </div>

      {/* Profile menu */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setMenuOpen((v) => !v);
            setNotifOpen(false);
          }}
          className="flex gap-2 items-center px-3 py-1.5 rounded-xl"
        >
          <Image
            src={`${A}/avatar-john.jpg`}
            alt={profile.name}
            width={32}
            height={32}
            className="rounded-full object-cover bg-surface-off"
          />
          <div className="flex gap-1 items-center">
            <span className="font-bricolage font-semibold text-base tracking-[-0.04em] text-ink-primary">
              {profile.name}
            </span>
            <Image src={`${A}/chevron-down-lg.svg`} alt="" width={24} height={24} />
          </div>
        </button>
        <div
          className={`absolute right-0 top-[52px] w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl border border-black/5 shadow-[0_24px_50px_rgba(0,0,0,0.16)] flex flex-col origin-top-right transition-all duration-150 overflow-hidden ${
            menuOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
          }`}
        >
          <div className="px-4 py-4 bg-gradient-to-br from-brand-orange/10 via-white to-white border-b border-surface-off40/60 flex items-center gap-3">
            <div className="relative">
              <Image
                src={`${A}/avatar-john.jpg`}
                alt={profile.name}
                width={44}
                height={44}
                className="rounded-full object-cover bg-surface-off ring-2 ring-white shadow"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bricolage font-bold text-[15px] text-ink-primary truncate leading-tight">
                {profile.name}
              </p>
              <p className="font-bricolage text-xs text-ink-secondary truncate">
                {profile.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-brand-orange/15 text-brand-orange font-bricolage font-semibold text-[10px] uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-brand-orange" />
                {profile.role}
              </span>
            </div>
          </div>
          <div className="px-1 py-1">
            <p className="px-3 pt-2 pb-1 font-bricolage text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              Account
            </p>
            <MenuItem
              label="My Profile"
              hint="Edit personal info"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2.5 12c.5-2.4 2.4-3.6 4.5-3.6S11 9.6 11.5 12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              }
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
            />
            <MenuItem
              label="Settings"
              hint="Defaults & preferences"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M7 1.5v1.5M7 11v1.5M12.5 7H11M3 7H1.5M10.9 3.1l-1 1M4.1 9.9l-1 1M10.9 10.9l-1-1M4.1 4.1l-1-1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              }
              onClick={() => {
                setMenuOpen(false);
                router.push("/settings");
              }}
            />
            <p className="px-3 pt-2 pb-1 mt-1 font-bricolage text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              Workspace
            </p>
            <MenuItem
              label="Analytics"
              hint="See teaching insights"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 12V6M5.5 12V3M9 12V8M12.5 12V5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              }
              onClick={() => {
                setMenuOpen(false);
                router.push("/analytics");
              }}
            />
            <MenuItem
              label="My Library"
              hint="All finished papers"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 2.5h6.5L11 4v7.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path d="M9 2.5V4h2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M5 7h4M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              }
              onClick={() => {
                setMenuOpen(false);
                router.push("/library");
              }}
            />
            <div className="h-px bg-surface-off40/60 my-1.5 mx-2" />
            <MenuItem
              label="Sign out"
              icon={
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M8.5 2.5h2A1 1 0 0 1 11.5 3.5v7a1 1 0 0 1-1 1h-2M6 4.5 3 7l3 2.5M3 7h6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              onClick={() => setMenuOpen(false)}
              danger
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  label,
  hint,
  onClick,
  danger,
  icon,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left px-2 py-2 rounded-xl font-bricolage flex items-center gap-2.5 transition-colors ${
        danger
          ? "text-[#c53535] hover:bg-rose-50"
          : "text-ink-primary hover:bg-surface-off"
      }`}
    >
      {icon && (
        <span
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
            danger
              ? "bg-rose-50 group-hover:bg-rose-100"
              : "bg-surface-off group-hover:bg-white group-hover:shadow-sm"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-sm tracking-[-0.04em] truncate leading-tight">
          {label}
        </span>
        {hint && (
          <span className="block font-bricolage text-[11px] text-ink-muted truncate leading-tight">
            {hint}
          </span>
        )}
      </span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          danger ? "text-[#c53535]" : "text-ink-muted"
        }`}
      >
        <path
          d="m5.5 3.5 3.5 3.5-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function NotifItem({ n, onNavigate }: { n: Notif; onNavigate: () => void }) {
  const className = `px-3 py-2 rounded-xl flex gap-2 items-start transition-colors ${
    n.read ? "hover:bg-surface-off" : "bg-orange-50 hover:bg-orange-100"
  }`;

  const content = (
    <>
      <span
        className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
          n.read ? "bg-transparent" : "bg-brand-orange"
        }`}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bricolage font-semibold text-sm text-ink-primary truncate">
            {n.title}
          </span>
          <span className="font-bricolage text-[11px] text-ink-muted shrink-0">
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <span className="font-bricolage text-xs text-ink-secondary truncate">{n.body}</span>
      </div>
    </>
  );

  if (n.assignmentId) {
    return (
      <Link
        href={`/output?id=${n.assignmentId}`}
        onClick={onNavigate}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
