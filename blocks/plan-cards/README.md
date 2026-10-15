# Plan cards

List of electricity plan cards. It has two modes:

- **Authored** (no `?zip=` in the URL): shows the plan cards written in the block.
- **ZIP results** (`?zip=75001` and similar): replaces the authored cards with the plans for that ZIP from `<locale>/data/plans.json` (sheets `zips` and `plans`). Each card shows the provider's logo, taken from the block's logo row.

## Authoring in DA

Create a one-column block table named `Plan Cards`.

| Row | Content | Required |
|---|---|---|
| 1 | Intro: heading + paragraph | yes |
| 2 … n | One plan card per row: Heading 3 (plan name), rate (e.g. `9.9 cents/kWh`), term (e.g. `12-month fixed term`), provider name, description line(s), link (CTA). The first card gets the "Best Value" badge. | at least one |
| last | **Logo row**: one image per provider, nothing else in the row | yes, for ZIP results |

### Logo row

Put the five provider logos in **one row, as images only** (no text in the row). The block identifies each logo by its **alt text**, which must contain the provider's name:

| Alt text | Original file |
|---|---|
| `Reliant` | `/media/providers/reliant-logo.png` |
| `Cirro Energy` | `/media/providers/cirro-logo.png` |
| `Discount Power` | `/media/providers/discount-power-logo.png` |
| `Green Mountain Energy` | `/media/providers/green-mountain-logo.png` |
| `Direct Energy` | `/media/providers/direct-energy-logo.png` |

```
+---------------------------------------------------------------+
| Plan Cards                                                    |
+---------------------------------------------------------------+
| ## Electricity Plans for ZIP 92677                            |
| Showing all available plans in your area. …                   |
+---------------------------------------------------------------+
| ### Truly Free Nights 12                                      |
| 9.9 cents/kWh / 12-month fixed term / Reliant Energy / …      |
+---------------------------------------------------------------+
| … more plan rows …                                            |
+---------------------------------------------------------------+
| [img alt=Reliant] [img alt=Cirro Energy] [img alt=Discount    |
| Power] [img alt=Green Mountain Energy] [img alt=Direct Energy]|
+---------------------------------------------------------------+
```

- The logo row is never shown as a row. The block removes it and uses the logos on the ZIP-result cards.
- Keep the provider names in the alt text untranslated on Spanish pages: they are brand names, and the block matches them in English.
- A provider with no logo in the row gets a card without a logo.
- The logos display at up to 130px wide. Use images at least 260px wide; the originals are 520px.
