import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { rootDomain } from "./lib/domain/utils";

// --- Subdomain Extraction ---
function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const match = url.match(/http:\/\/([^.]+)\.localhost/);
    if (match?.[1]) return match[1];
    if (hostname.includes(".localhost")) return hostname.split(".")[0];
    return null;
  }

  const rootDomainFormatted = rootDomain.split(":")[0];

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

// --- Main Middleware ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Subdomain-specific logic
  if (subdomain) {
    // Block access to /admin from tenant routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Rewrite root path to /tenant/[subdomain]
    if (pathname === "/") {
      const rewrittenUrl = new URL(`/tenant/${subdomain}`, request.url);
      const response = NextResponse.rewrite(rewrittenUrl);

      // Attach session handling
      const authResponse = await updateSession(request);
      authResponse.headers.forEach((v, k) => {
        response.headers.set(k, v);
      });

      return response;
    }
  }

  // Default behavior (root domain)
  const response = NextResponse.next();
  const authResponse = await updateSession(request);

  authResponse.headers.forEach((v, k) => {
    response.headers.set(k, v);
  });

  return response;
}

// --- Config ---
export const config = {
  matcher: ["/((?!api|_next|[\\w-]+\\.\\w+).*)"],
};
