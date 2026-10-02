export default function decorate(block) {
  const [heading, ...reviews] = block.querySelectorAll(':scope > div');
  heading?.classList.add('reviews-heading');

  const track = document.createElement('ul');
  track.className = 'reviews-track';
  reviews.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'review-card';
    const cell = row.querySelector(':scope > div');
    const [author] = cell.querySelectorAll('p');
    author?.classList.add('review-author');
    li.append(...cell.childNodes);
    track.append(li);
    row.remove();
  });

  const viewport = document.createElement('div');
  viewport.className = 'reviews-viewport';
  viewport.append(track);

  const scrollBy = (dir) => {
    const card = track.querySelector('.review-card');
    const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
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
