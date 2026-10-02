import { buildZipSearch } from '../../scripts/zip-form.js';

/**
 * Provider list: one card per row — cell 1 = logo, cell 2 = copy, feature list and
 * "Learn more" link. A row without a logo becomes the "Ready to explore plans?" ZIP card.
 */
export default async function decorate(block) {
  const ul = document.createElement('ul');
  await Promise.all([...block.children].map(async (row) => {
    const li = document.createElement('li');
    const logo = row.querySelector('picture, img');
    const link = [...row.querySelectorAll('a[href]')].pop();

    if (!logo) {
      li.className = 'provider-list-widget';
      li.append(...row.querySelectorAll(':scope > div > *'));
      li.append(await buildZipSearch());
      ul.append(li);
      return;
    }

    const media = document.createElement(link ? 'a' : 'div');
    media.className = 'provider-list-logo';
    if (link) {
      media.href = link.getAttribute('href');
      media.setAttribute('aria-hidden', 'true');
      media.tabIndex = -1;
    }
    const logoP = logo.closest('p');
    media.append(logo);
    if (logoP && !logoP.textContent.trim()) logoP.remove();

    const body = document.createElement('div');
    body.className = 'provider-list-body';
    row.querySelectorAll(':scope > div > *').forEach((el) => body.append(el));
    if (link) {
      const p = link.closest('p');
      link.className = 'provider-list-cta';
      if (p) p.className = 'provider-list-cta-wrapper';
    }
    li.append(media, body);
    ul.append(li);
  }));
  // keep authored order (Promise.all appends as each row finishes)
  block.replaceChildren(ul);
  const widget = ul.querySelector('.provider-list-widget');
  if (widget) ul.append(widget);
}
