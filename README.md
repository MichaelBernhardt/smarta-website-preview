# Smarta website rebuild

A fast, static marketing site for [Smarta](https://smarta.co.za/), rebuilt around the current pump and water-management product, real installations, the current mobile applications and a clear distinction from [Smarta Estate](https://www.smartaestate.co.za/).

## What is included

- Responsive one-page product site with accessible navigation and progressive enhancement
- Official Smarta logo and twelve original field-installation photographs
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

The public scale statement is rounded from an aggregate, read-only review of production records on 21 August 2026: over 400 active sites and over 100 million telemetry records. No customer-level production data or production credentials are included in this repository. App screenshots use the product's demo account only.

Water-quality copy deliberately says “monitoring-only.” Capabilities depend on fitted sensors and site configuration. Values in the homepage telemetry card are illustrative and labelled as such.

The privacy page is a practical website/platform overview, not a substitute for reviewing customer contracts, processor arrangements and the final production analytics stack before launch.

## Asset provenance

All photographs and documents used by the site are committed to the repository. Untouched source files live under `assets/originals/`; web-ready derivatives live under `images/`; PDFs live under `documents/`. See [assets/ASSET_MANIFEST.md](assets/ASSET_MANIFEST.md) for the full manifest and provenance.

The abstract water-network background was generated with OpenAI's built-in image generation on 21 August 2026. It was created as a brand-supporting texture—not as evidence of an installation. Its exact prompt and source path are recorded in the asset manifest.

## Deployment

Pushing `main` triggers `.github/workflows/pages.yml`, validates the site and publishes the repository as a GitHub Pages preview. The canonical URLs and sitemap intentionally point to `https://smarta.co.za/` for the eventual production launch.

Before replacing production, confirm current contact details, legal copy, app-store availability, analytics/consent requirements and the approved current technical documents. The PDFs in `documents/` are explicitly presented as a 2018 archive.

## Ownership

Smarta branding, photographs, screenshots, documents and copy are retained for the Smarta website project. Do not reuse them outside the authorised Smarta/Mistbits context without permission.
