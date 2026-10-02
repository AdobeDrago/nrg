import { buildZipSearch } from '../../scripts/zip-form.js';

/**
 * Plan explorer band: heading + copy beside a white card with the ZIP search.
 * Authoring: one row; cell 1 = heading + copy; optional cell 2 = search label text.
 */
export default async function decorate(block) {
  const [text, labelCell] = block.querySelectorAll(':scope > div > div');
  const label = labelCell?.textContent.trim();
  const intro = document.createElement('div');
  intro.className = 'plan-explorer-text';
  if (text) intro.append(...text.children);
  const widget = document.createElement('div');
  widget.className = 'plan-explorer-widget';
  widget.append(await buildZipSearch(label ? { label } : {}));
  block.replaceChildren(intro, widget);
}
