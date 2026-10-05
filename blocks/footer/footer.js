import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { isHomePath, localePrefix } from '../../scripts/locale.js';

/**
 * Groups each heading and the siblings that follow it into a column.
 * @param {Element} wrapper default content wrapper
 */
function buildColumns(wrapper) {
  const headings = wrapper.querySelectorAll(':scope > h2, :scope > h3, :scope > h4');
  if (!headings.length) return;
  wrapper.classList.add('footer-columns');
  let col;
  [...wrapper.children].forEach((el) => {
    if (/^H[2-4]$/.test(el.tagName) || !col) {
      col = document.createElement('div');
      col.className = 'footer-col';
      wrapper.append(col);
    }
    col.append(el);
  });
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `${localePrefix()}/footer`;
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // a section holding a single home link becomes the brand logo
  const brand = [...footer.querySelectorAll('.section')].find((section) => {
    const links = section.querySelectorAll('a');
    return links.length === 1 && isHomePath(links[0].href)
      && section.textContent.trim() === links[0].textContent.trim();
  });
  if (brand) {
    brand.classList.add('footer-brand');
    const link = brand.querySelector('a');
    const label = link.textContent.trim();
    link.className = '';
    link.removeAttribute('title');
    link.innerHTML = `<img src="${window.hlx.codeBasePath}/icons/favicon.svg" alt="" width="32" height="32">
      <img src="${window.hlx.codeBasePath}/icons/logo.svg" alt="${label}" width="292" height="33">`;
  }

  footer.querySelectorAll('.default-content-wrapper').forEach(buildColumns);
  block.append(footer);
}
