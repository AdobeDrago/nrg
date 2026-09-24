import { loadFragment } from '../../scripts/aem.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? new URL(link.href, window.location).pathname : block.textContent.trim();
  if (!path) return;
  const fragment = await loadFragment(path);
  if (fragment) {
    block.textContent = '';
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment').replaceWith(...fragment.childNodes);
    } else {
      block.append(...fragment.childNodes);
    }
  }
}
