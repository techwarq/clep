"use client";

import { useState } from "react";
import MembersTable from "../../../components/dash/admin/MembersTable";
import RequestsTable from "../../../components/dash/admin/RequestsTable";
import { PageHead } from "../../../components/dash/ui";
import { useDash } from "../../../lib/dashboard";
import "./admin.css";

export default function Admin() {
  const { account, loaded } = useDash();
  const [tab, setTab] = useState<"requests" | "members">("requests");

  if (loaded && account && !account.is_admin) {
    return (
      <div className="cd-page cd-narrow">
        <PageHead title="Admin" sub="Only Clep admins can open this page." />
      </div>
    );
  }

  return (
    <div className="cd-page">
      <PageHead title="Admin" sub="Who's asking for access, who's in, and which plan they're on.">
        <div className="cd-pills cd-pills-btn">
          <button type="button" className={tab === "requests" ? "on" : ""} onClick={() => setTab("requests")}>Requests</button>
          <button type="button" className={tab === "members" ? "on" : ""} onClick={() => setTab("members")}>Members</button>
        </div>
      </PageHead>
      {account?.is_admin && (tab === "requests" ? <RequestsTable /> : <MembersTable />)}
    </div>
  );
}
