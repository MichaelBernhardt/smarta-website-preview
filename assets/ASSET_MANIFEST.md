# Asset manifest and provenance

Last reviewed: 21 August 2026

This repository keeps every picture and document used to produce the website. Original files are preserved separately from compressed or cropped web derivatives.

## Official branding

| Repository source | Web derivative | Provenance |
| --- | --- | --- |
| `originals/smarta-official-logo.png` | `../images/brand/smarta-official-logo.png` | Official logo downloaded from the existing `smarta.co.za` WordPress media library; derivative is transparently cropped for the header. |
| — | `../images/brand/smarta-mark.png` | Smarta mark from the existing Smarta Estate brand assets. |
| `originals/smarta-mobile-app-icon.png` | `../images/brand/smarta-app-icon.png`, `-192.png` and `-512.png` | Current 1024 px Smarta Mobile application icon from the iOS app project, plus correctly sized web-manifest derivatives. |

## Installation photographs

The twelve installation originals below were supplied in Michael's Downloads folder as the WhatsApp batches dated 20 May, 11 June and 17 June 2026. They were selected after a visual contact-sheet review. Unrelated personal photographs and documents in Downloads were intentionally excluded. Web derivatives are colour-neutral, compressed JPEGs; they are not AI-generated and do not add or remove field equipment.

| Original retained in `originals/installations/` | Web derivative in `../images/installations/` |
| --- | --- |
| `controller-panel-internal-2026-05-20.jpeg` | `controller-panel-internal-2026-05-20.jpg` |
| `solar-borehole-installation-2026-06-11.jpeg` | `solar-borehole-installation-2026-06-11.jpg` |
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
| `originals/smarta-mobile-campaign.png` | `../images/app/smarta-mobile-campaign.png` and `.jpg` | Existing Smarta Mobile campaign composite supplied in Downloads. Retained even though the final homepage favours the two live demo captures. |
| — | `../images/app/app-store-icon.png` | Apple App Store artwork from the mobile application's repository. |
| — | `../images/app/google-play-icon.png` | Google Play artwork from the mobile application's repository. |

## Generated brand-supporting image

| Repository source | Web derivative | Mode |
| --- | --- | --- |
| `originals/generated/water-network-hero-source.png` | `../images/brand/water-network-hero.jpg` | OpenAI built-in image generation, new image, 21 August 2026. |

Exact generation prompt:

> Use case: stylized-concept. Asset type: wide website hero background texture and social-sharing backdrop. Primary request: Create a sophisticated abstract visual suggesting connected water infrastructure, remote telemetry, and flowing groundwater. Use layered topographic contour lines, subtle concentric signal ripples, and fluid translucent currents, with a premium technical editorial feel. Scene/backdrop: deep navy-to-petrol-blue atmospheric field with teal and pale aqua highlights and one extremely subtle warm orange accent echoing industrial control enclosures. Style/medium: refined abstract 3D/graphic hybrid, crisp but organic, high-end B2B technology campaign, realistic material depth without depicting literal equipment. Composition/framing: very wide landscape composition; quiet generous negative space through the left half for website copy; visual energy and detail concentrated toward the right and lower edge; seamless enough to crop responsively. Lighting/mood: luminous, calm, precise, dependable. Constraints: no logo, no brand name, no words, no letters, no numbers, no maps, no people, no devices, no buildings, no watermark; avoid generic stock-tech circuit boards and avoid neon cyberpunk styling.

The generated image is used only as an abstract backdrop. Real installation claims are illustrated with the separately identified field photographs.

## Social-sharing card

| Source | Rendered assets | Method |
| --- | --- | --- |
| `social-card-source.html` | `../images/social/smarta-og.png` and `../images/social/smarta-og.jpg` | Deterministic 1200 × 630 browser render combining the official Smarta logo, the generated abstract backdrop, real `solar-pump-room-2026-06-17` installation photograph and HTML text. |

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
