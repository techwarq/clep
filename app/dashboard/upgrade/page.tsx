import { redirect } from "next/navigation";

// Billing moved into the sidebar (see app/dashboard/page.tsx) — this route
// stays only so old bookmarks/links land somewhere real.
export default function UpgradeRedirect() {
  redirect("/dashboard?view=billing");
}
