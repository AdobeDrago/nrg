# ZIP hero

Homepage hero: headline and subhead, the ZIP lookup card, a full-bleed background photo and the purple/pink gradient swoosh. Put it in the first section of the page so the header overlaps it.

## Authoring in DA

Create a one-column block table named `ZIP Hero`. **Rows are read by position**, so keep them in this order. If you skip an optional image, leave its row empty rather than deleting it.

| Row | Content | Required | Notes |
|---|---|---|---|
| 1 | Heading 1 + paragraph | yes | e.g. `Find your energy match.` / `Shop and compare electricity plans to find the best fit for you.` |
| 2 | ZIP field label | yes | e.g. `Enter your ZIP code` |
| 3 | Moving question, followed by `Yes No` | yes | e.g. `Moving to a new address? Yes No`. The Yes/No buttons are generated. |
| 4 | **Background photo** (image) | yes | Full-bleed photo behind the hero on all screen sizes. Original: `hp-hero-main-img2.jpg` (2400×1584). |
| 5 | **Mobile background photo** (image) | no | Replaces row 4 on screens 1024px wide and below. Original: `hp-hero-bg.jpg` (1440×771). If empty, row 4 is used. |
| 6 | **Swoosh overlay** (image) | no | Transparent PNG gradient shape drawn behind the headline on screens wider than 1024px. Original: `hp-hero-inner-bg-big.png`. If empty, no swoosh is shown. |

```
+------------------------------------------------------------------+
| ZIP Hero                                                         |
+------------------------------------------------------------------+
| # Find your energy match.                                        |
| Shop and compare electricity plans to find the best fit for you. |
+------------------------------------------------------------------+
| Enter your ZIP code                                              |
+------------------------------------------------------------------+
| Moving to a new address? Yes No                                  |
+------------------------------------------------------------------+
| [image: hp-hero-main-img2.jpg]                                   |
+------------------------------------------------------------------+
| [image: hp-hero-bg.jpg]                                          |
+------------------------------------------------------------------+
| [image: hp-hero-inner-bg-big.png]                                |
+------------------------------------------------------------------+
```

### Image tips

- Drag the image straight into the cell. Don't paste a link, and keep each image row to the image alone.
- The photos are decorative, so their alt text is not used.
- The swoosh must stay a PNG with a transparent background. A JPG will show a solid box.
- Use images at least as large as the originals above. The block requests 2000px-wide renditions for the desktop photo and swoosh, and 1024px for the mobile photo.
