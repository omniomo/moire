<script lang="ts">
  import { format } from 'date-fns';
  import type { PageData } from '../../routes/$types';
  import { createMemoList } from '$lib/memo.svelte';
  import { tagLinks } from '$lib/tags';
  import Author from '$lib/components/Author.svelte';
  import Heatmap from '$lib/components/Heatmap.svelte';

  let { data, config }: { data: PageData; config: any } = $props();
  const memoList = createMemoList(() => data, config);

  const dated = $derived(data.memos.length ? format(data.memos[0].date, 'MMMM d, yyyy') : '');

  $effect(() => {
    if (memoList.selectedTag) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
</script>

<div class="desk min-h-screen">
  <article class="paper" style="counter-reset: figure {config.heatmap ? 1 : 0};">
    <!-- \maketitle -->
    <header class="front">
      <h1>{config.title}</h1>
      <p class="author">{config.author}<a class="mark" href="#colophon" aria-label="Note">*</a></p>
      {#if dated}
        <p class="date">{dated}</p>
      {/if}
    </header>

    {#if config.description || memoList.allTags.length}
      <section class="abstract">
        {#if config.description}
          <h2>Abstract</h2>
          <p>{config.description}</p>
        {/if}
        {#if memoList.allTags.length}
          <p class="keywords">
            <b>Keywords:</b>
            {#each memoList.allTags as tag, i}{#if i > 0}<span class="sep">{', '}</span>{/if}<button class:current={memoList.selectedTag === tag} onclick={() => memoList.selectTag(tag)}>{tag}</button>{/each}
          </p>
        {/if}
      </section>
    {/if}

    {#if config.heatmap}
      <figure class="figure">
        <Heatmap memos={data.memos} />
        <figcaption><span>Figure 1:</span> Notes written per day over the past year ({data.memos.length} in total).</figcaption>
      </figure>
    {/if}

    {#if memoList.selectedTag}
      <p class="filter">
        Showing entries with keyword <i>{memoList.selectedTag}</i> ({memoList.filteredMemos.length}).
        <button onclick={() => memoList.selectTag(null)}>Show all</button>
      </p>
    {/if}

    <main use:tagLinks={{ selected: memoList.selectedTag, onSelect: memoList.selectTag }}>
      {#each Object.entries(memoList.groupedMemos) as [dateKey, memos], i (dateKey)}
        <section class="section">
          <h2><span class="num">{i + 1}</span>{format(new Date(dateKey + 'T00:00:00'), 'MMMM d, yyyy')}</h2>

          {#each memos as memo (memo.slug)}
            <div class="entry" id={memo.slug}>
              <a class="marginpar" href="#{memo.slug}">{format(memo.date, 'HH:mm')}</a>
              <div class="memo">
                {@html memo.content}
              </div>
            </div>
          {/each}
        </section>
      {/each}
    </main>

    {#if memoList.visibleCount < memoList.filteredMemos.length}
      <div class="more">
        <button onclick={memoList.loadMore}>Continue to earlier entries</button>
      </div>
    {/if}

    <!-- \thanks footnote -->
    <footer id="colophon" class="footnote">
      <p><sup>*</sup>Synced from Apple Notes with <a href="https://moire.ooooomo.com/" target="_blank" rel="noopener">Moire</a>. © {new Date().getFullYear()} <Author name={config.author} url={config.authorUrl} />.</p>
    </footer>
    <div class="folio" aria-hidden="true">1</div>
  </article>
</div>

<style>
  .desk {
    padding: 3.5rem 1.25rem 4rem;
  }

  .paper {
    position: relative;
    max-width: 50rem;
    margin: 0 auto;
    padding: 5.5rem 7rem 3rem;
    background: var(--surface);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 30px -12px rgba(0, 0, 0, 0.18);
    font-size: 1.125rem;
    line-height: 1.65;
  }

  /* ---- \maketitle ---- */
  .front {
    text-align: center;
  }

  .front h1 {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.25;
  }

  .author,
  .date {
    font-size: 1.1875rem;
  }

  .author {
    margin-top: 1.5rem;
  }

  .date {
    margin-top: 0.6rem;
  }

  .mark {
    position: relative;
    top: -0.45em;
    font-size: 0.7em;
    margin-left: 0.1em;
  }

  /* ---- abstract ---- */
  .abstract {
    margin: 2.75rem 3rem 0;
    font-size: 1rem;
    line-height: 1.6;
  }

  .abstract h2 {
    margin-bottom: 0.5rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
  }

  .abstract p {
    text-align: justify;
    text-indent: 1.5em;
  }

  .abstract .keywords {
    margin-top: 0.75rem;
    text-indent: 0;
  }

  .keywords b {
    margin-right: 0.35em;
  }

  .keywords button {
    cursor: pointer;
  }

  .keywords button:hover,
  .keywords button.current {
    color: var(--link);
  }

  .keywords button.current {
    font-style: italic;
  }

  .keywords .sep {
    white-space: pre;
  }

  /* ---- figure 1 ---- */
  .figure {
    margin: 2.5rem 0 0;
    --heat-min: 5px;
  }

  .figure figcaption {
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.9375rem;
  }

  .figure figcaption span {
    font-weight: 700;
  }

  .filter {
    margin-top: 2rem;
    font-size: 1rem;
    font-style: italic;
  }

  .filter i {
    font-style: normal;
  }

  .filter button {
    margin-left: 0.25em;
    color: var(--link);
    cursor: pointer;
  }

  /* ---- sections ---- */
  main {
    margin-top: 1rem;
  }

  .section > h2 {
    display: flex;
    gap: 1em;
    margin: 2.5rem 0 1rem;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .entry {
    position: relative;
  }

  .entry + .entry {
    margin-top: 1.4rem;
  }

  /* \marginpar */
  .marginpar {
    display: block;
    margin-bottom: 0.2rem;
    font-size: 0.875rem;
    font-style: italic;
    color: var(--muted);
  }

  @media (min-width: 900px) {
    .marginpar {
      position: absolute;
      top: 0.2rem;
      right: calc(100% + 1.25rem);
      margin: 0;
      text-align: right;
      white-space: nowrap;
    }
  }

  /* ---- memo body: LaTeX article conventions ---- */
  .memo {
    --memo-leading: 1.65;
    --memo-gap: 0.6em;
    --memo-head-gap: 1.1em;
    --h1: 1.125em;
    --h2: 1em;
    --h3: 1em;
    --h-weight: 700;
    --strong-weight: 700;
    --link-line: transparent;
    --quote-border: 0;
    --quote-ink: var(--text-color);
    --code-font: var(--moire-latex-mono);
    --code-radius: 0;
    --pre-radius: 0;
    --img-radius: 0;
    --tag-ink: var(--faint);
    --tag-hover: var(--link);
    text-align: justify;
    hyphens: auto;
  }

  /* paragraphs: no gap, indent continuation paragraphs */
  .memo > :global(p + p) {
    margin-top: 0;
    text-indent: 2em;
  }

  /* an Apple Notes "bold line" reads as a \paragraph heading */
  .memo > :global(p:has(> strong:only-child)) {
    margin-top: 0.8em;
    text-indent: 0;
  }

  .memo > :global(p:has(> strong:only-child) + p),
  .memo > :global(p:has(> .tag-link:first-child)) {
    text-indent: 0;
  }

  .memo > :global(p:has(> .tag-link:first-child)) {
    margin-top: 0.5em;
  }

  /* 黑体 for headings and bold, 楷体 for quotations and emphasis */
  .memo :global(:is(h1, h2, h3, h4, h5, h6)),
  .memo :global(strong),
  .memo :global(b),
  .memo :global(th) {
    font-family: var(--moire-latex-hei);
  }

  .memo :global(em),
  .memo :global(blockquote) {
    font-family: var(--moire-latex-kai);
  }

  .memo :global(a:hover) {
    text-decoration-color: currentColor;
  }

  /* quote environment */
  .memo :global(blockquote) {
    margin-inline: 2em;
    padding: 0;
    font-size: 0.95em;
  }

  .memo :global(ul),
  .memo :global(ol) {
    padding-left: 2em;
    text-align: left;
  }

  .memo :global(code) {
    padding: 0;
    font-size: 0.95em;
  }

  /* listings with top/bottom rules */
  .memo :global(pre) {
    padding: 0.6em 0;
    font-size: 0.875rem;
    line-height: 1.55;
    text-align: left;
    border-block: 0.5px solid var(--rule);
    -webkit-font-smoothing: antialiased;
  }

  /* booktabs */
  .memo :global(table) {
    width: auto;
    min-width: 60%;
    margin-inline: auto;
    font-size: 0.95em;
    text-align: left;
    border-top: 1.5px solid var(--rule);
    border-bottom: 1.5px solid var(--rule);
  }

  .memo :global(th),
  .memo :global(td) {
    padding: 0.3em 1em;
    border-bottom: 0;
  }

  .memo :global(th) {
    border-bottom: 0.75px solid var(--rule);
  }

  /* figures: a paragraph holding only an image gets a numbered caption */
  .memo > :global(p:has(> img:only-child)) {
    margin-block: 1em;
    text-indent: 0;
    text-align: center;
    counter-increment: figure;
  }

  .memo > :global(p:has(> img:only-child)::after) {
    content: 'Figure ' counter(figure) '.';
    display: block;
    margin-top: 0.5em;
    font-size: 0.9375rem;
    font-weight: 700;
  }

  .memo :global(img) {
    display: inline-block;
    max-width: 85%;
  }

  .memo :global(.tag-link) {
    font-size: 0.875em;
  }

  .more {
    margin-top: 2.5rem;
    text-align: center;
  }

  .more button {
    font-size: 1rem;
    font-style: italic;
    color: var(--link);
    cursor: pointer;
  }

  /* ---- footnote + folio ---- */
  .footnote {
    margin-top: 4.5rem;
    padding-top: 0.5rem;
    width: 40%;
    border-top: 0.5px solid var(--rule);
  }

  .footnote p {
    width: 250%;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .footnote sup {
    margin-right: 0.15em;
  }

  .footnote :global(a) {
    color: var(--link);
  }

  .folio {
    margin-top: 2.5rem;
    text-align: center;
    font-size: 1rem;
  }

  @media (max-width: 899px) {
    .desk {
      padding: 0;
    }

    .paper {
      max-width: none;
      padding: 3.5rem 1.4rem 2rem;
      box-shadow: none;
      font-size: 1.0625rem;
    }

    .abstract {
      margin-inline: 0.75rem;
    }

    .memo {
      text-align: left;
    }
  }
</style>
