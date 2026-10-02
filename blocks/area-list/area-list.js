/**
 * Area list: a region heading (e.g. "Texas") followed by an alphabetical list of city links.
 * Authoring: one cell with a heading and a bulleted list of links.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;
  const list = cell.querySelector('ul');
  list?.classList.add('area-list-links');
  block.replaceChildren(...cell.childNodes);
}
