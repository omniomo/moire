<script lang="ts">
  import { format } from 'date-fns';
  import type { PageData } from '../../routes/$types';
  import { createMemoList } from '$lib/memo.svelte';
  import { tagLinks } from '$lib/tags';
  import Author from '$lib/components/Author.svelte';
  import Heatmap from '$lib/components/Heatmap.svelte';

  let { data, config }: { data: PageData; config: any } = $props();
  const memoList = createMemoList(() => data, config);

  $effect(() => {
    if (memoList.selectedTag) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
</script>

<div class="page min-h-screen">
  <header class="masthead">
    <h1>{config.title}</h1>
    {#if config.description}
      <p>{config.description}</p>
    {/if}
  </header>

  {#if config.heatmap}
    <section class="activity" aria-label="Activity">
      <Heatmap memos={data.memos} />
    </section>
  {/if}

  {#if memoList.selectedTag}
    <div class="filter">
      <span>Tagged</span>
      <button onclick={() => memoList.selectTag(null)} aria-label="Clear tag filter">
        #{memoList.selectedTag}<span aria-hidden="true">×</span>
      </button>
      <span class="count">{memoList.filteredMemos.length}</span>
    </div>
  {/if}

  <main use:tagLinks={{ selected: memoList.selectedTag, onSelect: memoList.selectTag }}>
    {#each memoList.visibleMemos as memo (memo.slug)}
      <article class="entry" id={memo.slug}>
        <a class="date" href="#{memo.slug}">
          <time datetime={new Date(memo.date).toISOString()}>{format(memo.date, 'MMM d, yyyy')}</time>
        </a>
        <div class="memo">
          {@html memo.content}
        </div>
      </article>
    {/each}
  </main>

  {#if memoList.visibleCount < memoList.filteredMemos.length}
    <div class="more">
      <button onclick={memoList.loadMore}>Older entries</button>
    </div>
  {/if}

  <footer>
    © {new Date().getFullYear()} <Author name={config.author} url={config.authorUrl} /> · Synced from Apple Notes with <a href="https://moire.ooooomo.com/" target="_blank" rel="noopener">Moire</a>
  </footer>
</div>

<style>
  .page {
    --gutter: 7.5rem;
    max-width: 46rem;
    margin: 0 auto;
    padding: 5.5rem 1.5rem 3rem;
  }

  .masthead h1 {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .masthead p {
    margin-top: 0.4rem;
    color: var(--muted);
    font-size: 0.9375rem;
  }

  .activity {
    margin-top: 2.75rem;
  }

  .filter {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin-top: 2.5rem;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .filter button {
    display: inline-flex;
    gap: 0.35rem;
    color: var(--text-color);
    font-weight: 500;
    cursor: pointer;
  }

  .filter button span {
    color: var(--faint);
  }

  .filter button:hover span {
    color: var(--text-color);
  }

  .filter .count {
    margin-left: auto;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
  }

  main {
    margin-top: 3.5rem;
  }

  .entry + .entry {
    margin-top: 3rem;
  }

  .date {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
    line-height: 1.75rem;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
    transition: color 0.15s ease;
  }

  .date:hover {
    color: var(--muted);
  }

  @media (min-width: 720px) {
    .page {
      padding-top: 7rem;
    }

    .entry {
      display: grid;
      grid-template-columns: var(--gutter) minmax(0, 1fr);
    }

    .date {
      margin: 0;
    }

    .filter,
    main,
    .more {
      margin-left: 0;
    }
  }

  .memo {
    --memo-leading: 1.75;
    --link-thickness: 0.12em;
    --h1: 1.125em;
    --h2: 1em;
    --code-radius: 5px;
  }

  .memo :global(a) {
    text-underline-offset: 0.2em;
  }

  .memo :global(a:hover) {
    text-decoration-color: var(--text-color);
  }

  .memo :global(blockquote) {
    border-left-width: 2px;
  }

  .memo :global(img) {
    border-radius: 10px;
  }

  .memo :global(.tag-link) {
    color: var(--faint);
  }

  .memo :global(.tag-link:hover),
  .memo :global(.tag-link.active) {
    color: var(--text-color);
  }

  .more {
    margin-top: 3.5rem;
  }

  .more button {
    font-size: 0.875rem;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: var(--rule);
    text-underline-offset: 0.3em;
  }

  .more button:hover {
    color: var(--text-color);
    text-decoration-color: currentColor;
  }

  footer {
    margin-top: 6rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--rule);
    font-size: 0.8125rem;
    color: var(--faint);
  }

  footer :global(a:hover) {
    color: var(--text-color);
  }

  @media (min-width: 720px) {
    .more,
    footer {
      padding-left: var(--gutter);
    }

    footer {
      border-top: 0;
    }
  }
</style>
