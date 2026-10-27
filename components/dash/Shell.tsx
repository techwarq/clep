"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDash } from "../../lib/dashboard";
import { isBusy } from "../../lib/platform";
import { useTheme } from "../../lib/theme";
import { minutesText } from "./ui";
import { Ico } from "./icons";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Ico.home },
  { href: "/dashboard/videos", label: "Videos", icon: Ico.videos },
  { href: "/dashboard/projects", label: "Projects", icon: Ico.projects },
  { href: "/dashboard/brand", label: "Brand Kit", icon: Ico.brand },
  { href: "/dashboard/privacy", label: "Privacy", icon: Ico.privacy },
  { href: "/dashboard/integrations", label: "Integrations", icon: Ico.integrations },
  { href: "/dashboard/keys", label: "API Keys", icon: Ico.keys },
  { href: "/dashboard/billing", label: "Usage & Billing", icon: Ico.billing },
  { href: "/dashboard/settings", label: "Settings", icon: Ico.settings },
];

const SUN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </svg>
);
const MOON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

const ADMIN_LINK = { href: "/dashboard/admin", label: "Admin", icon: Ico.crown };

const active = (path: string, href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

/** Sidebar + top bar around every dashboard page. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { clips, account } = useDash();
  const { applied, choose } = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const email = account?.user.email ?? "";
  const name = account?.user.name || (email ? email.split("@")[0] : "Your account");
  const initial = (name || "C")[0].toUpperCase();

  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpen(false);
    main.current?.scrollTo({ top: 0 });
  }, [path]);

  // ⌘K / Ctrl+K focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("cd-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/videos${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  const rendering = clips.filter(isBusy).length;

  return (
    <div className="cd">
      <aside className={`cd-side ${open ? "open" : ""}`}>
        <Link href="/dashboard" className="cd-brand" aria-label="Clep dashboard">
          <img src="/brand/clep-logo-gradient.png" alt="Clep" width={82} height={32} className="cd-logo cd-logo-dark" />
          <img src="/brand/clep-logo-light.png" alt="Clep" width={82} height={32} className="cd-logo cd-logo-light" />
          <span className="cd-badge">Beta</span>
        </Link>

        <nav className="cd-nav">
          {[...NAV, ...(account?.is_admin ? [ADMIN_LINK] : [])].map((n) => (
            <Link key={n.href} href={n.href} className={active(path, n.href) ? "on" : ""}>
              {n.icon}
              <span>{n.label}</span>
              {n.href === "/dashboard/videos" && rendering > 0 && <em>{rendering}</em>}
            </Link>
          ))}
        </nav>

        {account && (
          <Link href="/dashboard/billing" className="cd-upsell">
            <p className="cd-upsell-title">{Ico.clock} Export minutes</p>
            <p>
              {minutesText(account.usage.used_seconds)} of {minutesText(account.usage.limit_seconds)} used this month
            </p>
            <div className="cd-bar"><i style={{ width: `${Math.min(100, (account.usage.used_seconds / Math.max(account.usage.limit_seconds, 1)) * 100)}%` }} /></div>
          </Link>
        )}

        <Link href="/dashboard/settings" className="cd-account">
          <span className="cd-avatar">{initial}</span>
          <span className="cd-account-text">
            <b>{name}</b>
            <small>{email || "…"}</small>
          </span>
          <span className="cd-account-chev">{Ico.chevron}</span>
        </Link>
      </aside>
      {open && <div className="cd-scrim" onClick={() => setOpen(false)} />}

      <div className="cd-body">
        <header className="cd-top">
          <button type="button" className="cd-icon-btn cd-menu" onClick={() => setOpen(true)} aria-label="Open menu">{Ico.menu}</button>
          <form className="cd-search" onSubmit={search} role="search">
            {Ico.search}
            <input id="cd-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos…" aria-label="Search videos" />
            <kbd>⌘K</kbd>
          </form>
          <div className="cd-top-right">
            <button type="button" className="cd-icon-btn cd-icon-plain" onClick={() => choose(applied === "dark" ? "light" : "dark")} aria-label={applied === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {applied === "dark" ? SUN : MOON}
            </button>
            <Link href="/dashboard/videos" className="cd-icon-btn cd-icon-plain" aria-label={rendering ? `${rendering} rendering` : "Videos"}>
              {Ico.bell}
              {rendering > 0 && <i className="cd-dot" />}
            </Link>
            <Link href="/dashboard/settings" className="cd-avatar cd-avatar-top" aria-label="Account">{initial}</Link>
          </div>
        </header>
        <main ref={main} className="cd-main">{children}</main>
      </div>
    </div>
  );
}
