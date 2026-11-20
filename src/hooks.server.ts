import type { Handle } from '@sveltejs/kit';

// Put the theme's class on <body> in the prerendered HTML (src/app.html → %moire.theme%): the page
// already holds its posts, so it is styled from the first paint instead of after the scripts run.
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, { transformPageChunk: ({ html }) => html.replace('%moire.theme%', __MOIRE_THEME__) });
