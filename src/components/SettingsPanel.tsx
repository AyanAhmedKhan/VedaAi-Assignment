"use client";
import { useState } from "react";
import { useProfile } from "@/store/profile";

export function SettingsPanel() {
  const settings = useProfile((s) => s.settings);
  const setSettings = useProfile((s) => s.setSettings);
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
            Settings
          </h1>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55">
            Defaults and preferences for paper generation.
          </p>
        </div>
      </div>

      <section className="bg-white/70 rounded-[28px] p-8 flex flex-col gap-6">
        <h2 className="font-bricolage font-bold text-[18px] text-ink-primary">
          Generation defaults
        </h2>
        <div className="grid grid-cols-3 gap-5">
          <SField
            label="Default subject"
            value={settings.defaultSubject}
            onChange={(v) => setSettings({ defaultSubject: v })}
          />
          <SField
            label="Default grade"
            value={settings.defaultGrade}
            onChange={(v) => setSettings({ defaultGrade: v })}
          />
          <SField
            label="Default school"
            value={settings.defaultSchool}
            onChange={(v) => setSettings({ defaultSchool: v })}
          />
        </div>

        <h2 className="font-bricolage font-bold text-[18px] text-ink-primary mt-2">
          Appearance
        </h2>
        <div className="flex gap-3">
          {(["system", "light", "dark"] as const).map((t) => (
            <label
              key={t}
              className={`px-5 py-2 rounded-pill font-bricolage text-sm cursor-pointer border ${
                settings.theme === t
                  ? "bg-button-primary text-white border-button-primary"
                  : "bg-white border-surface-off40 text-ink-primary"
              }`}
            >
              <input
                type="radio"
                value={t}
                checked={settings.theme === t}
                onChange={() => setSettings({ theme: t })}
                className="hidden"
              />
              {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
            </label>
          ))}
        </div>

        <h2 className="font-bricolage font-bold text-[18px] text-ink-primary mt-2">
          Notifications
        </h2>
        <Toggle
          label="Email me when generation completes"
          value={settings.emailOnReady}
          onChange={(v) => setSettings({ emailOnReady: v })}
        />
        <Toggle
          label="Play a sound when a paper is ready"
          value={settings.soundOnReady}
          onChange={(v) => setSettings({ soundOnReady: v })}
        />

        <div className="flex items-center gap-3 pt-2">
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

function SField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-surface-off40 rounded-pill h-11 px-4 font-bricolage text-sm text-ink-primary outline-none focus:border-ink-primary"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between bg-white border border-surface-off40 rounded-2xl px-4 py-3 cursor-pointer">
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
