# iptp_ui

Frontend scaffold extracted from `iptp` with matching visual language (colors, spacing, typography, and layout classes).

## Structure

- `index.html`: standalone preview page using IPTP classes
- `templates/`: Django-style template scaffold (`base`, `includes`, `pages`)
- `static/`: copied UI assets (`css`, `js`, `images`, `favicon`)
- `src/`: original IPTP frontend source tree (`sass`, `js`, `images`, `pdf`)

## Quick Preview

From the `iptp_ui` directory, run:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/index.html`
- `http://localhost:4173/search.html?query=temporary%20protected%20status`

## Search API Wiring

`iptp_ui` is wired to call an HTTP search backend at:

- `http://127.0.0.1:8010/search`

Start the backend from `iptp_search`:

```bash
python3 -m scripts.api --host 127.0.0.1 --port 8010
```

If needed, override the API base URL in `index.html` by setting:

```html
<script>
  window.IPTP_SEARCH_API_BASE = "http://your-host:your-port";
</script>
```

Page behavior:

- `index.html`: home/landing page content
- `search.html`: dedicated results page (no home content block)
