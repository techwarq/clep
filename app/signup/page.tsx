import type { Metadata } from "next";
import "../auth.css";
import AuthSplit from "../../components/AuthSplit";

export const metadata: Metadata = { title: "Create your account — Clep" };

export default function Signup() {
  return <AuthSplit mode="signup" />;
}
