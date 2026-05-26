import { PageShell } from "@/components/PageShell";
import { MobileShell } from "@/components/MobileShell";
import { MobileSimplePage } from "@/components/mobile/MobileMisc";

const groups = [
  { name: "Class 8 — Section A", members: 32, subject: "Science" },
  { name: "Class 8 — Section B", members: 28, subject: "Science" },
  { name: "Class 7 — Section A", members: 30, subject: "Maths" },
  { name: "Class 5 — Section C", members: 24, subject: "English" },
];

export default function GroupsPage() {
  return (
    <>
      <PageShell glow={false} minHeight={780} sidebar={{ active: "groups" }} topbar={{ title: "My Groups" }}>
        <div className="absolute left-[327px] top-[90px] w-[1100px] flex flex-col gap-4 z-[1]">
          <div className="flex items-center px-2">
            <div className="w-3 h-3 rounded-full bg-[#1FB95A] mr-3" />
            <div>
              <h1 className="font-bricolage font-bold text-[20px] tracking-[-0.04em] text-ink-primary">
                My Groups
              </h1>
              <p className="font-bricolage text-sm text-ink-secondary/55">
                Classes you teach. Coming soon: assign papers directly to a group.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {groups.map((g) => (
              <div
                key={g.name}
                className="bg-white/70 rounded-2xl p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bricolage font-extrabold text-[20px] text-ink-primary">
                    {g.name}
                  </h3>
                  <p className="font-bricolage text-sm text-ink-secondary">
                    {g.subject} · {g.members} students
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-button-primary text-white font-bricolage font-medium text-sm px-5 py-2 rounded-pill border border-white/30"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      </PageShell>
      <MobileShell active="home">
        <MobileSimplePage title="My Groups" subtitle="Classes you teach." />
      </MobileShell>
    </>
  );
}
