# Provider hero

Page hero for the provider pages and the areas-of-service landing page: optional back link, heading, intro copy and an image.

- **Default** (`Provider Hero`): a provider detail page when cell 1 starts with a back link (e.g. `All Providers`), or the providers landing page when it doesn't.
- **`Provider Hero (areas)`**: the areas-of-service landing page. Adds the ZIP search under the intro and can show a different image on mobile.

## Authoring in DA

One row, two cells.

| Cell | Content | Required |
|---|---|---|
| 1 | Optional back link paragraph, then Heading 1, then intro paragraph(s) | yes |
| 2 | Image (see below) | yes |

### Image cell for `Provider Hero (areas)`

Put **both images in cell 2, one after the other**:

1. **Desktop image first.** Landscape map shown at 900px and wider. Original: `area-of-service.png` (1189×590).
2. **Mobile image second.** Portrait map shown below 900px. Original: `area-of-service-mobile.png` (720×1000).

```
+-----------------------------------+------------------------------------+
| Provider Hero (areas)                                                  |
+-----------------------------------+------------------------------------+
| # Areas of Service                | [image: area-of-service.png]       |
| Providers listed on this site ... | [image: area-of-service-mobile.png]|
+-----------------------------------+------------------------------------+
```

- The block merges the two images into one responsive picture, so only one image appears on the page.
- If cell 2 holds only one image, it is used at every screen size.
- The alt text of the first image is used. If it's empty, the heading text is used instead.
- The default variant uses only the first image in cell 2.
