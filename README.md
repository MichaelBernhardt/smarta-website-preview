# Smarta website rebuild

A fast, static marketing site for [Smarta](https://smarta.co.za/), rebuilt around the current pump and water-management product, real installations, the current mobile applications and a clear distinction from [Smarta Estate](https://www.smartaestate.co.za/).

## What is included

- Responsive one-page product site with accessible navigation and progressive enhancement
- Official Smarta logo and twelve original field-installation photographs, including four real sector images
- Current Smarta Mobile screens plus an anonymised reservoir view captured on an iOS simulator
- An anonymised Smarta Online telemetry graph captured from the current web platform
- An anonymised operating example covering 12 boreholes, 3 reservoirs and 24 enabled level-control rules
- Mobile app links for the Apple App Store and Google Play
- Technical resources with all five PDFs carried over from the existing website
- SEO metadata, Open Graph metadata, JSON-LD, sitemap and robots policy
- `llms.txt` and `llms-full.txt` with explicit product facts and terminology
- Privacy notice and branded 404 page
- Automated browser, accessibility, image and internal-link checks
- GitHub Pages deployment workflow
- A dated [competitor visual audit](research/competitor-visual-audit.md) recording the official sites and design decisions used for the August 2026 refinement

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Then open `http://127.0.0.1:4173/`. Run the checks with:

```sh
npm test
```

## Content and claim notes

The public site-count statement is rounded from aggregate, read-only reviews of production records on 21 and 22 August 2026: over 400 active sites. Sector naming signals in the active-site data informed the emphasis on estates, mines, farms and municipal/community systems. The “11 years in business” statement reflects Smarta operating since 2015, as confirmed by the owner. The anonymised customer example was verified by a read-only production review on 23 August 2026: one network contained 12 boreholes, 3 reservoirs and 24 enabled high/low level rules across the reservoirs. The product captures include a small amount of current, anonymised telemetry, but no customer names, account identities, exact locations, site identifiers or production credentials. Private labels were replaced before the public assets were saved.

Homepage copy stays at customer-decision level and avoids implementation caveats. Capabilities still depend on the site and its configuration, so the site assessment remains the starting point.

The privacy page is a practical website/platform overview, not a substitute for reviewing customer contracts, processor arrangements and the final production analytics stack before launch.

## Asset provenance

All photographs, public product captures and documents used by the site are committed to the repository. Source-quality public assets live under `assets/originals/`; web-ready derivatives live under `images/`; PDFs live under `documents/`. See [assets/ASSET_MANIFEST.md](assets/ASSET_MANIFEST.md) for the full manifest and provenance.

The abstract water-network background and four-sector panorama were generated with OpenAI's built-in image generation on 21 and 22 August 2026. Their exact prompts and source paths remain in the asset manifest for provenance. The panorama was removed from the homepage on 23 August 2026 in favour of real field photographs; the abstract background remains a brand-supporting asset rather than evidence of an installation.

## Deployment

Pushing `main` triggers `.github/workflows/pages.yml`, validates the site and publishes a clean `_site` artifact as a GitHub Pages preview. The source canonical URLs and sitemap intentionally point to `https://smarta.co.za/` for the eventual production launch. During the preview build, only the Open Graph URL and image URL are rewritten to the GitHub Pages address so a shared preview link resolves to the preview rather than the existing production site.

Before replacing production, confirm current contact details, legal copy, app-store availability, analytics/consent requirements and the approved current technical documents. The retained PDFs are dated on the resources page where that information is known.

## Ownership

Smarta branding, photographs, screenshots, documents and copy are retained for the Smarta website project. Do not reuse them outside the authorised Smarta/Mistbits context without permission.
