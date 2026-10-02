import buildZipForm from '../../scripts/zip-form.js';

export default async function decorate(block) {
  const [copyRow, zipRow, movingRow] = block.querySelectorAll(':scope > div');
  copyRow?.classList.add('zip-hero-copy');

  const form = await buildZipForm({
    zipLabel: zipRow?.textContent.trim() || undefined,
    movingLabel: movingRow?.textContent.replace(/\s*Yes\s*No\s*$/i, '').trim() || undefined,
  });

  const cardRow = document.createElement('div');
  cardRow.className = 'zip-hero-form';
  cardRow.append(form);
  zipRow?.remove();
  movingRow?.remove();
  block.prepend(cardRow);
}
