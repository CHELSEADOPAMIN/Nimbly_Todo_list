import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/token";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";

  redirect(hasAuthCookie ? "/todos" : "/login");
}
