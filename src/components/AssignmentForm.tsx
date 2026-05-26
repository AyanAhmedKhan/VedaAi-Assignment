"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssignmentForm } from "@/store/assignmentForm";
import { useProfile } from "@/store/profile";
import { api } from "@/lib/api";
import { QuestionTypeSelect } from "./QuestionTypeSelect";
import {
  PresetCombobox,
  SUBJECT_PRESETS,
  GRADE_PRESETS,
} from "./PresetCombobox";

const A = "/figma/screen1";

function NumberStepper({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="bg-white flex items-center justify-between rounded-pill w-[100px] h-11 px-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-4 h-4 flex items-center justify-center"
        aria-label="Decrement"
      >
        <Image src={`${A}/minus-stroke.svg`} alt="" width={12} height={2} />
      </button>
      <span className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary leading-[1.4]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-4 h-4 flex items-center justify-center"
        aria-label="Increment"
      >
        <Image src={`${A}/plus-thin.svg`} alt="" width={10} height={10} />
      </button>
    </div>
  );
}

function StepProgress() {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex gap-3 items-center w-[815px]">
        <div className="flex-1 h-[3px] bg-ink-primary rounded-full" />
        <div className="flex-1 h-[3px] bg-surface-off40 rounded-full" />
      </div>
    </div>
  );
}

export function AssignmentForm() {
  const router = useRouter();
  const {
    subject,
    grade,
    school,
    dueDate,
    instructions,
    fileName,
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

  const settings = useProfile((s) => s.settings);
  useEffect(() => {
    // Seed empty fields from settings defaults on mount.
    if (!subject && settings.defaultSubject) setField("subject", settings.defaultSubject);
    if (!grade && settings.defaultGrade) setField("grade", settings.defaultGrade);
    if (!school && settings.defaultSchool) setField("school", settings.defaultSchool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Cmd/Ctrl + Enter submits the form from anywhere on the page
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        if (!submitting) handleSubmit();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, grade, school, dueDate, instructions, fileName, questionTypes, submitting]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setField("fileName", f.name);
  }

  return (
    <div className="absolute left-[327px] top-[78px] w-[1103px] flex flex-col gap-8 items-center rounded-[40px] overflow-clip">
      {/* Header row */}
      <div className="flex items-center p-2 w-full">
        <div className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-[#1FB95A]" />
          <div className="flex flex-col gap-0.5">
            <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
              Create Assignment
            </h1>
            <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55 leading-[1.4]">
              Set up a new assignment for your students
            </p>
          </div>
        </div>
      </div>

      <StepProgress />

      {/* Main card */}
      <section className="bg-white/50 rounded-[32px] p-8 w-[810px] flex flex-col gap-8 items-start">
        <header className="flex flex-col gap-0.5 items-start text-center">
          <h2 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
            Assignment Details
          </h2>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/80 leading-[1.4] w-[251px]">
            Basic information about your assignment
          </p>
        </header>

        <div className="flex flex-col gap-4 items-start w-full">
          {/* Subject / Grade / School */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <Field label="Subject" error={errors.subject}>
              <PresetCombobox
                value={subject}
                onChange={(v) => setField("subject", v)}
                options={SUBJECT_PRESETS}
                placeholder="Select subject"
                customLabel="Add custom subject"
                customPrompt="Custom subject name"
                invalid={!!errors.subject}
              />
            </Field>
            <Field label="Class / Grade" error={errors.grade}>
              <PresetCombobox
                value={grade}
                onChange={(v) => setField("grade", v)}
                options={GRADE_PRESETS}
                placeholder="Select class"
                customLabel="Add custom grade"
                customPrompt="Custom grade name"
                invalid={!!errors.grade}
              />
            </Field>
            <Field label="School" error={errors.school}>
              <input
                value={school}
                onChange={(e) => setField("school", e.target.value)}
                placeholder="School name"
                className="bg-white border border-surface-off40 rounded-pill h-11 px-4 w-full font-bricolage text-sm text-ink-primary outline-none focus:border-ink-primary"
              />
            </Field>
          </div>

          {/* Upload area */}
          <div className="flex flex-col gap-3 items-start w-full">
            <label className="bg-white rounded-3xl border-[1.75px] border-dashed border-black/20 flex flex-col gap-4 items-center justify-center px-8 py-6 w-full cursor-pointer">
              <input
                type="file"
                onChange={onFile}
                accept=".pdf,.txt,image/*"
                className="hidden"
              />
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Image
                  src={`${A}/icon-upload-cloud.svg`}
                  alt=""
                  width={24}
                  height={24}
                />
              </div>
              <div className="flex flex-col gap-1 items-center text-center w-full">
                <p className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary leading-[1.4]">
                  {fileName || "Choose a file or drag & drop it here"}
                </p>
                <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-muted leading-[1.4]">
                  PDF, TXT, JPEG, PNG — up to 10MB
                </p>
              </div>
              <span className="bg-surface-off px-6 py-2 rounded-[48px] font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary">
                Browse Files
              </span>
            </label>
            <p className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary/60 text-center w-full leading-[1.4]">
              Upload reference material (optional)
            </p>
          </div>

          {/* Due Date */}
          <div className="flex items-start w-full">
            <div className="flex flex-col gap-2 items-start flex-1 min-w-0">
              <label className="font-bricolage font-bold text-base tracking-[-0.04em] text-ink-primary leading-[1.4]">
                Due Date
              </label>
              <div className="relative w-full">
                <input
                  value={dueDate}
                  onChange={(e) => setField("dueDate", e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className="border-[1.25px] border-surface-off40 rounded-pill h-11 w-full px-4 font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary outline-none focus:border-ink-primary bg-transparent"
                />
                <Image
                  src={`${A}/rect14-stroke.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-80 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
              {errors.dueDate && <ErrorText>{errors.dueDate}</ErrorText>}
            </div>
          </div>

          {/* Question Type table */}
          <div className="flex flex-col gap-4 items-end justify-center w-[746px]">
            <div className="flex items-start justify-between w-full">
              {/* Left: Types */}
              <div className="flex flex-col gap-4 items-start">
                <h3 className="font-bricolage font-bold text-base tracking-[-0.04em] text-ink-primary leading-[1.4]">
                  Question Type
                </h3>
                {questionTypes.map((t, i) => (
                  <div key={t.id} className="flex gap-3 items-center">
                    <QuestionTypeSelect
                      value={{ id: t.id, label: t.label }}
                      taken={questionTypes.map((x) => x.id)}
                      onChange={(next) => updateType(i, next)}
                    />
                    <button
                      type="button"
                      onClick={() => removeType(i)}
                      className="w-4 h-4"
                      aria-label="Remove"
                    >
                      <Image src={`${A}/x-close.svg`} alt="" width={16} height={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addType}
                  className="flex gap-2 items-center"
                >
                  <span className="bg-button-dark p-2 rounded-[48px] inline-flex items-center justify-center">
                    <Image
                      src={`${A}/plus-bold.svg`}
                      alt=""
                      width={20}
                      height={20}
                    />
                  </span>
                  <span className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
                    Add Question Type
                  </span>
                </button>
                {errors.questionTypes && <ErrorText>{errors.questionTypes}</ErrorText>}
              </div>

              {/* Right: Counters */}
              <div className="flex flex-1 gap-4 items-center justify-end min-w-0">
                <div className="flex flex-col gap-4 items-center">
                  <span className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary text-center leading-[1.4]">
                    No. of Questions
                  </span>
                  {questionTypes.map((t, i) => (
                    <NumberStepper
                      key={`q-${t.id}`}
                      value={t.count}
                      min={1}
                      onChange={(v) => updateType(i, { count: v })}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-4 items-center w-[100px]">
                  <span className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary text-center leading-[1.4]">
                    Marks
                  </span>
                  {questionTypes.map((t, i) => (
                    <NumberStepper
                      key={`m-${t.id}`}
                      value={t.marks}
                      min={1}
                      onChange={(v) => updateType(i, { marks: v })}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-start font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary text-right leading-[1.1]">
              <span className="w-[180px]">{`Total Questions :  ${totals.totalQ}`}</span>
              <span className="w-[180px]">{`Total Marks :  ${totals.totalM}`}</span>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex flex-col gap-2 items-start w-full">
            <label className="font-bricolage font-bold text-base tracking-[-0.04em] text-ink-primary leading-[1.4] w-[597px]">
              Additional Information (For better output)
            </label>
            <div className="bg-white/25 border-[1.25px] border-dashed border-surface-off40 rounded-2xl h-[102px] flex flex-col items-end justify-between p-4 w-full overflow-hidden">
              <textarea
                value={instructions}
                onChange={(e) => setField("instructions", e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                className="font-bricolage font-medium text-sm tracking-[-0.04em] text-ink-primary/80 leading-[1.4] self-stretch bg-transparent outline-none resize-none flex-1 placeholder:text-ink-primary/40"
              />
            </div>
            {errors.instructions && <ErrorText>{errors.instructions}</ErrorText>}
          </div>

          {submitError && <ErrorText>{submitError}</ErrorText>}

          {/* Footer nav — inside the form card */}
          <div className="flex items-center justify-between w-full pt-2 border-t border-surface-off40/60 mt-2">
            <button
              type="button"
              className="bg-white flex gap-1 items-center px-6 py-3 rounded-[48px] mt-4"
              onClick={() => router.back()}
            >
              <Image src={`${A}/arrow-left.svg`} alt="" width={20} height={20} />
              <span className="font-bricolage font-medium text-base tracking-[-0.04em] text-ink-primary leading-[1.4]">
                Previous
              </span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-button-primary border-[1.5px] border-white/50 flex gap-1 items-center px-6 py-3 rounded-[48px] text-white disabled:opacity-60 mt-4"
            >
              <span className="font-bricolage font-medium text-base tracking-[-0.04em] leading-[1.4]">
                {submitting ? "Generating…" : "Generate"}
              </span>
              <Image src={`${A}/arrow-right.svg`} alt="" width={20} height={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="font-bricolage font-bold text-sm tracking-[-0.04em] text-ink-primary">
        {label}
      </label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-bricolage text-xs text-red-600 tracking-[-0.02em]">{children}</span>
  );
}
