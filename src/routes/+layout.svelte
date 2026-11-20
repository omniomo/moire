<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$themes/global.css';

	import { config } from '../../moire.config';

	let { children } = $props();

	$effect(() => {
		document.body.classList.add(config.theme);
		return () => document.body.classList.remove(config.theme);
	});

	// moire.ooooomo.com (the official build, see .github/workflows/deploy.yml) is Moire's own home:
	// there the title, description and share card say what Moire is. A fork's blog keeps its config.
	const official = import.meta.env.VITE_MOIRE_NAV === 'true';
	const pageTitle = official
		? 'Moire: Publish Apple Notes as a Free Blog on GitHub Pages'
		: `${config.title}${config.description ? ` | ${config.description}` : ''}`;
	const pageDescription = official
		? 'Write in Apple Notes on iPhone, iPad or Mac, and Moire publishes it as your own blog on GitHub Pages through Shortcuts. Free and open source.'
		: config.description;
	const shareImage = official ? `${config.url}/og.png` : `${config.url}/icon.png`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="author" content={config.author} />
	<meta name="keywords" content={config.keywords} />
	<link rel="icon" href={favicon} />
  <link rel="canonical" href={config.url} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={config.url} />
  <meta property="og:title" content={official ? pageTitle : config.title} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={shareImage} />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={config.url} />
  <meta property="twitter:title" content={official ? pageTitle : config.title} />
  <meta property="twitter:description" content={pageDescription} />
  <meta property="twitter:image" content={shareImage} />

</svelte:head>

{@render children()}
