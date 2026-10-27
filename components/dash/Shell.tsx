"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDash } from "../../lib/dashboard";
import { isBusy } from "../../lib/platform";
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

const active = (path: string, href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

/** Sidebar + top bar around every dashboard page. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { clips, account } = useDash();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const email = account?.user.email ?? "";
  const name = account?.user.name || (email ? email.split("@")[0] : "Your account");
  const initial = (name || "C")[0].toUpperCase();

  useEffect(() => setOpen(false), [path]);

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
          <img src="/brand/clep-mark-gradient.png" alt="" width={30} height={36} />
          <span className="cd-word">Clep</span>
          <span className="cd-badge">Beta</span>
        </Link>

        <nav className="cd-nav">
          {NAV.map((n) => (
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
            <Link href="/dashboard/videos" className="cd-icon-btn cd-icon-plain" aria-label={rendering ? `${rendering} rendering` : "Videos"}>
              {Ico.bell}
              {rendering > 0 && <i className="cd-dot" />}
            </Link>
            <Link href="/dashboard/settings" className="cd-avatar cd-avatar-top" aria-label="Account">{initial}</Link>
          </div>
        </header>
        <main className="cd-main">{children}</main>
      </div>
    </div>
  );
}
