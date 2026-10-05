import { redirect } from "next/navigation";

// No accounts — access is by key.
export default function Signup() {
  redirect("/login");
}
