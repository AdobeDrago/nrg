/**
 * Popular areas list: a title row, then one row per area (tag, linked heading, excerpt).
 */
export default function decorate(block) {
  const [titleRow, ...rows] = [...block.children];
  const title = document.createElement('div');
  title.className = 'popular-areas-title';
  title.append(...(titleRow?.querySelector(':scope > div')?.childNodes || []));
  const list = document.createElement('ul');
  rows.forEach((row) => {
    const li = document.createElement('li');
    const cell = row.querySelector(':scope > div');
    if (!cell) return;
    const heading = cell.querySelector('h2, h3, h4');
    [...cell.children].forEach((child) => {
      if (child.tagName === 'P' && heading && (child.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        child.className = 'popular-areas-tag';
      }
      li.append(child);
    });
    list.append(li);
  });
  block.replaceChildren(title, list);
}
