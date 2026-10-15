# Plan explorer

Full-width band with a heading and copy on the left and a white card holding the ZIP search on the right. It sits over a background photo that stays fixed while the page scrolls, with the blue-to-pink gradient behind it. It is used on the provider pages.

## Authoring in DA

Create a block table named `Plan Explorer`. **Rows are read by position.**

| Row | Cell 1 | Cell 2 | Required | Notes |
|---|---|---|---|---|
| 1 | Heading 2 + paragraph | ZIP search label text | cell 1: yes; cell 2: no | e.g. `Ready to explore plans?` / `Let us help you find the best plan`. Leave cell 2 out to use the default label. |
| 2 | **Background photo** (image) | – | no | Full-bleed photo behind the band. Original: `hp-hero-bg.jpg` (1440×771). If row 2 is missing, only the gradient is shown. |

```
+-----------------------------------------------------------+
| Plan Explorer                                             |
+------------------------------+----------------------------+
| ## Ready to explore plans?   | (optional) search label    |
| Let us help you find the     |                            |
| best plan                    |                            |
+------------------------------+----------------------------+
| [image: hp-hero-bg.jpg]                                   |
+-----------------------------------------------------------+
```

### Image tips

- Drag the image straight into the cell. Don't paste a link, and keep row 2 to the image alone.
- The photo is decorative, so its alt text is not used.
- Use an image at least 1440px wide. The block requests a 2000px-wide rendition.
- The photo stays fixed while the page scrolls, so only part of it shows at a time. Keep the subject near the centre.
