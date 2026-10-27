"use client";

import Shell from "../../components/dash/Shell";
import { DashProvider } from "../../lib/dashboard";
import "./theme.css";
import "./dashboard.css";
import "./pages.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashProvider>
      <Shell>{children}</Shell>
    </DashProvider>
  );
}
