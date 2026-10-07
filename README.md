# Everything Energy

AEM Edge Delivery Services site for NRG's electricity plan comparison site (Texas & Pennsylvania)..

## Environments

| Environment | URL |
|---|---|
| Preview | https://main--everything-energy--AdobeDrago.aem.page/ |
| Live | https://main--everything-energy--AdobeDrago.aem.live/ |
| Document Authoring | https://da.live/#/AdobeDrago/everything-energy |
| GitHub | https://github.com/AdobeDrago/everything-energy |

## Update Notes

The [site update notes and working ZIP codes](docs/index.md) are ready for GitHub Pages.
To publish them, push the changes and select **Deploy from a branch**, **main**, and **/docs** in the repository's **Settings > Pages**.

## Content Source

This site uses **DA (Document Authoring)** as the content source:
- Content is authored in **DA.live** (https://da.live/#/AdobeDrago/everything-energy)
- Mountpoint: `https://content.da.live/AdobeDrago/everything-energy`
- Content pages are HTML files managed through DA

## Local Development

1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
2. Start local dev server: `aem up` (opens browser at http://localhost:3000)
3. Open DA.live for content authoring

## Blocks

| Block | Description |
|---|---|
| Hero | Full-width hero with background image and overlay text |
| Cards | Card grid with image + text |
| Columns | Multi-column layout |
| Fragment | Include content fragments |
| Header | Site navigation |
| Footer | Site footer |

## Sidekick

Install the [AEM Sidekick extension](https://www.aem.live/tools/sidekick/) and add this project:
- **URL**: https://github.com/AdobeDrago/everything-energy
