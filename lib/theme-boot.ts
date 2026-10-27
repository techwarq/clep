export const THEME_STORAGE_KEY = "clep_theme";

export const THEME_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_STORAGE_KEY}");var t=c==="light"||c==="dark"?c:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){}})()`;
