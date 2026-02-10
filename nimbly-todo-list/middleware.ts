import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/token";

const LOGIN_PATH = "/login";
const TODOS_PATH = "/todos";

const redirectWithPath = (request: NextRequest, path: string) => {
  return NextResponse.redirect(new URL(path, request.url));
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  if (pathname === "/") {
    return hasAuthCookie
      ? redirectWithPath(request, TODOS_PATH)
      : redirectWithPath(request, LOGIN_PATH);
  }

  if (pathname === LOGIN_PATH && hasAuthCookie) {
    return redirectWithPath(request, TODOS_PATH);
  }

  if (pathname.startsWith(TODOS_PATH) && !hasAuthCookie) {
    return redirectWithPath(request, LOGIN_PATH);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/", "/login", "/todos/:path*"],
};
