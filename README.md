# ConfigBerry

> **Deprecated / unmaintained.** These tools authenticate with Cloudflare
> Global API Keys, which Cloudflare has deprecated in favor of scoped API
> tokens. The code is published for reference only and is not recommended for
> production use. Use Cloudflare API tokens (e.g. via Terraform or the
> official SDK) instead.

A collection of free, browser-based tools to manage Cloudflare WAF security
rules across a large number of zones and accounts — bulk export, copy, and
sync rules without writing Terraform.

[Demo video](https://www.youtube.com/watch?v=a_8ZRacCOcA)

## Tools

- **WAF Sync** — copy WAF custom firewall rules from a source zone to many
  target zones across multiple accounts.
- **Zone Export** — download a CSV of every zone (with API credentials) for a
  given list of Cloudflare accounts.

## How credentials are handled

This is a static site with no backend of its own. Cloudflare API email +
API key are entered/uploaded in the browser and used to call the Cloudflare
API directly from the client. **They are never stored or sent anywhere except
to Cloudflare** (via the proxy described below).

Cloudflare's API does not return permissive CORS headers, so browser requests
cannot hit `api.cloudflare.com` directly. Requests are routed through a thin
reverse proxy that only adds CORS headers and forwards the request unchanged —
it should not log or persist request bodies, headers, or credentials. Run your
own proxy and point the app at it (see Configuration).

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `PUBLIC_CLOUDFLARE_API_BASE_URL` | No | `https://api.cloudflare.com/client/v4` | Base URL for Cloudflare API requests. Set this to your CORS-forwarding reverse proxy. The default works for non-browser use but browser requests will fail CORS without a proxy. |

Set it in a `.env` file at the project root (gitignored):

```
PUBLIC_CLOUDFLARE_API_BASE_URL=https://your-proxy.example.com/client/v4
```

The `PUBLIC_` prefix is required so the value is exposed to client-side code
(Vite/Astro convention).

## Development

```sh
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
```

Built with [Astro](https://astro.build) + React, styled with Tailwind CSS.

## Implementation notes

- Cloudflare SDK: https://github.com/cloudflare/cloudflare-typescript
- Cloudflare API reference: https://developers.cloudflare.com/api/ — to find
  the right SDK method, open the API docs and switch the `cURL` dropdown to
  `TypeScript`.

## License

No license yet — add one before relying on this in your own projects.
