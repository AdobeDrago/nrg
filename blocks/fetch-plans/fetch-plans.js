import { buildZipSearch } from '../../scripts/zip-form.js';

/**
 * Fetch plans card: authored intro text over a ZIP input and a "Fetch plans" button.
 * Authoring: one row; cell 1 = intro (may contain bold), optional cell 2 = button text.
 */
export default async function decorate(block) {
  const [text, buttonCell] = block.querySelectorAll(':scope > div > div');
  const submitLabel = buttonCell?.textContent.trim() || 'Fetch plans';
  const form = await buildZipSearch({ submitLabel });
  const label = form.querySelector('label');
  const intro = text?.querySelector('p') || text;
  if (intro?.textContent.trim()) label.replaceChildren(...intro.childNodes);
  block.replaceChildren(form);
}
