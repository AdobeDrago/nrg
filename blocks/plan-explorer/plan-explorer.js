import { buildZipSearch } from '../../scripts/zip-form.js';

/** media-bus URL of the image in a row, sized for a full-bleed background */
function backgroundUrl(row) {
  const img = row?.querySelector('img');
  if (!img) return null;
  const url = new URL(img.src, window.location.href);
  url.search = new URLSearchParams({ width: 2000, format: 'webply', optimize: 'medium' });
  return url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.href;
}

/**
 * Plan explorer band: heading + copy beside a white card with the ZIP search.
 * Authoring (see README.md): row 1 cell 1 = heading + copy, optional cell 2 = search label text;
 * optional row 2 = background photo.
 */
export default async function decorate(block) {
  const [textRow, bgRow] = block.querySelectorAll(':scope > div');
  const [text, labelCell] = textRow ? textRow.querySelectorAll(':scope > div') : [];
  const label = labelCell?.textContent.trim();

  const bg = backgroundUrl(bgRow);
  if (bg) block.parentElement.style.setProperty('--plan-explorer-bg', `url("${bg}")`);

  const intro = document.createElement('div');
  intro.className = 'plan-explorer-text';
  if (text) intro.append(...text.children);
  const widget = document.createElement('div');
  widget.className = 'plan-explorer-widget';
  widget.append(await buildZipSearch(label ? { label } : {}));
  block.replaceChildren(intro, widget);
}
