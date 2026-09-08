import type { Metadata } from "next";
import AuthCard from "../../components/AuthCard";

export const metadata: Metadata = { title: "Sign up free — clep" };

export default function Signup() {
  return <AuthCard mode="signup" />;
}
