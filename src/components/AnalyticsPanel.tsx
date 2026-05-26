"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Stats = Awaited<ReturnType<typeof api.analytics>>;

export function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await api.analytics();
        if (alive) setStats(r);
      } catch {}
    }
    load();
    const i = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);

  return (
    <div className="absolute left-[327px] top-[90px] w-[1100px] flex flex-col gap-4 z-[1]">
      <div className="flex items-center px-2">
        <div className="w-3 h-3 rounded-full bg-[#1FB95A] mr-3" />
        <div>
          <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary leading-[1.4]">
            Analytics
          </h1>
          <p className="font-bricolage text-sm tracking-[-0.04em] text-ink-secondary/55">
            Insights across every paper your AI has drafted.
          </p>
        </div>
      </div>

      {!stats ? (
        <section className="bg-white/70 rounded-[28px] p-8 font-bricolage text-ink-muted">
          Loading…
        </section>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Kpi label="Total assignments" value={stats.total} />
            <Kpi label="Total questions" value={stats.totalQuestions} />
            <Kpi label="Total marks" value={stats.totalMarks} />
            <Kpi label="Subjects" value={Object.keys(stats.bySubject).length} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card title="Status breakdown">
              <BarRows
                data={Object.entries(stats.byStatus).map(([k, v]) => ({ label: k, value: v }))}
                color="emerald"
              />
            </Card>
            <Card title="Difficulty mix">
              <BarRows
                data={[
                  { label: "Easy", value: stats.difficultyMix.Easy },
                  { label: "Moderate", value: stats.difficultyMix.Moderate },
                  { label: "Hard", value: stats.difficultyMix.Hard },
                ]}
                color="amber"
              />
            </Card>
            <Card title="By subject">
              <BarRows
                data={Object.entries(stats.bySubject)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([k, v]) => ({ label: k, value: v }))}
                color="indigo"
              />
            </Card>
            <Card title="By grade">
              <BarRows
                data={Object.entries(stats.byGrade)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([k, v]) => ({ label: k, value: v }))}
                color="rose"
              />
            </Card>
          </div>

          <Card title="Last 7 days">
            <Spark data={stats.last7Days} />
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/70 rounded-2xl p-5 flex flex-col gap-1">
      <span className="font-bricolage text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <span className="font-bricolage font-bold text-[28px] text-ink-primary leading-none">
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/70 rounded-2xl p-5 flex flex-col gap-3">
      <h3 className="font-bricolage font-bold text-base text-ink-primary">{title}</h3>
      {children}
    </div>
  );
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  rose: "bg-rose-500",
  blue: "bg-blue-500",
};

function BarRows({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: keyof typeof colorMap;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return <p className="font-bricolage text-sm text-ink-muted">No data yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {data.map((d) => (
        <li key={d.label} className="flex items-center gap-3">
          <span className="w-28 font-bricolage text-sm text-ink-primary capitalize truncate">
            {d.label}
          </span>
          <div className="flex-1 h-3 bg-surface-off rounded-full overflow-hidden">
            <div
              className={`h-full ${colorMap[color]}`}
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-bricolage text-sm font-semibold text-ink-primary">
            {d.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Spark({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-button-primary rounded-md"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: 4 }}
          />
          <span className="font-bricolage text-[10px] text-ink-muted">
            {d.date.slice(5)}
          </span>
          <span className="font-bricolage text-xs font-semibold text-ink-primary">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}
