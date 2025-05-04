// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import 'material-icons/iconfont/material-icons.css';

export const prerender = true;
export const ssr = false;
