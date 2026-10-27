import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRuntimeMode, getSupabasePublicConfig } from "@/lib/runtime-mode";

const PUBLIC_LIVE_PATHS = [
  "/login",
  "/forgot-password",
  "/auth/callback",
  "/access-pending",
];

function addSecurityHeaders(response: NextResponse, nonce: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

function makeRequestHeaders(request: NextRequest, nonce: string) {
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`);
  return headers;
}

function copyCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) target.cookies.set(cookie);
  const cacheControl = source.headers.get("Cache-Control");
  if (cacheControl) target.headers.set("Cache-Control", cacheControl);
}

function disabledResponse(request: NextRequest, nonce: string) {
  const isHindi = request.cookies.get("satyapan_locale")?.value === "hi";
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json(
        { error: isHindi
          ? "इस वातावरण में सेवा उपलब्ध नहीं है। सर्वर कॉन्फ़िगरेशन पूरा करने के लिए परियोजना प्रशासक से संपर्क करें।"
          : "The service is unavailable in this environment. Ask the project administrator to complete the server configuration." },
        { status: 503 }
      )
    : new NextResponse(
        isHindi
          ? `<!doctype html><html lang="hi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>सेवा उपलब्ध नहीं</title><body style="font:16px system-ui,sans-serif;max-width:44rem;margin:12vh auto;padding:24px;color:#202b36"><p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b4b12">SATYAPAN · SIH 2026 PROTOTYPE</p><h1>सेवा उपलब्ध नहीं</h1><p>इस परिनियोजन में कृत्रिम प्रदर्शन डेटा या प्रमाणित लाइव मोड का कॉन्फ़िगरेशन नहीं है।</p><p>वास्तविक छात्र रिकॉर्ड के साथ प्रदर्शन मोड का उपयोग न करें।</p></body></html>`
          : `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Service unavailable</title><body style="font:16px system-ui,sans-serif;max-width:44rem;margin:12vh auto;padding:24px;color:#202b36"><p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8b4b12">SATYAPAN · SIH 2026 PROTOTYPE</p><h1>Service unavailable</h1><p>This deployment is not configured to use synthetic demonstration data or authenticated live mode.</p><p>Do not use demonstration mode with real student records.</p></body></html>`,
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
  return addSecurityHeaders(response, nonce);
}

function authUnavailableResponse(request: NextRequest, nonce: string) {
  const isHindi = request.cookies.get("satyapan_locale")?.value === "hi";
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json({ error: isHindi
      ? "अभी साइन इन की पुष्टि नहीं हो सकी। कृपया थोड़ी देर बाद फिर प्रयास करें।"
      : "We couldn't verify your sign-in right now. Please try again shortly." }, { status: 503 })
    : new NextResponse(
        isHindi
          ? "<!doctype html><html lang=\"hi\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>साइन-इन की जाँच उपलब्ध नहीं</title><body style=\"font:16px system-ui,sans-serif;max-width:44rem;margin:12vh auto;padding:24px;color:#202b36\"><h1>साइन-इन की जाँच उपलब्ध नहीं</h1><p>अभी आपकी पहुँच की पुष्टि नहीं हो सकी। कृपया थोड़ी देर बाद फिर प्रयास करें।</p><p><a href=\"/login\">साइन इन पर लौटें</a></p></body></html>"
          : "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Sign-in check unavailable</title><body style=\"font:16px system-ui,sans-serif;max-width:44rem;margin:12vh auto;padding:24px;color:#202b36\"><h1>Sign-in check unavailable</h1><p>We couldn't verify your access right now. Please try again shortly.</p><p><a href=\"/login\">Return to sign in</a></p></body></html>",
        { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
  return addSecurityHeaders(response, nonce);
}

function isPublicPath(pathname: string) {
  return PUBLIC_LIVE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function redirectWithCookies(request: NextRequest, destination: URL, source: NextResponse, nonce: string) {
  const response = NextResponse.redirect(destination);
  copyCookies(source, response);
  return addSecurityHeaders(response, nonce);
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const mode = getRuntimeMode();
  if (mode === "disabled") return disabledResponse(request, nonce);

  const requestHeaders = makeRequestHeaders(request, nonce);
  if (request.nextUrl.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (!origin) {
      return addSecurityHeaders(NextResponse.json({ error: "This request could not be verified. Reload the page and try again." }, { status: 403 }), nonce);
    }
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) {
        return addSecurityHeaders(NextResponse.json({ error: "This request could not be verified. Reload the page and try again." }, { status: 403 }), nonce);
      }
    } catch {
      return addSecurityHeaders(NextResponse.json({ error: "This request could not be verified." }, { status: 403 }), nonce);
    }
  }

  if (mode === "demo") {
    return addSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  // Verification is only a synthetic workflow until a legally meaningful consent
  // protocol and trusted credential issuer are designed and independently reviewed.
  if (request.nextUrl.pathname.startsWith("/verify/certificate") || request.nextUrl.pathname === "/api/verify") {
    const response = request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Credential verification is not enabled in live mode." }, { status: 501 })
      : new NextResponse("Credential verification is not enabled in live mode.", { status: 501 });
    return addSecurityHeaders(response, nonce);
  }

  const config = getSupabasePublicConfig();
  if (!config) return disabledResponse(request, nonce);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request: { headers: makeRequestHeaders(request, nonce) } });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  let authResult: Awaited<ReturnType<typeof supabase.auth.getClaims>>;
  try {
    authResult = await supabase.auth.getClaims();
  } catch {
    return authUnavailableResponse(request, nonce);
  }
  const claims = authResult.data?.claims;
  const error = authResult.error;
  const publicPath = isPublicPath(request.nextUrl.pathname);

  if (error && typeof error.status === "number" && error.status >= 500) {
    return authUnavailableResponse(request, nonce);
  }

  if (error || !claims?.sub) {
    if (publicPath) return addSecurityHeaders(response, nonce);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return addSecurityHeaders(NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }), nonce);
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return redirectWithCookies(request, loginUrl, response, nonce);
  }

  let profileResult;
  try {
    profileResult = await supabase
      .from("user_profiles")
      .select("role,is_active")
      .eq("user_id", claims.sub)
      .maybeSingle();
  } catch {
    return authUnavailableResponse(request, nonce);
  }
  if (profileResult.error) return authUnavailableResponse(request, nonce);
  const profile = profileResult.data;

  if (!profile || !profile.is_active || profile.role === "pending") {
    if (publicPath) return addSecurityHeaders(response, nonce);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return addSecurityHeaders(NextResponse.json({ error: "Your account is awaiting administrator approval." }, { status: 403 }), nonce);
    }
    return redirectWithCookies(request, new URL("/access-pending", request.url), response, nonce);
  }

  if (request.nextUrl.pathname === "/login") {
    return redirectWithCookies(request, new URL("/", request.url), response, nonce);
  }

  return addSecurityHeaders(response, nonce);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
