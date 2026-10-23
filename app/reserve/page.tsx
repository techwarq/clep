import type { Metadata } from "next";
import "../auth.css";
import ReserveSpot from "../../components/ReserveSpot";

export const metadata: Metadata = { title: "Reserve your spot — Clep" };

export default function Reserve() {
  return <ReserveSpot />;
}
