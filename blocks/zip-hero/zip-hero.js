import buildZipForm from '../../scripts/zip-form.js';

// authored image rows (0-based); see README.md for the full content model
const BG_ROW = 3; // full-bleed photo, all widths
const BG_MOBILE_ROW = 4; // photo for screens <= 1024px; falls back to BG_ROW
const SWOOSH_ROW = 5; // transparent gradient swoosh, screens > 1024px

/** media-bus URL of the image in a row, without the delivery query string */
function imageUrl(row) {
  const img = row?.querySelector('img');
  if (!img) return null;
  const url = new URL(img.src, window.location.href);
  url.search = '';
  return url;
}

function sized(url, width, format) {
  const out = new URL(url);
  out.search = new URLSearchParams({ width, format, optimize: 'medium' });
  return out.origin === window.location.origin ? `${out.pathname}${out.search}` : out.href;
}

/** eager, art-directed background photo behind the whole block wrapper */
function buildBackground(bg, bgMobile) {
  const picture = document.createElement('picture');
  picture.className = 'zip-hero-bg';
  if (bgMobile) {
    picture.innerHTML = `<source media="(max-width: 1024px)" type="image/webp" srcset="${sized(bgMobile, 1024, 'webply')}">`;
  }
  picture.insertAdjacentHTML('beforeend', `<source type="image/webp" srcset="${sized(bg, 2000, 'webply')}">`);

  // decorative: the headline and form carry the meaning
  const img = document.createElement('img');
  img.src = sized(bg, 2000, 'pjpg');
  img.alt = '';
  img.loading = 'eager';
  img.fetchPriority = 'high';
  picture.append(img);
  return picture;
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const [copyRow, zipRow, movingRow] = rows;
  copyRow?.classList.add('zip-hero-copy');

  const bg = imageUrl(rows[BG_ROW]) || imageUrl(rows[BG_MOBILE_ROW]);
  const bgMobile = imageUrl(rows[BG_MOBILE_ROW]);
  const swoosh = imageUrl(rows[SWOOSH_ROW]);
  if (bg) block.parentElement.prepend(buildBackground(bg, bgMobile));
  if (swoosh) block.style.setProperty('--zip-hero-swoosh', `url("${sized(swoosh, 2000, 'png')}")`);
  rows.slice(BG_ROW).forEach((row) => row.remove());

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
