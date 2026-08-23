# Asset manifest and provenance

Last reviewed: 22 August 2026

This repository keeps every picture and document used to produce the website. Original files are preserved separately from compressed or cropped web derivatives.

## Official branding

| Repository source | Web derivative | Provenance |
| --- | --- | --- |
| `originals/smarta-official-logo.png` | `../images/brand/smarta-official-logo.png` and `-260.png` | Official logo downloaded from the existing `smarta.co.za` WordPress media library; derivatives are transparently cropped and sized for website use. |
| — | `../images/brand/smarta-mark.png` | Smarta mark from the existing Smarta Estate brand assets. |
| `originals/smarta-mobile-app-icon.png` | `../images/brand/smarta-app-icon.png`, `-192.png` and `-512.png` | Current 1024 px Smarta Mobile application icon from the iOS app project, plus correctly sized web-manifest derivatives. |

## Installation photographs

The twelve installation originals below were supplied in Michael's Downloads folder as the WhatsApp batches dated 20 May, 11 June and 17 June 2026. They were selected after a visual contact-sheet review. Unrelated personal photographs and documents in Downloads were intentionally excluded. Web derivatives are colour-neutral, compressed JPEGs; they are not AI-generated and do not add or remove field equipment.

| Original retained in `originals/installations/` | Web derivative in `../images/installations/` |
| --- | --- |
| `controller-panel-internal-2026-05-20.jpeg` | `controller-panel-internal-2026-05-20.jpg` |
| `solar-borehole-installation-2026-06-11.jpeg` | `solar-borehole-installation-2026-06-11.jpg`, `solar-borehole-installation-2026-06-11.webp`, `solar-borehole-installation-2026-06-11-960.webp` |
| `flow-meter-pump-station-2026-06-11.jpeg` | `flow-meter-pump-station-2026-06-11.jpg` |
| `field-controller-internal-2026-06-11.jpeg` | `field-controller-internal-2026-06-11.jpg` |
| `vfd-control-panel-2026-06-17.jpeg` | `vfd-control-panel-2026-06-17.jpg` |
| `dual-smarta-controller-panel-a-2026-06-17.jpeg` | `dual-smarta-controller-panel-a-2026-06-17.jpg` |
| `vfd-control-panel-alt-2026-06-17.jpeg` | `vfd-control-panel-alt-2026-06-17.jpg` |
| `plc-control-panel-2026-06-17.jpeg` | `plc-control-panel-2026-06-17.jpg` |
| `dual-smarta-controller-panel-b-2026-06-17.jpeg` | `dual-smarta-controller-panel-b-2026-06-17.jpg` |
| `pump-room-pipework-2026-06-17.jpeg` | `pump-room-pipework-2026-06-17.jpg` |
| `pump-room-control-cabinet-2026-06-17.jpeg` | `pump-room-control-cabinet-2026-06-17.jpg` |
| `solar-pump-room-2026-06-17.jpeg` | `solar-pump-room-2026-06-17.jpg` |

## Mobile application images

| Repository source | Web derivative | Provenance |
| --- | --- | --- |
| `originals/app-screenshots/smarta-mobile-sites-ios.png` | `../images/app/smarta-mobile-sites-ios.jpg` | Current Smarta Mobile v3 demo-account Sites screen, built locally and captured on an iPhone 17 Pro iOS 26.5 simulator on 21 August 2026. |
| `originals/app-screenshots/smarta-mobile-live-borehole-ios.png` | `../images/app/smarta-mobile-live-borehole-ios.jpg` | Current demo-account live borehole screen from the same simulator session. No customer production records are visible. |
| `originals/app-screenshots/smarta-mobile-reservoir-anonymised.png` | `../images/app/smarta-mobile-reservoir-anonymised.jpg` | Current reservoir screen captured on an iPhone 17 Pro iOS 26.5 simulator on 22 August 2026. The site name was replaced with `North Reservoir` using the OpenAI built-in image editor; the public image contains no customer name, location or identifier. |
| `originals/smarta-mobile-campaign.png` | `../images/app/smarta-mobile-campaign.png` and `.jpg` | Existing Smarta Mobile campaign composite supplied in Downloads. Retained for provenance even though the homepage uses current product captures. |
| — | `../images/app/app-store-icon.png` | Apple App Store artwork from the mobile application's repository. |
| — | `../images/app/google-play-icon.png` | Google Play artwork from the mobile application's repository. |

Reservoir screenshot edit prompt:

> Use case: text-localization. Asset type: authentic Smarta mobile app screenshot for a public website. Replace only the private site name in the top navigation header with the exact text “North Reservoir”. Change only the site-name text in the top white navigation header. Keep the official Smarta icon, back button, grid button, status bar, reservoir illustration, telemetry values, cards, controls, typography, spacing, colours, dimensions and every other element visually unchanged. Match the existing dark sans-serif header type. Do not add any text, logos, watermarks or decorations.

## Smarta Online product capture

| Repository source | Web derivative | Provenance |
| --- | --- | --- |
| `originals/platform-screenshots/smarta-online-telemetry-anonymised.png` | `../images/platform/smarta-online-telemetry-anonymised.jpg` and `.webp` | Current Smarta Online telemetry screen captured on 22 August 2026. API responses and visible text were rewritten in memory before capture so the public asset contains only the aliases `North Reservoir` and `Smarta Demo`; no customer name, user name, site identifier, credential or location was written to the asset. |

The repeatable capture utility is retained at `../scripts/capture-anonymised-product-screenshots.mjs`. It requires credentials through temporary environment variables, performs a read-only reservoir scan, verifies that private labels are absent and writes only anonymised output. Credentials are never written to the repository.

## Generated brand-supporting image

| Repository source | Web derivative | Mode |
| --- | --- | --- |
| `originals/generated/water-network-hero-source.png` | `../images/brand/water-network-hero.jpg`, `.webp` and `-960.webp` | OpenAI built-in image generation, new image, 21 August 2026. |
| `originals/generated/smarta-sectors-panorama-source.png` | `../images/sectors/smarta-sectors-panorama.jpg`, `.webp` and `-960.webp` | OpenAI built-in image generation, new image, 22 August 2026. |

Exact generation prompt:

> Use case: stylized-concept. Asset type: wide website hero background texture and social-sharing backdrop. Primary request: Create a sophisticated abstract visual suggesting connected water infrastructure, remote telemetry, and flowing groundwater. Use layered topographic contour lines, subtle concentric signal ripples, and fluid translucent currents, with a premium technical editorial feel. Scene/backdrop: deep navy-to-petrol-blue atmospheric field with teal and pale aqua highlights and one extremely subtle warm orange accent echoing industrial control enclosures. Style/medium: refined abstract 3D/graphic hybrid, crisp but organic, high-end B2B technology campaign, realistic material depth without depicting literal equipment. Composition/framing: very wide landscape composition; quiet generous negative space through the left half for website copy; visual energy and detail concentrated toward the right and lower edge; seamless enough to crop responsively. Lighting/mood: luminous, calm, precise, dependable. Constraints: no logo, no brand name, no words, no letters, no numbers, no maps, no people, no devices, no buildings, no watermark; avoid generic stock-tech circuit boards and avoid neon cyberpunk styling.

The generated image is used only as an abstract backdrop. Real installation claims are illustrated with the separately identified field photographs.

Sector panorama generation prompt:

> Use case: stylized-concept
> Asset type: wide homepage sector panorama for a premium B2B water-management website
> Primary request: Create one expansive Southern African landscape that communicates water infrastructure serving four customer worlds: a well-kept residential estate, a large open-pit mine, productive agricultural land, and a municipal town water system. These environments should transition naturally from left to right as one coherent regional panorama, connected visually by reservoirs, water towers, pump stations, pipelines and flowing water routes, without turning into a technical diagram.
> Scene/backdrop: broad elevated view across a dry-to-green Southern African landscape beneath a huge open sky; estate rooftops and landscaped communal spaces, distant mine benches and processing area, irrigated farm fields and centre pivots, and a town with a reservoir/water tower and modest civic infrastructure.
> Subject: the scale and continuity of water across communities and operations, with infrastructure visible but not over-detailed.
> Style/medium: sophisticated editorial 3D illustration with believable materials and atmospheric realism; clearly conceptual, not a documentary installation photograph; high-end architecture and infrastructure campaign visual.
> Composition/framing: very wide cinematic panorama, approximately 2.2:1; strong sense of distance and scale; four readable zones but no hard dividers; calm uncluttered lower and upper margins for responsive cropping; no dominant foreground object.
> Lighting/mood: warm early-morning Southern African light, confident, calm, dependable, optimistic; subtle haze creates depth.
> Color palette: Smarta-aligned deep navy shadows, water blue and teal highlights, sunlit ochre earth, natural greens; restrained rather than saturated.
> Materials/textures: realistic water, vegetation, earth, concrete and metal at an editorial illustration level.
> Constraints: no text, no letters, no numbers, no logos, no brand marks, no UI, no map pins, no data overlays, no people in close-up, no fantasy megastructures, no watermark. Do not imply this is a real Smarta installation. Maintain plausible Southern African geography and infrastructure.
> Avoid: generic smart-city neon graphics, circuit-board motifs, sci-fi cities, glossy stock-photo look, obvious four-panel collage, exaggerated blue water, American suburban architecture.

The panorama creates broad visual context for estates, mines, farms and municipalities and is not a customer-site photograph. The installation gallery remains the source of real field photography.

## Social-sharing card

| Source | Rendered assets | Method |
| --- | --- | --- |
| `social-card-source.html` | `../images/social/smarta-og.png` and `../images/social/smarta-og.jpg` | Deterministic 1200 × 630 browser render combining the official Smarta logo, the real `solar-borehole-installation-2026-06-11` photograph and HTML text. |

The JPEG is referenced by the site's Open Graph and Twitter metadata. The lossless PNG and complete HTML/CSS source are retained so the card can be reproduced or updated without flattening away its provenance.

## Archived documents

All five PDFs in `../documents/` were downloaded from the existing public Smarta website and are committed unchanged:

| File | Description |
| --- | --- |
| `installation-manual-rev37-2018.pdf` | Legacy 39-page Installation Manual, Revision 37, dated 1 May 2018. |
| `solar-powered-pump-design-2018.pdf` | Two-page article on solar-powered pump design. |
| `complete-water-resource-management-2018.pdf` | One-page article on integrated water-resource management. |
| `affordable-pump-control-2018.pdf` | One-page article on affordable remote pump control. |
| `smarta-offers-affordable-pump-control-2018.pdf` | Two-page publication about the original Smarta offering. |

These documents are presented on the website as a historical archive. They may not represent current hardware, firmware, wiring or field practice.
