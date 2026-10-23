import type { Metadata } from "next";
import "../auth.css";
import AuthSplit from "../../components/AuthSplit";

export const metadata: Metadata = { title: "Log in — Clep" };

export default function Login() {
  return <AuthSplit mode="login" />;
}
