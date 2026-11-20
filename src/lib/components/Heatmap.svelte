<script lang="ts">
  import type {Memo} from '$lib/server/memos';
  import {format, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, subDays} from 'date-fns';
  import {onMount} from 'svelte';

  let {memos}: {memos: Memo[]} = $props();

  const today = startOfDay(new Date());

  const days = $derived.by(() => {
    let earliestDate = today;
    if (memos && memos.length > 0) {
      const minDateRaw = new Date(Math.min(...memos.map((m) => new Date(m.date).getTime())));
      earliestDate = startOfDay(minDateRaw);
    }

    // Always show at least a year
    const aYearAgo = subDays(today, 360);
    if (earliestDate > aYearAgo) {
      earliestDate = aYearAgo;
    }

    const startDate = startOfWeek(earliestDate, {weekStartsOn: 0});
    const endDate = endOfWeek(today, {weekStartsOn: 0});
    return eachDayOfInterval({start: startDate, end: endDate});
  });

  const numColumns = $derived(Math.ceil(days.length / 7));

  const memoCounts = $derived.by(() => {
    const counts = new Map<string, number>();
    days.forEach((day) => counts.set(format(day, 'yyyy-MM-dd'), 0));
    memos?.forEach((memo) => {
      const dateStr = format(new Date(memo.date), 'yyyy-MM-dd');
      if (counts.has(dateStr)) counts.set(dateStr, counts.get(dateStr)! + 1);
    });
    return counts;
  });

  const maxMemos = $derived(Math.max(1, ...Array.from(memoCounts.values())));

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (maxMemos <= 3) return count;

    const percentage = count / maxMemos;
    if (percentage <= 0.33) return 2;
    if (percentage <= 0.66) return 3;
    return 4;
  };

  let scrollContainer: HTMLDivElement | undefined = $state();

  onMount(() => {
    // On narrow screens the grid scrolls: start at the most recent weeks
    if (scrollContainer && scrollContainer.scrollWidth > scrollContainer.clientWidth) {
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }
  });

  let hoveredCell = $state<{x: number; y: number; date: string; count: number} | null>(null);

  const handlePointerEnter = (e: PointerEvent, day: Date, count: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    hoveredCell = {
      x: window.scrollX + rect.left + rect.width / 2,
      y: window.scrollY + rect.top - 6,
      date: format(day, 'MMM d, yyyy'),
      count,
    };
  };

  const handlePointerLeave = () => {
    hoveredCell = null;
  };

  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return;
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }
</script>

<div
  use:portal
  class="heatmap-tip"
  class:visible={hoveredCell}
  style="left: {hoveredCell?.x ?? -9999}px; top: {hoveredCell?.y ?? -9999}px;"
  aria-hidden="true"
>
  <strong>{hoveredCell?.count ?? 0} {(hoveredCell?.count ?? 0) === 1 ? 'memo' : 'memos'}</strong>
  <span>{hoveredCell?.date ?? ''}</span>
</div>

<div class="heatmap" bind:this={scrollContainer}>
  <div class="heatmap-grid" style="--cols: {numColumns};">
    {#each days as day}
      <div
        class="heatmap-cell"
        role="presentation"
        data-level={getLevel(memoCounts.get(format(day, 'yyyy-MM-dd')) || 0)}
        onpointerenter={(e) => handlePointerEnter(e, day, memoCounts.get(format(day, 'yyyy-MM-dd')) || 0)}
        onpointerleave={handlePointerLeave}
      ></div>
    {/each}
  </div>
</div>

<style>
  .heatmap {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .heatmap::-webkit-scrollbar {
    display: none;
  }

  /* Fills the available width; scrolls only when cells would get smaller than --heat-min */
  .heatmap-grid {
    display: grid;
    grid-template-rows: repeat(7, auto);
    grid-template-columns: repeat(var(--cols), minmax(var(--heat-min, 7px), 1fr));
    grid-auto-flow: column;
    gap: var(--heat-gap, 3px);
  }

  .heatmap-cell {
    aspect-ratio: 1;
    border-radius: var(--heat-radius, 2px);
    background: var(--heat-0, color-mix(in srgb, var(--text-color) 7%, transparent));
  }

  .heatmap-cell[data-level='1'] {
    background: var(--heat-1, color-mix(in srgb, var(--accent-color, var(--text-color)) 30%, transparent));
  }

  .heatmap-cell[data-level='2'] {
    background: var(--heat-2, color-mix(in srgb, var(--accent-color, var(--text-color)) 55%, transparent));
  }

  .heatmap-cell[data-level='3'] {
    background: var(--heat-3, color-mix(in srgb, var(--accent-color, var(--text-color)) 80%, transparent));
  }

  .heatmap-cell[data-level='4'] {
    background: var(--heat-4, var(--accent-color, var(--text-color)));
  }

  .heatmap-cell:hover {
    outline: 1px solid var(--text-color);
    outline-offset: 1px;
  }

  .heatmap-tip {
    position: absolute;
    z-index: 10000;
    pointer-events: none;
    transform: translate(-50%, -100%);
    display: flex;
    gap: 0.5em;
    padding: 5px 8px;
    border-radius: var(--tip-radius, 6px);
    background: var(--tip-bg, #1d1d1f);
    color: var(--tip-fg, #ffffff);
    font-family: var(--tip-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 11px;
    line-height: 1.3;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  .heatmap-tip strong {
    font-weight: 600;
  }

  .heatmap-tip span {
    opacity: 0.7;
  }

  .heatmap-tip.visible {
    opacity: 1;
  }
</style>
