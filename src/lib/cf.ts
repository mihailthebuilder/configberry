import Cloudflare from "cloudflare";

export function cloudflareClient(apiEmail: string, apiKey: string) {
  return new Cloudflare({
    baseURL: "https://app.configberry.com/client/v4",
    apiEmail: apiEmail,
    apiKey: apiKey,
  });
}
