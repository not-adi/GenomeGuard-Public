export default function robots() {
  const BASE_URL = "https://www.genomeguard.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/blogs-publications", "/careers", "/abha", "/privacy", "/terms"],
        disallow: ["/profile", "/results", "/api/", "/_next/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
