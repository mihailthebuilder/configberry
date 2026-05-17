import Cloudflare from "cloudflare";

// The Cloudflare API does not send permissive CORS headers, so browser
// requests must go through a same-origin/permissive reverse proxy. Point
// PUBLIC_CLOUDFLARE_API_BASE_URL at your proxy. Falls back to Cloudflare's
// official API (works for non-browser usage / a proxy that mirrors the path).
const baseURL =
  import.meta.env.PUBLIC_CLOUDFLARE_API_BASE_URL ??
  "https://api.cloudflare.com/client/v4";

export function cloudflareClient(apiEmail: string, apiKey: string) {
  return new Cloudflare({
    baseURL,
    apiEmail: apiEmail,
    apiKey: apiKey,
  });
}
