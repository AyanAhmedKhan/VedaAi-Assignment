"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssignmentForm } from "@/store/assignmentForm";
import { api } from "@/lib/api";
import { QUESTION_TYPE_PRESETS } from "../QuestionTypeSelect";
import {
  PresetCombobox,
  SUBJECT_PRESETS,
  GRADE_PRESETS,
} from "../PresetCombobox";

const A = "/figma/screen1";

export function MobileCreateForm() {
  const router = useRouter();
  const {
    subject,
    grade,
    school,
    dueDate,
    fileName,
    instructions,
    questionTypes,
    errors,
    submitting,
    setField,
    updateType,
    addType,
    removeType,
    validate,
    setSubmitting,
  } = useAssignmentForm();

  const [submitError, setSubmitError] = useState("");
  const totals = useMemo(() => {
    const totalQ = questionTypes.reduce((s, t) => s + t.count, 0);
    const totalM = questionTypes.reduce((s, t) => s + t.count * t.marks, 0);
    return { totalQ, totalM };
  }, [questionTypes]);

  async function handleSubmit() {
    setSubmitError("");
    const { ok } = validate();
    if (!ok) return;
    try {
      setSubmitting(true);
      const res = await api.createAssignment({
        subject,
        grade,
        school,
        dueDate,
        instructions,
        fileName,
        questionTypes,
      });
      router.push(`/output?id=${res.id}`);
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setField("fileName", f.name);
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex gap-3 items-center px-2">
        <div className="w-3 h-3 rounded-full bg-[#1FB95A]" />
        <div>
          <h1 className="font-bricolage font-bold text-[18px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
            Create Assignment
          </h1>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55 leading-[1.4]">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      <div className="flex gap-2 px-2">
        <div className="flex-1 h-[3px] bg-ink-primary rounded-full" />
        <div className="flex-1 h-[3px] bg-surface-off40 rounded-full" />
      </div>

      <section className="bg-white/60 rounded-3xl p-5 flex flex-col gap-4">
        <header>
          <h2 className="font-bricolage font-bold text-[18px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
            Assignment Details
          </h2>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/80 leading-[1.4]">
            Basic information about your assignment
          </p>
        </header>

        <MobileField label="Subject" error={errors.subject}>
          <PresetCombobox
            value={subject}
            onChange={(v) => setField("subject", v)}
            options={SUBJECT_PRESETS}
            placeholder="Select subject"
            customLabel="Add custom subject"
            invalid={!!errors.subject}
          />
        </MobileField>
        <MobileField label="Class / Grade" error={errors.grade}>
          <PresetCombobox
            value={grade}
            onChange={(v) => setField("grade", v)}
            options={GRADE_PRESETS}
            placeholder="Select class"
            customLabel="Add custom grade"
            invalid={!!errors.grade}
          />
        </MobileField>
        <MobileField label="School" error={errors.school}>
          <input
            value={school}
            onChange={(e) => setField("school", e.target.value)}
            placeholder="School name"
            className="bg-white border border-surface-off40 rounded-pill h-11 px-4 w-full font-bricolage text-sm text-ink-primary outline-none"
          />
        </MobileField>

        <label className="bg-white rounded-2xl border-[1.75px] border-dashed border-black/20 flex flex-col gap-2 items-center justify-center px-5 py-5 cursor-pointer">
          <input type="file" onChange={onFile} accept=".pdf,.txt,image/*" className="hidden" />
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Image src={`${A}/icon-upload-cloud.svg`} alt="" width={22} height={22} />
          </div>
          <div className="text-center">
            <p className="font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary leading-[1.4]">
              {fileName || "Choose a file or drag & drop"}
            </p>
            <p className="font-bricolage text-xs tracking-[-0.04em] text-ink-muted">
              PDF, TXT, image
            </p>
          </div>
        </label>

        <MobileField label="Due Date" error={errors.dueDate}>
          <input
            value={dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
            placeholder="DD-MM-YYYY"
            className="border-[1.25px] border-surface-off40 rounded-pill h-11 px-4 bg-white font-bricolage text-sm text-ink-primary outline-none w-full"
          />
        </MobileField>

        <div className="flex flex-col gap-3">
          <label className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
            Question Type
          </label>
          {questionTypes.map((t, i) => {
            const isCustom = !QUESTION_TYPE_PRESETS.find((p) => p.id === t.id);
            return (
            <div key={t.id} className="flex flex-col gap-2 bg-white rounded-2xl p-3 border border-black/5">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <select
                    value={isCustom ? "__custom" : t.id}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__custom") {
                        updateType(i, {
                          id: `custom-${Date.now()}`,
                          label: isCustom ? t.label : "",
                        });
                      } else {
                        const preset = QUESTION_TYPE_PRESETS.find((p) => p.id === v);
                        if (preset) updateType(i, { id: preset.id, label: preset.label });
                      }
                    }}
                    className="appearance-none w-full pl-3 pr-8 h-9 bg-surface-off rounded-pill font-bricolage font-semibold text-sm text-ink-primary outline-none border border-transparent focus:border-ink-primary"
                  >
                    {QUESTION_TYPE_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                    <option value="__custom">+ Custom…</option>
                  </select>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-secondary"
                  >
                    <path
                      d="M3.5 5.25 7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => removeType(i)}
                  aria-label="Remove"
                  className="w-7 h-7 rounded-full bg-surface-off hover:bg-surface-off40 flex items-center justify-center shrink-0"
                >
                  <Image src={`${A}/x-close.svg`} alt="" width={12} height={12} />
                </button>
              </div>
              {isCustom && (
                <input
                  value={t.label}
                  onChange={(e) => updateType(i, { label: e.target.value })}
                  placeholder="Custom question type name"
                  className="bg-surface-off border border-transparent focus:border-ink-primary focus:bg-white rounded-pill h-9 px-3 font-bricolage text-sm text-ink-primary outline-none"
                />
              )}
              <div className="flex gap-3 text-xs font-bricolage text-ink-primary">
                <div className="flex items-center gap-2">
                  <span>Qs</span>
                  <Stepper value={t.count} onChange={(v) => updateType(i, { count: v })} />
                </div>
                <div className="flex items-center gap-2">
                  <span>Marks</span>
                  <Stepper value={t.marks} onChange={(v) => updateType(i, { marks: v })} />
                </div>
              </div>
            </div>
            );
          })}
          <button
            type="button"
            onClick={addType}
            className="flex gap-2 items-center self-start"
          >
            <span className="bg-button-dark p-1.5 rounded-full inline-flex items-center justify-center">
              <Image src={`${A}/plus-bold.svg`} alt="" width={16} height={16} />
            </span>
            <span className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
              Add Question Type
            </span>
          </button>
          {errors.questionTypes && (
            <span className="text-xs text-red-600 font-bricolage">{errors.questionTypes}</span>
          )}
          <div className="flex justify-between text-xs font-bricolage font-medium text-ink-primary pt-1">
            <span>Total Q: {totals.totalQ}</span>
            <span>Total Marks: {totals.totalM}</span>
          </div>
        </div>

        <MobileField label="Additional Information">
          <textarea
            value={instructions}
            onChange={(e) => setField("instructions", e.target.value)}
            placeholder="e.g. 3 hour exam, include 1 case study…"
            className="bg-white/25 border-[1.25px] border-dashed border-surface-off40 rounded-2xl min-h-[80px] p-3 font-bricolage text-sm text-ink-primary outline-none w-full resize-none"
          />
        </MobileField>

        {submitError && (
          <span className="text-xs text-red-600 font-bricolage">{submitError}</span>
        )}

        <div className="flex items-center justify-between pt-3 mt-1 border-t border-surface-off40/60">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white flex gap-1 items-center px-5 py-2.5 rounded-pill mt-3"
          >
            <Image src={`${A}/arrow-left.svg`} alt="" width={18} height={18} />
            <span className="font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary">
              Previous
            </span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="bg-button-primary border-[1.5px] border-white/50 flex gap-1 items-center px-5 py-2.5 rounded-pill text-white disabled:opacity-60 mt-3"
          >
            <span className="font-bricolage font-medium text-sm tracking-[-0.04em]">
              {submitting ? "Generating…" : "Generate"}
            </span>
            <Image src={`${A}/arrow-right.svg`} alt="" width={18} height={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

function MobileField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-600 font-bricolage">{error}</span>}
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white h-9 w-[88px] rounded-pill flex items-center justify-between px-2 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-4 h-4"
      >
        <Image src={`${A}/minus-stroke.svg`} alt="" width={12} height={2} />
      </button>
      <span className="font-bricolage font-medium text-sm">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} className="w-4 h-4">
        <Image src={`${A}/plus-thin.svg`} alt="" width={10} height={10} />
      </button>
    </div>
  );
}
