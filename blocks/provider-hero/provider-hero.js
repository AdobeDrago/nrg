import { buildZipSearch } from '../../scripts/zip-form.js';

const MOBILE_MEDIA = '(width < 900px)';

/**
 * Combines the authored desktop and mobile images into one art-directed <picture>:
 * the mobile image's sources (scoped to MOBILE_MEDIA) come first, then the desktop
 * image's own responsive sources and <img>, so both keep their full-size renditions.
 */
function artDirected(desktop, mobile) {
  const picture = document.createElement('picture');
  const sourcesOf = (el) => (el.tagName === 'PICTURE' ? [...el.querySelectorAll('source')] : []);
  const mobileImg = mobile.tagName === 'IMG' ? mobile : mobile.querySelector('img');
  // remember the authored wrappers before their contents move into the new picture
  const leftovers = [desktop, mobile].map((el) => el.closest('p') || el);
  // media-bus pictures carry a min-width:600px rendition; on mobile only the smaller ones apply
  const mobileSources = sourcesOf(mobile).filter((s) => !s.media);
  if (!mobileSources.length) {
    const fallback = document.createElement('source');
    fallback.srcset = mobileImg.getAttribute('src');
    mobileSources.push(fallback);
  }
  mobileSources.forEach((s) => { s.media = MOBILE_MEDIA; picture.append(s); });
  picture.append(...sourcesOf(desktop), desktop.tagName === 'IMG' ? desktop : desktop.querySelector('img'));
  leftovers.forEach((el) => el.remove());
  return picture;
}

/**
 * Provider hero: optional back link, h1, intro copy and a logo/illustration.
 * Authoring: one row; cell 1 = [back link], heading, intro; cell 2 = image.
 * Without a back link the block renders the providers landing variant.
 * The `areas` variant adds the ZIP search; its image cell can hold two images,
 * desktop first and mobile second, and the mobile one is shown below 900px.
 */
export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2');
  const images = [...block.querySelectorAll('picture, img:not(picture img)')];
  let picture = images[0];
  if (block.classList.contains('areas') && images.length > 1) picture = artDirected(images[0], images[1]);
  // back link: a paragraph link placed before the heading
  const back = [...block.querySelectorAll('p > a[href]')].find((a) => heading
    // eslint-disable-next-line no-bitwise -- compareDocumentPosition returns a bit mask
    && (heading.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING));

  const title = document.createElement('div');
  title.className = 'provider-hero-title';
  if (heading) title.append(heading);

  const media = document.createElement('div');
  media.className = 'provider-hero-image';
  if (picture) {
    media.append(picture);
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    img.loading = 'eager';
    if (!img.alt && heading) img.alt = heading.textContent.trim();
  }

  const content = [];
  if (back) {
    back.className = 'provider-hero-back';
    back.removeAttribute('title');
    back.closest('p').remove();
    content.push(back);
  } else {
    block.classList.add('landing');
  }

  const intro = document.createElement('div');
  intro.className = 'provider-hero-intro';
  cells.forEach((cell) => {
    [...cell.children].forEach((el) => {
      if (el.textContent.trim()) intro.append(el);
    });
  });

  if (block.classList.contains('areas')) intro.append(await buildZipSearch());

  content.push(title, media, intro);
  block.replaceChildren(...content);
}
