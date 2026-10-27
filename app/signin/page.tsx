import type { Metadata } from "next";
import "../auth.css";
import AuthSplit from "../../components/AuthSplit";

export const metadata: Metadata = { title: "Sign in — Clep" };

export default function SignIn() {
  return <AuthSplit />;
}
