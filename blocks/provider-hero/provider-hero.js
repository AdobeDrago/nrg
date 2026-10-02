/**
 * Provider hero: optional back link, h1, intro copy and a logo/illustration.
 * Authoring: one row; cell 1 = [back link], heading, intro; cell 2 = image.
 * Without a back link the block renders the providers landing variant.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2');
  const picture = block.querySelector('picture, img');
  const back = [...block.querySelectorAll('p > a[href]')]
    .find((a) => heading && (heading.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING));

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

  content.push(title, media, intro);
  block.replaceChildren(...content);
}
