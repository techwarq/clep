import type { Metadata } from "next";
import AuthCard from "../../components/AuthCard";

export const metadata: Metadata = { title: "Enter your access key — clep" };

export default function Login() {
  return <AuthCard />;
}
