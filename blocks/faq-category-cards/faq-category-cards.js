// The original's category icons (white PNGs), keyed by the category slug in the card link;
// cards with another link fall back to their position.
const ICONS = [
  ['about-electricity-plans', 'faq-lighting.png'],
  ['about-everything-energy', 'faq-marque.png'],
  ['industry-infrastructure', 'faq-infra.png'],
  ['power-outages', 'faq-ocu.png'],
  ['switching-providers', 'faq-refresh.png'],
];

function iconFor(href, index) {
  const slug = href ? new URL(href, window.location).pathname.replace(/\/$/, '').split('/').pop() : '';
  const [, file] = ICONS.find(([key]) => key === slug) || ICONS[index % ICONS.length];
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/faq/${file}`;
  img.alt = '';
  img.width = 50;
  img.height = 50;
  img.loading = 'lazy';
  return img;
}

export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const heading = cell.querySelector('h2, h3, h4, h5');
    const link = cell.querySelector('a');
    const desc = [...cell.querySelectorAll('p')].find((p) => !p.querySelector('a'));

    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'faq-category-tile';
    if (link) tile.href = link.getAttribute('href');
    if (desc) tile.title = desc.textContent.trim();
    tile.append(iconFor(link?.getAttribute('href'), i));
    const title = document.createElement('span');
    title.className = 'faq-category-title';
    title.textContent = heading?.textContent.trim() || link?.textContent.trim() || '';
    tile.append(title);

    row.className = `faq-category-card faq-category-card-${(i % 5) + 1}`;
    row.replaceChildren(tile);
  });
}
