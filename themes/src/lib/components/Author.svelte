<script lang="ts">
  // The site owner's name, linked when `authorUrl` is set in moire.config.ts
  let { name, url, class: className = '' }: { name: string; url?: string; class?: string } = $props();
</script>

{#if url}<a href={url} class={className} target="_blank" rel="noopener">{name}</a>{:else}{name}{/if}
