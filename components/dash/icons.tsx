/** Line icons for the dashboard, 24px grid, stroke follows currentColor. */
function Svg({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export const Ico = {
  home: <Svg><path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></Svg>,
  videos: <Svg><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="M10.5 9.5v5l4.2-2.5z" /></Svg>,
  projects: <Svg><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></Svg>,
  brand: <Svg><circle cx="12" cy="12" r="8.5" /><circle cx="8.5" cy="10" r="1.2" /><circle cx="12" cy="7.8" r="1.2" /><circle cx="15.5" cy="10" r="1.2" /><path d="M12 20.5c-1.5 0-2-1-2-2s1-1.8 2.2-1.8h1.6a2.7 2.7 0 0 0 2.7-2.7" /></Svg>,
  privacy: <Svg><path d="M12 3.5l7 3v5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5v-5z" /><path d="M9.5 12l1.8 1.8 3.4-3.6" /></Svg>,
  integrations: <Svg><path d="M9 7V4M15 7V4M7 7h10v4a5 5 0 0 1-10 0zM12 16v4" /></Svg>,
  keys: <Svg><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l2 2M14 9l2 2" /></Svg>,
  billing: <Svg><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M3.5 10h17M7.5 15h3" /></Svg>,
  settings: <Svg><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6" /></Svg>,
  search: <Svg size={16}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Svg>,
  bell: <Svg><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" /></Svg>,
  arrow: <Svg size={15}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>,
  play: <Svg size={15}><circle cx="12" cy="12" r="8.5" /><path d="M10.5 9v6l4.5-3z" /></Svg>,
  download: <Svg size={15}><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" /></Svg>,
  close: <Svg size={16}><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  check: <Svg size={14}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>,
  chevron: <Svg size={15}><path d="M9 6l6 6-6 6" /></Svg>,
  menu: <Svg><path d="M4 7h16M4 12h16M4 17h16" /></Svg>,
  copy: <Svg size={15}><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></Svg>,
  camera: <Svg size={22}><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="M16 10.5l5-3v9l-5-3" /></Svg>,
  clock: <Svg size={22}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  bolt: <Svg size={22}><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" /></Svg>,
  folder: <Svg size={22}><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></Svg>,
  crown: <Svg size={16}><path d="M4 8l4 4 4-6 4 6 4-4-1.5 10h-13z" /></Svg>,
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    </svg>
  ),
};
