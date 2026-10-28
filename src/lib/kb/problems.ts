// The problems inside one merged ticket, counted the way the desk counts: causes.ts files every report
// by its tenant. The desk's own reading (desk-notes.json) says which reports describe something else:
// a date one day off, not a flipped month. They stay counted where they are filed, and are also their
// own problem.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const shifted = merged.filter((r) => oneDayMove.includes(r.id));
  const groups = groupByCause(merged, tenantOf).map((g) => ({ problem: g.cause as Problem, reports: g.reports }));
  if (shifted.length) groups.push({ problem: 'one-day', reports: shifted });
  return groups
    .map(({ problem, reports: rs }) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
