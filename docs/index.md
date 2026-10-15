---
layout: default
title: NRG Site Updates
---

# NRG Site Updates

## Working ZIP Codes

The following ZIP codes were reported as working. Plan availability and counts may change.

| ZIP | City | Plans / Result |
| --- | --- | --- |
| [78664](https://main--nrg--adobedrago.aem.page/en/plans?zip=78664) | Round Rock, TX | 13 |
| [75201](https://main--nrg--adobedrago.aem.page/en/plans?zip=75201) | Dallas, TX | 13 |
| [77002](https://main--nrg--adobedrago.aem.page/en/plans?zip=77002) | Houston, TX | 13 |
| [77573](https://main--nrg--adobedrago.aem.page/en/plans?zip=77573) | League City, TX | 12 |
| [78401](https://main--nrg--adobedrago.aem.page/en/plans?zip=78401) | Corpus Christi, TX | 11 |
| [79401](https://main--nrg--adobedrago.aem.page/en/plans?zip=79401) | Lubbock, TX | 11 |
| [92677](https://main--nrg--adobedrago.aem.page/en/plans?zip=92677) | Laguna Niguel, CA | 8 |
| [10001](https://main--nrg--adobedrago.aem.page/en/plans?zip=10001) | New York (unsupported) | "Sorry..." message |

## Site-wide Fixes

- **Header** ([3b5f35c](https://github.com/AdobeDrago/nrg/commit/3b5f35c)): Rebuilt with the logo, phone number, Espa&ntilde;ol pill and Menu flyout, plus fixes to the footer, hero and logos.
- **Plans** ([2f2ee5a](https://github.com/AdobeDrago/nrg/commit/2f2ee5a)): Reworked plan cards and personalization, and added the pool-savings and FAQ category card blocks.
- **ZIP lookup** ([61259aa](https://github.com/AdobeDrago/nrg/commit/61259aa)): The ZIP form leads to a plans page that reads `/data/plans`, with a "Sorry..." message for ZIPs without plans.
- **Sidekick** ([d89852c](https://github.com/AdobeDrago/nrg/commit/d89852c)): Edit now opens the page in DA.
- **Languages** ([4f9f74a](https://github.com/AdobeDrago/nrg/commit/4f9f74a)): Added root, `/en` and `/es` support. The menu, footer, data and ZIP links stay in the current language, and Espa&ntilde;ol switches to the `/es` version.

## Migrated Sections

- **Providers** ([20da62c](https://github.com/AdobeDrago/nrg/commit/20da62c)): Landing page and 5 Texas provider pages.
- **Blogs** ([00d5156](https://github.com/AdobeDrago/nrg/commit/00d5156), [8f78fbc](https://github.com/AdobeDrago/nrg/commit/8f78fbc), [8075833](https://github.com/AdobeDrago/nrg/commit/8075833), [41f88cb](https://github.com/AdobeDrago/nrg/commit/41f88cb), [646b8c5](https://github.com/AdobeDrago/nrg/commit/646b8c5)): Blog listing with Load more and the post layout, used by all 100 posts.
- **Areas of Service** ([15c8ca2](https://github.com/AdobeDrago/nrg/commit/15c8ca2)): City page layout and plan results with filter chips, for 63 cities and 124 Texas ZIPs.
- **FAQs** ([3854e2c](https://github.com/AdobeDrago/nrg/commit/3854e2c)): Category and question page layouts, plus a fix for answers losing their first paragraph.
- **FAQ back links** ([22b253f](https://github.com/AdobeDrago/nrg/commit/22b253f), [82f96a9](https://github.com/AdobeDrago/nrg/commit/82f96a9), [ac1a832](https://github.com/AdobeDrago/nrg/commit/ac1a832)): Now go to `/faqs` instead of the 404ing `/faqs/`.