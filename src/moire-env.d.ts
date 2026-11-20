declare const __MOIRE_THEME__: string;

// The blog's theme component, resolved from moire.config.ts in vite.config.ts.
declare module '$moire-theme' {
	import type { Component } from 'svelte';
	const Theme: Component<{ data: any; config: any }>;
	export default Theme;
}
