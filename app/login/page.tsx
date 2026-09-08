import type { Metadata } from "next";
import AuthCard from "../../components/AuthCard";

export const metadata: Metadata = { title: "Log in — clep" };

export default function Login() {
  return <AuthCard mode="login" />;
}
