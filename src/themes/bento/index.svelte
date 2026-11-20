<script lang="ts">
  import { format } from 'date-fns';
  import type { PageData } from '../../routes/$types';
  import { createMemoList } from '$lib/memo.svelte';
  import { tagLinks } from '$lib/tags';
  import { countDays } from '$lib/theme-utils';
  import Author from '$lib/components/Author.svelte';
  import Heatmap from '$lib/components/Heatmap.svelte';
  import Shader from './Shader.svelte';

  let { data, config }: { data: PageData; config: any } = $props();
  const memoList = createMemoList(() => data, config);

  const daysWritten = $derived(countDays(data.memos));

  $effect(() => {
    if (memoList.selectedTag) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
</script>

<Shader />

<div class="page min-h-screen">
  <header class="masthead">
    <h1>{config.title}</h1>
    {#if config.description}
      <p>{config.description}</p>
    {/if}
  </header>

  <section class="tiles" aria-label="Overview">
    {#if config.heatmap}
      <div class="tile tile-activity">
        <div class="tile-label">Activity</div>
        <Heatmap memos={data.memos} />
      </div>
    {/if}
    <div class="tile stat">
      <span class="value">{data.memos.length}</span>
      <span class="label">Memos</span>
    </div>
    <div class="tile stat">
      <span class="value">{daysWritten}</span>
      <span class="label">Days written</span>
    </div>
    <div class="tile stat">
      <span class="value">{memoList.allTags.length}</span>
      <span class="label">Tags</span>
    </div>
  </section>

  {#if memoList.selectedTag}
    <div class="filter">
      <span>Showing</span>
      <button onclick={() => memoList.selectTag(null)} aria-label="Clear tag filter">
        #{memoList.selectedTag}
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
      </button>
      <span class="count">{memoList.filteredMemos.length} {memoList.filteredMemos.length === 1 ? 'memo' : 'memos'}</span>
    </div>
  {/if}

  <main class="cards" use:tagLinks={{ selected: memoList.selectedTag, onSelect: memoList.selectTag }}>
    {#each memoList.visibleMemos as memo (memo.slug)}
      <article class="card" id={memo.slug}>
        <header>
          <time datetime={new Date(memo.date).toISOString()}>{format(memo.date, 'EEEE, MMM d, yyyy')}</time>
          <span>{format(memo.date, 'HH:mm')}</span>
        </header>
        <div class="memo">
          {@html memo.content}
        </div>
      </article>
    {/each}
  </main>

  {#if memoList.visibleMemos.length < memoList.filteredMemos.length}
    <div class="more">
      <button onclick={memoList.loadMore}>Show more</button>
    </div>
  {/if}

  <footer>
    © {new Date().getFullYear()} <Author name={config.author} url={config.authorUrl} /> · Synced from Apple Notes with <a href="https://moire.ooooomo.com/" target="_blank" rel="noopener">Moire</a>
  </footer>
</div>

<style>
  .page {
    max-width: 44rem;
    margin: 0 auto;
    padding: 4rem 1rem 3rem;
  }

  .masthead {
    padding: 0 0.5rem;
  }

  .masthead h1 {
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .masthead p {
    margin-top: 0.6rem;
    font-size: 1.0625rem;
    color: var(--muted);
    letter-spacing: -0.005em;
  }

  /* ---- bento overview ---- */
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 2.5rem;
  }

  /* frosted white: the colour field tints through, text stays on a calm surface */
  .tile,
  .card,
  .more button {
    background: rgba(255, 255, 255, 0.72);
    -webkit-backdrop-filter: blur(28px) saturate(1.5);
    backdrop-filter: blur(28px) saturate(1.5);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.6),
      0 1px 2px rgba(15, 23, 42, 0.04),
      0 10px 30px -18px rgba(15, 23, 42, 0.18);
  }

  .tile {
    border-radius: 1.125rem;
    padding: 1.1rem 1.25rem;
  }

  .tile-activity {
    grid-column: 1 / -1;
    padding: 1.25rem 1.5rem 1.4rem;
  }

  .tile-label {
    margin-bottom: 0.85rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .stat .value {
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    font-variant-numeric: tabular-nums;
  }

  .stat .label {
    font-size: 0.8125rem;
    color: var(--muted);
  }

  /* ---- filter ---- */
  .filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 2rem 0.5rem 0;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .filter button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent-color) 10%, transparent);
    color: var(--accent-color);
    font-weight: 500;
    cursor: pointer;
  }

  .filter .count {
    margin-left: auto;
  }

  /* ---- cards ---- */
  .cards {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .card {
    border-radius: 1.375rem;
    padding: 1.5rem 1.75rem 1.75rem;
  }

  .card > header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
    font-size: 0.8125rem;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  .memo {
    --memo-leading: 1.7;
    --h1: 1.3125em;
    --h2: 1.125em;
    --h-tracking: -0.015em;
    --pre-radius: 0.875rem;
    --code-radius: 6px;
    --quote-border: 3px solid rgba(0, 0, 0, 0.08);
    --code-bg: rgba(0, 0, 0, 0.045);
    --rule: rgba(0, 0, 0, 0.08);
  }

  .memo :global(a) {
    text-decoration-color: color-mix(in srgb, var(--link) 35%, transparent);
  }

  .memo :global(img) {
    border-radius: 0.875rem;
  }

  .memo :global(.tag-link) {
    display: inline-block;
    margin: 0.15rem 0;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.045);
    color: var(--muted);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.4;
  }

  .memo :global(.tag-link:hover) {
    background: rgba(0, 0, 0, 0.08);
    color: var(--text-color);
  }

  .memo :global(.tag-link.active) {
    background: color-mix(in srgb, var(--accent-color) 12%, transparent);
    color: var(--accent-color);
  }

  .more {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .more button {
    padding: 0.65rem 1.4rem;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--accent-color);
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .more button:hover {
    background: rgba(255, 255, 255, 0.92);
  }

  footer {
    margin-top: 4rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--faint);
  }

  footer :global(a:hover) {
    color: var(--text-color);
  }

  @media (max-width: 520px) {
    .page {
      padding-top: 3rem;
    }

    .masthead h1 {
      font-size: 2rem;
    }

    .tile {
      padding: 0.9rem 1rem;
    }

    .stat .value {
      font-size: 1.375rem;
    }

    .stat .label {
      font-size: 0.75rem;
    }

    .card {
      padding: 1.25rem 1.25rem 1.4rem;
    }
  }
</style>
