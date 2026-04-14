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
