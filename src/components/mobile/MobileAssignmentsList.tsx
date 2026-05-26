import Image from "next/image";

const S2 = "/figma/screen2";

type Card = { id: string; title: string; assigned: string; due: string };

const items: Card[] = [
  { id: "1", title: "Quiz on Electricity", assigned: "20-06-2025", due: "21-06-2025" },
  { id: "2", title: "Algebra Basics Chapter Test", assigned: "18-06-2025", due: "25-06-2025" },
  { id: "3", title: "Reading Comprehension Set 4", assigned: "15-06-2025", due: "19-06-2025" },
  { id: "4", title: "Worksheet on Photosynthesis", assigned: "12-06-2025", due: "20-06-2025" },
];

export function MobileAssignmentsList() {
  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Header */}
      <div className="px-1">
        <div className="flex gap-2 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1FB95A] shrink-0" />
          <div>
            <h1 className="font-bricolage font-bold text-[18px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
              Assignments
            </h1>
            <p className="font-bricolage text-xs tracking-[-0.04em] text-ink-secondary/55 leading-[1.4]">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="bg-white rounded-2xl h-14 flex items-center justify-between px-3 w-full">
        <div className="flex gap-1 items-center">
          <Image src={`${S2}/filter-icon.svg`} alt="" width={18} height={18} />
          <span className="font-bricolage font-bold text-xs tracking-[-0.04em] text-ink-muted">
            Filter
          </span>
        </div>
        <div className="flex-1 ml-3 h-10 border border-black/20 rounded-pill flex items-center gap-2 px-3">
          <Image src={`${S2}/search-icon.svg`} alt="" width={16} height={16} />
          <span className="font-bricolage font-bold text-xs tracking-[-0.04em] text-ink-muted">
            Search Name
          </span>
        </div>
      </div>

      {/* Cards stacked */}
      <div className="flex flex-col gap-2.5">
        {items.map((c) => (
          <article
            key={c.id}
            className="bg-white rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bricolage font-extrabold text-[18px] tracking-[-0.04em] text-ink-primary leading-[1.2] flex-1">
                {c.title}
              </h3>
              <button type="button" aria-label="More options" className="w-5 h-5 flex items-center justify-center shrink-0">
                <Image src={`${S2}/more-vertical.svg`} alt="" width={4} height={14} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bricolage text-xs tracking-[-0.04em] text-black/50">
                <span className="font-extrabold text-ink-primary">Assigned on</span> : {c.assigned}
              </span>
              <span className="font-bricolage text-xs tracking-[-0.04em] text-black/50">
                <span className="font-extrabold text-ink-primary">Due</span> : {c.due}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
