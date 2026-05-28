/** @type {import('next').NextConfig} */
const { execSync } = require('child_process');

const getCommitId = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_ID: getCommitId(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "img.shields.io" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com https://*.firebaseio.com https://va.vercel-scripts.com",
      "script-src-elem 'self' 'unsafe-inline' https://app.cal.com https://*.firebaseio.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://cdnjs.cloudflare.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.gstatic.com https://app.cal.com https://codeforces.com https://api.github.com https://img.shields.io https://api.cloudinary.com",
      "frame-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
