"use client";

import { useEffect, useState } from "react";

/** The landing header: sticks to the top and frosts over the page once you start scrolling. */
export default function StickyNav({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className={scrolled ? "home-nav scrolled" : "home-nav"}>{children}</header>;
}
