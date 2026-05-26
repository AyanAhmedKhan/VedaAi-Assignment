"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Assignment } from "@/types/assignment";
import { Select } from "./Select";

const S2 = "/figma/screen2";

function StatusPill({ status }: { status: Assignment["status"] }) {
  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-inter font-semibold capitalize ${map[status]}`}
    >
      {status}
    </span>
  );
}

function Dropdown({
  id,
  onDelete,
  onDuplicate,
  open,
}: {
  id: string;
  onDelete: () => void;
  onDuplicate: () => void;
  open: boolean;
}) {
  return (
    <div
      className={`absolute top-[54px] right-4 z-20 bg-white rounded-2xl border border-black/5 flex flex-col gap-0.5 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] min-w-[180px] origin-top-right transition-all duration-150 ${
        open
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-[0.97] -translate-y-1 pointer-events-none"
      }`}
    >
      <Link
        href={`/output?id=${id}`}
        className="text-left h-9 px-3 rounded-xl font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary hover:bg-surface-off flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1.5 7s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        View Assignment
      </Link>
      <button
        type="button"
        onClick={onDuplicate}
        className="text-left h-9 px-3 rounded-xl font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary hover:bg-surface-off flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="4"
            y="4"
            width="7"
            height="8"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M3 9V3a1 1 0 0 1 1-1h6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        Duplicate
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-left h-9 px-3 rounded-xl font-bricolage font-medium text-sm tracking-[-0.04em] text-[#c53535] hover:bg-rose-50 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2.5 3.5h9M5.5 3.5V2.5h3v1M3.5 3.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8M6 6v4M8 6v4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Delete
      </button>
    </div>
  );
}

function AssignmentCard({
  card,
  open,
  onToggleMenu,
  onDelete,
  onDuplicate,
}: {
  card: Assignment;
  open: boolean;
  onToggleMenu: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const assigned = (card.createdAt ?? "").slice(0, 10);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) onToggleMenu();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onToggleMenu();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggleMenu]);
  return (
    <div ref={menuRef} className="relative w-full h-[162px] shrink-0">
      <article className="bg-white rounded-3xl p-6 flex flex-col justify-between w-full h-full">
        <div className="flex items-start justify-between w-full">
          <Link
            href={`/output?id=${card._id}`}
            className="font-bricolage font-extrabold text-[22px] tracking-[-0.04em] text-ink-primary leading-[1.2] flex-1 pr-4 hover:underline truncate"
          >
            {card.title || `${card.subject} — ${card.grade}`}
          </Link>
          <button
            type="button"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={onToggleMenu}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              open ? "bg-surface-off" : "hover:bg-surface-off"
            }`}
          >
            <Image src={`${S2}/more-vertical.svg`} alt="" width={4} height={16} />
          </button>
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="font-bricolage text-sm tracking-[-0.04em] text-black/50">
            <span className="font-extrabold text-ink-primary">Created</span>
            {" : "}
            {assigned || "—"}
          </span>
          <div className="flex items-center gap-2">
            <StatusPill status={card.status} />
            {card.dueDate && (
              <span className="font-bricolage text-sm tracking-[-0.04em] text-black/50">
                <span className="font-extrabold text-ink-primary">Due</span>
                {" : "}
                {card.dueDate}
              </span>
            )}
          </div>
        </div>
      </article>
      <Dropdown
        id={card._id}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        open={open}
      />
    </div>
  );
}

export function AssignmentsList() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Assignment["status"]>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const list = await api.listAssignments();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((a) => (filter === "all" ? true : a.status === filter))
      .filter((a) =>
        query
          ? (a.title + " " + a.subject + " " + a.grade)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      );
  }, [items, query, filter]);

  if (!loading && items.length === 0) {
    return <AssignmentsEmpty />;
  }

  return (
    <div className="absolute left-[327px] top-[90px] w-[1100px] flex flex-col gap-3 z-[1]">
      <div className="flex items-center px-2 w-full">
        <div className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-[#1FB95A]" />
          <div className="flex flex-col gap-0.5 text-left">
            <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
              Assignments
            </h1>
            <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55 leading-[1.4]">
              Manage and review every paper your AI assistant has drafted.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="ml-auto bg-button-primary border-[1.5px] border-white/30 text-white font-bricolage font-medium text-sm px-5 py-2 rounded-pill"
        >
          + Create
        </Link>
      </div>

      <div className="bg-white rounded-[20px] h-16 flex items-center justify-between px-4 w-full gap-4 relative">
        <Select<typeof filter>
          value={filter}
          onChange={(v) => setFilter(v)}
          width={210}
          ariaLabel="Filter by status"
          leading={
            <Image src={`${S2}/filter-icon.svg`} alt="" width={16} height={16} />
          }
          options={[
            { value: "all", label: "All statuses", hint: String(items.length), swatch: "#A9A9A9" },
            {
              value: "pending",
              label: "Pending",
              hint: String(items.filter((a) => a.status === "pending").length),
              swatch: "#F59E0B",
            },
            {
              value: "processing",
              label: "Processing",
              hint: String(items.filter((a) => a.status === "processing").length),
              swatch: "#3B82F6",
            },
            {
              value: "ready",
              label: "Ready",
              hint: String(items.filter((a) => a.status === "ready").length),
              swatch: "#10B981",
            },
            {
              value: "failed",
              label: "Failed",
              hint: String(items.filter((a) => a.status === "failed").length),
              swatch: "#EF4444",
            },
          ]}
        />
        <div className="w-[380px] flex items-center">
          <div className="flex-1 h-11 border border-black/20 rounded-pill flex items-center gap-3 px-4 focus-within:border-ink-primary transition-colors">
            <Image src={`${S2}/search-icon.svg`} alt="" width={20} height={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Assignment"
              className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary bg-transparent outline-none w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {filtered.map((a) => (
          <AssignmentCard
            key={a._id}
            card={a}
            open={openMenu === a._id}
            onToggleMenu={() => setOpenMenu(openMenu === a._id ? null : a._id)}
            onDelete={async () => {
              setOpenMenu(null);
              await api.deleteAssignment(a._id);
              load();
            }}
            onDuplicate={async () => {
              setOpenMenu(null);
              await api.duplicate(a._id);
              load();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function AssignmentsEmpty() {
  const S3 = "/figma/screen3";
  return (
    <div className="absolute left-[327px] top-[90px] w-[1100px] h-[678px] flex flex-col items-center justify-center gap-8 z-[1]">
      <div className="flex flex-col gap-3 items-center">
        <div className="relative w-[300px] h-[300px]">
          <Image src={`${S3}/illust-bg.svg`} alt="" width={240} height={240} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+9px)] w-[124px] h-[155px] bg-white rounded-2xl shadow-[0_20px_30px_rgba(146,146,146,0.19)] p-3 flex flex-col gap-[18px]">
            <span className="block bg-[#011625] h-3 w-12 rounded-full" />
            <span className="block bg-[#d4d4d4] h-3 w-full rounded-full" />
            <span className="block bg-[#d4d4d4] h-3 w-full rounded-full" />
            <span className="block bg-[#d4d4d4] h-3 w-full rounded-full" />
            <span className="block bg-[#d4d4d4] h-3 w-full rounded-full" />
          </div>
          <Image src={`${S3}/illust-doodles.svg`} alt="" width={284} height={179} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <Image src={`${S3}/illust-cloud.svg`} alt="" width={75} height={50} className="absolute right-[14px] top-[34px]" />
          <Image src={`${S3}/illust-lens.svg`} alt="" width={163} height={163} className="absolute right-[14px] bottom-[12px]" />
        </div>
        <div className="flex flex-col gap-0.5 items-center justify-center text-center w-[486px]">
          <h2 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4] whitespace-nowrap">
            No assignments yet
          </h2>
          <p className="font-bricolage text-base tracking-[-0.04em] text-ink-secondary/80 leading-[1.4]">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
        </div>
      </div>
      <Link
        href="/"
        className="bg-button-primary border-[1.5px] border-white/50 flex gap-1 items-center px-6 py-3 rounded-[48px] text-white"
      >
        <Image src={`${S3}/plus-bold.svg`} alt="" width={20} height={20} />
        <span className="font-bricolage font-medium text-base tracking-[-0.04em]">
          Create Your First Assignment
        </span>
      </Link>
    </div>
  );
}
