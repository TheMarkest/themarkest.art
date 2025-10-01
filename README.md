# TheMarkest.art

Static multilingual portfolio site for digital and physical artist Mark Bogdanov. The landing page combines Three.js visuals, animated typography, and localized JSON content for English, Russian, Kazakh, and Ukrainian.

## Project highlights
- **Single-page experience** powered by `index.html` with inline CSS and vanilla JavaScript for interactions.
- **Dynamic cover animation** implemented in `cover.js` using Three.js (CDN-loaded).
- **Language-aware content** loaded at runtime from JSON datasets (e.g. `entext.json`, `ruport.json`).
- **Media assets** served from the `assets/` folder with WebP fallbacks where available.

## Repository layout
```
index.html              # Entry point containing layout, styles, and core scripts
cover.js                # Three.js cover animation and parallax logic
*-text.json / *-port.json  # Localized text and portfolio data per language
assets/                 # Images, videos, and favicons
fonts/                  # Custom Handjet variable font
```

## Local development
The site is fully static; you can preview it by serving the repository root with any HTTP server. For example:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Content updates
1. Edit the appropriate `*-text.json` file to change copy (headings, biography, etc.).
2. Update `*-port.json` to add or remove portfolio items. Media files should live in `assets/`.
3. Regenerate optimized images (`.webp` + original) before committing large assets.

## Deployment
The project is designed for static hosting (e.g., GitHub Pages, Netlify, Vercel). Ensure CDN dependencies such as Three.js and Google Analytics remain accessible over HTTPS.

## Maintenance ideas
- Extract inline styles into version-controlled CSS for better caching and readability.
- Validate JSON schema for portfolio entries to avoid runtime fetch errors.
- Add automated image optimization to keep asset sizes consistent.
