const ICONS = [
  '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
  '<path d="M12 3a9 9 0 1 0 8.5 12h-4.2A5 5 0 1 1 17 10H9.5v3H21A9 9 0 0 0 12 3z"/>',
  '<circle cx="12" cy="4" r="2.4"/><circle cx="5" cy="17" r="2.4"/><circle cx="12" cy="17" r="2.4"/><circle cx="19" cy="17" r="2.4"/><circle cx="12" cy="21" r="2.4"/><path d="M11 6h2v4h7v5h-2v-3h-5v3h-2v-3H6v3H4v-5h7z"/>',
  '<path d="M6.5 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM17.5 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6zM8 7h8v4H8z"/>',
  '<path d="M12 4a8 8 0 0 1 7.4 5H22l-3.5 4-3.5-4h2.2A5.8 5.8 0 0 0 6.6 8.6L5 7A8 8 0 0 1 12 4zM12 20a8 8 0 0 1-7.4-5H2l3.5-4L9 15H6.8a5.8 5.8 0 0 0 10.6.4L19 17a8 8 0 0 1-7 3z"/>',
];

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
    tile.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i % ICONS.length]}</svg>`;
    const title = document.createElement('span');
    title.className = 'faq-category-title';
    title.textContent = heading?.textContent.trim() || link?.textContent.trim() || '';
    tile.append(title);

    row.className = `faq-category-card faq-category-card-${(i % 5) + 1}`;
    row.replaceChildren(tile);
  });
}
