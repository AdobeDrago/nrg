/** "Green Mountain Energy" -> "green-mountain-energy"; keys the provider's quote color */
const slug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Card layout from the original: head (quote mark, title, author), review text,
 * and an optional provider logo footer (an authored image; its alt names the provider).
 */
function buildCard(cell) {
  const li = document.createElement('li');
  li.className = 'review-card';

  const picture = cell.querySelector('picture') || cell.querySelector('img');
  const logoImg = picture?.tagName === 'IMG' ? picture : picture?.querySelector('img');
  // drop the paragraph DA wraps around the image so it isn't read as review text
  if (picture) (picture.closest('p') || picture).remove();

  const head = document.createElement('div');
  head.className = 'review-head';
  const title = cell.querySelector('h2, h3, h4');
  const [author, ...text] = [...cell.querySelectorAll(':scope > p')];
  author?.classList.add('review-author');
  head.append(...[title, author].filter(Boolean));

  const body = document.createElement('div');
  body.className = 'review-text';
  body.append(...text);
  li.append(head, body);

  if (picture) {
    const logo = document.createElement('figure');
    logo.className = 'review-logo';
    logo.append(picture);
    li.append(logo);
    if (logoImg?.alt) li.dataset.provider = slug(logoImg.alt);
  }
  return li;
}

export default function decorate(block) {
  const [heading, ...reviews] = block.querySelectorAll(':scope > div');
  heading?.classList.add('reviews-heading');

  const track = document.createElement('ul');
  track.className = 'reviews-track';
  reviews.forEach((row) => {
    track.append(buildCard(row.querySelector(':scope > div')));
    row.remove();
  });

  const viewport = document.createElement('div');
  viewport.className = 'reviews-viewport';
  viewport.append(track);

  const scrollBy = (dir) => {
    // one card per click: the distance between neighbouring cards includes the column gap
    const [first, second] = track.querySelectorAll('.review-card');
    const step = second ? second.offsetLeft - first.offsetLeft : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  ['prev', 'next'].forEach((dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `reviews-nav reviews-${dir}`;
    btn.setAttribute('aria-label', dir === 'prev' ? 'Previous reviews' : 'Next reviews');
    btn.addEventListener('click', () => scrollBy(dir === 'prev' ? -1 : 1));
    viewport.append(btn);
  });

  const updateNav = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    viewport.querySelector('.reviews-prev').disabled = track.scrollLeft <= 2;
    viewport.querySelector('.reviews-next').disabled = track.scrollLeft >= max;
  };
  track.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  requestAnimationFrame(updateNav);

  block.append(viewport);
}
