export function PaperSkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 py-2 fade-up">
      {/* school header lines */}
      <div className="flex flex-col gap-2 items-center">
        <Bar w={420} h={28} />
        <Bar w={180} h={16} />
        <Bar w={140} h={16} />
      </div>

      {/* time/marks row */}
      <div className="flex justify-between w-full">
        <Bar w={180} h={16} />
        <Bar w={160} h={16} />
      </div>

      {/* student fields */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <Bar w="100%" h={36} />
        <Bar w="100%" h={36} />
        <Bar w="100%" h={36} />
      </div>

      <SectionSkeleton index={1} rows={4} />
      <SectionSkeleton index={2} rows={3} />
    </div>
  );
}

export function PaperSkeletonMobile() {
  return (
    <div className="w-full flex flex-col gap-4 py-2 fade-up">
      <div className="flex flex-col gap-1.5 items-center">
        <Bar w={200} h={18} />
        <Bar w={120} h={12} />
        <Bar w={90} h={12} />
      </div>
      <div className="flex justify-between w-full">
        <Bar w={100} h={12} />
        <Bar w={100} h={12} />
      </div>
      <div className="flex flex-col gap-2">
        <Bar w="100%" h={26} />
        <Bar w="100%" h={26} />
      </div>
      <SectionSkeleton index={1} rows={3} compact />
    </div>
  );
}

function SectionSkeleton({
  index,
  rows,
  compact,
}: {
  index: number;
  rows: number;
  compact?: boolean;
}) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-center">
        <Bar w={120} h={compact ? 16 : 22} />
      </div>
      <Bar w={compact ? 200 : 300} h={compact ? 12 : 16} />
      <ul className="flex flex-col gap-2 w-full">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 w-full">
            <div className="w-5 shrink-0">
              <Bar w={20} h={14} />
            </div>
            <span className="flex-1">
              <Bar w="100%" h={14} />
            </span>
            <Bar w={60} h={14} />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading section {index}</span>
    </div>
  );
}

function Bar({ w, h }: { w: number | string; h: number }) {
  return (
    <span
      className="block rounded-md skeleton-shimmer"
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: `${h}px`,
      }}
    />
  );
}
