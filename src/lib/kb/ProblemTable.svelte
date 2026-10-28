<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is filed now, problem → issue URL.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, string>> } = $props();

  const groups = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(new Set(groups.flatMap((g) => g.reports.map((r) => r.id))).size);
  const both = $derived(groups.find((g) => g.problem === 'one-day')?.reports.length ?? 0);
  const WHAT: Record<Problem, string> = {
    parser: 'day and month swapped: the shared parser reads every date month first',
    hint: 'day and month swapped: booking-v3 prints MM/DD/YYYY, the form reads the tenant’s way',
    'one-day': 'date one day off, or a different day per time zone: not a swap',
  };
  const num = (url?: string) => (url ? `#${url.split('/').pop()}` : 'no ticket yet');
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} · <strong>{groups.length}</strong> problems · one ticket each
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{WHAT[g.problem]}</span></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{num(tickets[g.problem])}</a>{:else}{num()}{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#if both}
  <p class="note">{both} <code>one-day</code> reports are also counted under <code>parser</code>, where their tenant files them.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .what, .note { color: var(--muted); font-size: 0.85em; }
</style>
