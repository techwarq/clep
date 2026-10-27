"use client";

import { useDash } from "../../../lib/dashboard";
import type { Approval } from "../../../lib/platform";
import { CopyField } from "../ui";

export const inviteMessage = (approval: Approval, origin: string) =>
  [
    `Hi ${approval.request.name}, you're in! Welcome to the Clep private beta.`,
    "",
    `Sign in at ${origin}/signin?email=${encodeURIComponent(approval.request.email)}`,
    `Your access code: ${approval.access_code}`,
  ].join("\n");

export default function ApprovalCard({ approval, onClose }: { approval: Approval; onClose: () => void }) {
  const { toast } = useDash();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const message = inviteMessage(approval, origin);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast("Invite copied");
    } catch {
      toast("Couldn't copy: select the text instead");
    }
  };

  return (
    <section className="cd-card cd-newkey" role="status">
      <h2>{approval.request.name} is approved</h2>
      <p className={approval.email.sent ? "cd-muted" : "cd-newkey-warn"}>
        {approval.email.sent
          ? `We emailed the code to ${approval.request.email}. You can share it yourself too.`
          : `The email didn't go out (${approval.email.error ?? "unknown error"}). Send them the code yourself.`}
      </p>
      <CopyField value={approval.access_code} />
      <div className="cd-admin-actions">
        <button type="button" className="cd-btn cd-btn-pink" onClick={() => void copyMessage()}>Copy invite message</button>
        <a className="cd-btn" href={`mailto:${approval.request.email}?subject=${encodeURIComponent("Your Clep beta access code")}&body=${encodeURIComponent(message)}`}>Open in mail</a>
        <button type="button" className="cd-btn" onClick={onClose}>Done</button>
      </div>
      <p className="cd-muted">The code isn't stored in plain text, so it's only shown now. Approving again gives them a new code and retires this one.</p>
    </section>
  );
}
