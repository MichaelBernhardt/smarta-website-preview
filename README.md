# Smarta website rebuild

A fast, static marketing site for [Smarta](https://smarta.co.za/), rebuilt around the current pump and water-management product, real installations, the current mobile applications and a clear distinction from [Smarta Estate](https://www.smartaestate.co.za/).

## What is included

- Responsive one-page product site with accessible navigation and progressive enhancement
- Official Smarta logo, twelve original field-installation photographs and a conceptual four-sector panorama
- Two current Smarta Mobile screenshots captured from the built-in demo account on an iOS simulator
- Mobile app links for the Apple App Store and Google Play
- Technical-document archive with all five PDFs used from the existing website
- SEO metadata, Open Graph metadata, JSON-LD, sitemap and robots policy
- `llms.txt` and `llms-full.txt` with explicit product facts and terminology
- Privacy notice and branded 404 page
- Automated browser, accessibility, image and internal-link checks
- GitHub Pages deployment workflow

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

The public scale statement is rounded from aggregate, read-only reviews of production records on 21 and 22 August 2026: over 400 active sites and over 100 million telemetry records. Sector naming signals in the active-site data informed the emphasis on estates, mines, farms and municipal/community systems. No customer-level production data, customer identities, exact locations or production credentials are included in this repository. App screenshots use the product's demo account only.

Homepage copy stays at customer-decision level and avoids implementation caveats. Capabilities still depend on the site and its configuration, so the site assessment remains the starting point. Values in the homepage status card are illustrative and labelled as such.

The privacy page is a practical website/platform overview, not a substitute for reviewing customer contracts, processor arrangements and the final production analytics stack before launch.

## Asset provenance

All photographs and documents used by the site are committed to the repository. Untouched source files live under `assets/originals/`; web-ready derivatives live under `images/`; PDFs live under `documents/`. See [assets/ASSET_MANIFEST.md](assets/ASSET_MANIFEST.md) for the full manifest and provenance.

The abstract water-network background and the four-sector panorama were generated with OpenAI's built-in image generation on 21 and 22 August 2026. They are brand and context assets—not evidence of an installation. Their exact prompts and source paths are recorded in the asset manifest, while the homepage labels the sector panorama as conceptual.

## Deployment

Pushing `main` triggers `.github/workflows/pages.yml`, validates the site and publishes a clean `_site` artifact as a GitHub Pages preview. The source canonical URLs and sitemap intentionally point to `https://smarta.co.za/` for the eventual production launch. During the preview build, only the Open Graph URL and image URL are rewritten to the GitHub Pages address so a shared preview link resolves to the preview rather than the existing production site.

Before replacing production, confirm current contact details, legal copy, app-store availability, analytics/consent requirements and the approved current technical documents. The PDFs in `documents/` are explicitly presented as a 2018 archive.

## Ownership

Smarta branding, photographs, screenshots, documents and copy are retained for the Smarta website project. Do not reuse them outside the authorised Smarta/Mistbits context without permission.
