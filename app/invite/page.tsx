import type { Metadata } from "next";
import InviteCard from "../../components/InviteCard";

export const metadata: Metadata = { title: "Ask for an invite — clep" };

export default function Invite() {
  return <InviteCard />;
}
