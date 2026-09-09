import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCard from "../../components/AuthCard";

export const metadata: Metadata = { title: "Sign up free — clep" };

export default function Signup() {
  return (
    <Suspense fallback={null}>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
