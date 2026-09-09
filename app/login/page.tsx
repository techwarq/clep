import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard from "../../components/AuthCard";

export const metadata: Metadata = { title: "Log in — clep" };

export default function Login() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="login" />
    </Suspense>
  );
}
