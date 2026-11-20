<script lang="ts">
    import type { PageData } from './$types';
    import { config } from '../../moire.config';
    // The theme chosen in moire.config.ts (vite.config.ts → $moire-theme). Imported statically so the
    // prerendered page already holds every post: readers and search engines see them before any script runs.
    import Theme from '$moire-theme';
    
    let { data }: { data: PageData } = $props();
    const schema = $derived({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": config.title,
        "description": config.description,
        "url": config.url,
        "author": {
            "@type": "Person",
            "name": config.author
        },
        "blogPost": data.memos.map(memo => ({
            "@type": "BlogPosting",
            "headline": memo.slug, // Using slug as headline since there's no title
            "datePublished": memo.date instanceof Date ? memo.date.toISOString() : memo.date,
            "url": `${config.url}/#${memo.slug}`,
            "articleBody": memo.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...', // Strip HTML for summary
            "keywords": memo.tags.join(', ')
        }))
    });
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>

{#if import.meta.env.VITE_MOIRE_NAV === 'true'}
    <nav aria-label="Moire" class="mx-auto flex max-w-2xl justify-end gap-5 px-5 pt-5 text-[0.8125rem] md:px-12">
        <a class="opacity-55 transition-opacity hover:opacity-100" href="/docs/" rel="external">Docs</a>
        <a class="opacity-55 transition-opacity hover:opacity-100" href="/themes/" rel="external">Themes</a>
    </nav>
{/if}

<Theme {data} {config} />

