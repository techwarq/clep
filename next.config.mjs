const originOf = (url, fallback) => {
  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
};

const API_ORIGIN = originOf(process.env.NEXT_PUBLIC_CLEP_API_URL, "https://api.clep.abstraklabs.com");
const MEDIA_ORIGIN = originOf(process.env.NEXT_PUBLIC_MEDIA_URL, "https://media.clep.abstraklabs.com");
const DEVELOPING = process.env.NODE_ENV !== "production";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEVELOPING ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${MEDIA_ORIGIN}`,
  "font-src 'self'",
  `media-src 'self' blob: ${MEDIA_ORIGIN}`,
  `connect-src 'self' ${API_ORIGIN}${DEVELOPING ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
