/**
 * Details cards: an optional title row (heading, no image) followed by one card per row
 * (icon + title + copy).
 */
export default function decorate(block) {
  const rows = [...block.children];
  const items = [];
  rows.forEach((row) => {
    const hasImage = row.querySelector('picture, img');
    if (!hasImage && row.querySelector('h1, h2, h3') && !items.length) {
      row.className = 'details-cards-title';
      row.replaceChildren(...row.querySelectorAll(':scope > div > *'));
      return;
    }
    const li = document.createElement('li');
    const icon = row.querySelector('picture, img');
    if (icon) {
      const figure = document.createElement('div');
      figure.className = 'details-cards-icon';
      const p = icon.closest('p');
      figure.append(icon);
      if (p && !p.textContent.trim()) p.remove();
      li.append(figure);
    }
    const body = document.createElement('div');
    body.className = 'details-cards-body';
    row.querySelectorAll(':scope > div > *').forEach((el) => body.append(el));
    li.append(body);
    items.push(li);
    row.remove();
  });
  const ul = document.createElement('ul');
  ul.append(...items);
  block.append(ul);
}
