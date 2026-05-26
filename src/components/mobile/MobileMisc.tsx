"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/store/profile";
import { api } from "@/lib/api";

export function MobileProfile() {
  const profile = useProfile((s) => s.profile);
  const setProfile = useProfile((s) => s.setProfile);
  return (
    <div className="flex flex-col gap-3 pt-2 pb-6">
      <Header title="Profile" subtitle="Manage your info." />
      <section className="bg-white rounded-2xl p-4 flex flex-col gap-3">
        <MField
          label="Full name"
          value={profile.name}
          onChange={(v) => setProfile({ name: v })}
        />
        <MField label="Email" value={profile.email} onChange={(v) => setProfile({ email: v })} />
        <MField label="Role" value={profile.role} onChange={(v) => setProfile({ role: v })} />
        <MField
          label="School"
          value={profile.school}
          onChange={(v) => setProfile({ school: v })}
        />
        <MField
          label="Bio"
          value={profile.bio}
          onChange={(v) => setProfile({ bio: v })}
          textarea
        />
      </section>
    </div>
  );
}

export function MobileSettings() {
  const settings = useProfile((s) => s.settings);
  const setSettings = useProfile((s) => s.setSettings);
  return (
    <div className="flex flex-col gap-3 pt-2 pb-6">
      <Header title="Settings" subtitle="Generation defaults." />
      <section className="bg-white rounded-2xl p-4 flex flex-col gap-3">
        <MField
          label="Default subject"
          value={settings.defaultSubject}
          onChange={(v) => setSettings({ defaultSubject: v })}
        />
        <MField
          label="Default grade"
          value={settings.defaultGrade}
          onChange={(v) => setSettings({ defaultGrade: v })}
        />
        <MField
          label="Default school"
          value={settings.defaultSchool}
          onChange={(v) => setSettings({ defaultSchool: v })}
        />
        <MToggle
          label="Email me when ready"
          value={settings.emailOnReady}
          onChange={(v) => setSettings({ emailOnReady: v })}
        />
        <MToggle
          label="Play a sound when ready"
          value={settings.soundOnReady}
          onChange={(v) => setSettings({ soundOnReady: v })}
        />
      </section>
    </div>
  );
}

export function MobileAnalytics() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.analytics>> | null>(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await api.analytics();
        if (alive) setStats(r);
      } catch {}
    }
    load();
    const i = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);
  return (
    <div className="flex flex-col gap-3 pt-2 pb-6">
      <Header title="Analytics" subtitle="Live across all your papers." />
      {!stats ? (
        <div className="bg-white rounded-2xl p-6 font-bricolage text-sm text-ink-muted">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Assignments" value={stats.total} />
          <Tile label="Questions" value={stats.totalQuestions} />
          <Tile label="Marks" value={stats.totalMarks} />
          <Tile label="Subjects" value={Object.keys(stats.bySubject).length} />
        </div>
      )}
    </div>
  );
}

export function MobileSimplePage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 pb-6">
      <Header title={title} subtitle={subtitle} />
      <div className="bg-white rounded-2xl p-6 font-bricolage text-sm text-ink-muted text-center">
        Available on desktop — open from a larger screen for the full layout. Or{" "}
        <Link className="underline text-ink-primary" href="/">
          create a paper
        </Link>
        .
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-2">
      <h1 className="font-bricolage font-bold text-[18px] tracking-[-0.04em] text-ink-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/70">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MField({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white border border-surface-off40 rounded-2xl px-4 py-3 font-bricolage text-sm text-ink-primary outline-none focus:border-ink-primary min-h-[80px] resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white border border-surface-off40 rounded-pill h-11 px-4 font-bricolage text-sm text-ink-primary outline-none focus:border-ink-primary"
        />
      )}
    </div>
  );
}

function MToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between bg-white border border-surface-off40 rounded-2xl px-4 py-3">
      <span className="font-bricolage text-sm text-ink-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full p-0.5 transition ${
          value ? "bg-button-primary" : "bg-surface-off40"
        }`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transition ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col gap-1">
      <span className="font-bricolage text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <span className="font-bricolage font-bold text-[22px] text-ink-primary leading-none">
        {value}
      </span>
    </div>
  );
}
