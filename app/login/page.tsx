import { redirect } from "next/navigation";

export default function LoginInstead({ searchParams }: { searchParams: { email?: string } }) {
  redirect(searchParams.email ? `/signin?email=${encodeURIComponent(searchParams.email)}` : "/signin");
}
