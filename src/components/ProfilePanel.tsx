"use client";
import Image from "next/image";
import { useState } from "react";
import { useProfile } from "@/store/profile";

const A = "/figma/screen1";

export function ProfilePanel() {
  const profile = useProfile((s) => s.profile);
  const setProfile = useProfile((s) => s.setProfile);
  const [saved, setSaved] = useState(false);

  function onSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="absolute left-[327px] top-[90px] w-[1100px] flex flex-col gap-4 z-[1]">
      <div className="flex items-center px-2">
        <div className="w-3 h-3 rounded-full bg-[#1FB95A] mr-3" />
        <div>
          <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
            Profile
          </h1>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55">
            Manage your personal information.
          </p>
        </div>
      </div>

      <section className="bg-white/70 rounded-[28px] p-8 flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <Image
            src={`${A}/avatar-john.jpg`}
            alt={profile.name}
            width={96}
            height={96}
            className="rounded-full object-cover bg-surface-off"
          />
          <div>
            <h2 className="font-bricolage font-bold text-[22px] tracking-[-0.04em] text-ink-primary">
              {profile.name}
            </h2>
            <p className="font-bricolage text-sm text-ink-secondary">
              {profile.role} · {profile.school}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <PField
            label="Full name"
            value={profile.name}
            onChange={(v) => setProfile({ name: v })}
          />
          <PField
            label="Email"
            value={profile.email}
            onChange={(v) => setProfile({ email: v })}
          />
          <PField
            label="Role"
            value={profile.role}
            onChange={(v) => setProfile({ role: v })}
          />
          <PField
            label="School"
            value={profile.school}
            onChange={(v) => setProfile({ school: v })}
          />
        </div>
        <PField
          label="Bio"
          value={profile.bio}
          onChange={(v) => setProfile({ bio: v })}
          textarea
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="bg-button-primary border border-white/30 text-white font-bricolage font-medium text-sm px-6 py-2.5 rounded-pill"
          >
            Save changes
          </button>
          {saved && (
            <span className="font-bricolage text-sm text-emerald-700">Saved ✓</span>
          )}
        </div>
      </section>
    </div>
  );
}

function PField({
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
          className="bg-white border border-surface-off40 rounded-2xl px-4 py-3 font-bricolage text-sm text-ink-primary outline-none focus:border-ink-primary min-h-[90px] resize-none"
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
