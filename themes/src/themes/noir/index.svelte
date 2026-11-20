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
      <button onclick={() => memoList.selectTag(null)} aria-label="Clear tag filter">
        #{memoList.selectedTag}<span aria-hidden="true">×</span>
      </button>
      <span>{memoList.filteredMemos.length} {memoList.filteredMemos.length === 1 ? 'note' : 'notes'}</span>
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
      <button onclick={memoList.loadMore}>More</button>
    </div>
  {/if}

  <footer>
    © {new Date().getFullYear()} <Author name={config.author} url={config.authorUrl} /> · <a href="https://moire.ooooomo.com/" target="_blank" rel="noopener">Moire</a>
  </footer>
</div>

<style>
  .page {
    max-width: 38rem;
    margin: 0 auto;
    padding: 6rem 1.5rem 3rem;
  }

  .masthead h1 {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #ffffff;
  }

  .masthead p {
    margin-top: 0.25rem;
    font-size: 1rem;
    color: var(--muted);
  }

  .activity {
    margin-top: 3.5rem;
  }

  .filter {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 3rem;
    font-size: 0.875rem;
    color: var(--faint);
  }

  .filter button {
    display: inline-flex;
    gap: 0.4rem;
    color: #ffffff;
    cursor: pointer;
  }

  .filter button span {
    color: var(--faint);
  }

  .filter button:hover span {
    color: #ffffff;
  }

  main {
    margin-top: 4rem;
  }

  .entry + .entry {
    margin-top: 2.75rem;
    padding-top: 2.75rem;
    border-top: 1px solid var(--rule);
  }

  .date {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 0.8125rem;
    color: var(--faint);
    font-variant-numeric: tabular-nums;
    transition: color 0.15s ease;
  }

  .date:hover {
    color: var(--muted);
  }

  .memo {
    --memo-leading: 1.75;
    --h1: 1.125em;
    --h2: 1em;
    --h-ink: #ffffff;
    --strong-ink: #ffffff;
    --marker: var(--faint);
    --quote-border: 1px solid #3a3a3e;
    --link-line: #5c5c61;
    --tag-ink: var(--faint);
    --tag-hover: #ffffff;
  }

  .memo :global(a:hover) {
    text-decoration-color: #ffffff;
  }

  .memo :global(img) {
    border-radius: 8px;
  }

  .memo :global(pre) {
    border: 1px solid var(--rule);
  }

  .more {
    margin-top: 4rem;
  }

  .more button {
    font-size: 0.875rem;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .more button:hover {
    color: #ffffff;
  }

  footer {
    margin-top: 6rem;
    font-size: 0.8125rem;
    color: var(--faint);
  }

  footer :global(a:hover) {
    color: #ffffff;
  }

  @media (max-width: 520px) {
    .page {
      padding-top: 4rem;
    }
  }
</style>
