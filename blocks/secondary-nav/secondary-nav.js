import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { localePrefix } from '../../scripts/locale.js';

const normalizePath = (path) => path.replace(/\/(index)?$/, '') || '/';

/**
 * Loads the main menu links from the nav document (same source as the header),
 * leaving out the home link like the original.
 * @returns {Promise<HTMLAnchorElement[]>}
 */
async function navLinks() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${localePrefix()}/nav`;
  const fragment = await loadFragment(navPath);
  const menuSection = fragment?.querySelectorAll(':scope > .section')[1];
  const home = normalizePath(`${localePrefix()}/`);
  return [...(menuSection?.querySelectorAll('ul a[href]') || [])]
    .filter((a) => normalizePath(new URL(a.href, window.location).pathname) !== home);
}

/**
 * Secondary nav: desktop-only row of section links under the header,
 * matching the original's secondary-nav-cnt.
 * Authoring: an optional list of links; left empty, it reuses the main menu from the nav.
 */
export default async function decorate(block) {
  const authored = [...block.querySelectorAll('a[href]')];
  const links = authored.length ? authored : await navLinks();

  const current = normalizePath(window.location.pathname);
  const list = document.createElement('ul');
  links.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const url = new URL(link.href, window.location);
    const path = normalizePath(url.pathname);
    // highlight the current section, including its sub pages (e.g. /providers/reliant)
    if (url.origin === window.location.origin && (current === path || current.startsWith(`${path}/`))) {
      link.setAttribute('aria-current', 'page');
    }
    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Secondary');
  nav.append(list);
  block.replaceChildren(nav);
}
