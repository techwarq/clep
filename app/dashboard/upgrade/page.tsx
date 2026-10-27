import { redirect } from "next/navigation";

// Billing lives at /dashboard/billing — this route
// stays only so old bookmarks/links land somewhere real.
export default function UpgradeRedirect() {
  redirect("/dashboard/billing");
}
