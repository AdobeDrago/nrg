export default function decorate(block) {
  const cards = [...block.querySelectorAll(':scope > div:not(:first-child) > div')];
  const withLogos = cards.filter((card) => card.querySelector('picture, img'));
  if (!cards.length || withLogos.length !== cards.length) return;

  // logo strip: each card becomes a linked logo, like the original "Featured providers" row
  block.classList.add('logos');
  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const name = card.querySelector('h2, h3, h4')?.textContent.trim();
    const picture = card.querySelector('picture') || card.querySelector('img');
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (name && img && !img.alt) img.alt = name;
    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'provider-logo';
    if (link) {
      tile.href = link.getAttribute('href');
      tile.title = name || link.textContent.trim();
    }
    tile.append(picture);
    card.replaceChildren(tile);
  });
}
