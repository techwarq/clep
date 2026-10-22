"use client";

import { useEffect, useState } from "react";

/** The landing header: wide open at the top, then eases into a smaller floating glass pill once you scroll. */
export default function StickyNav({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "home-nav scrolled" : "home-nav"}>
      <div className="nav-bar">{children}</div>
    </header>
  );
}
