import { localePrefix } from '../../scripts/locale.js';

const BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>';

/** Wraps an image paragraph and a following italic-only caption paragraph in a figure. */
function buildFigures(content) {
  content.querySelectorAll(':scope > p').forEach((p) => {
    const img = p.querySelector(':scope > img, :scope > picture');
    if (!img || p.textContent.trim()) return;
    const figure = document.createElement('figure');
    figure.append(img);
    const next = p.nextElementSibling;
    const em = next?.tagName === 'P' && next.children.length === 1 ? next.querySelector(':scope > em') : null;
    if (em && next.textContent.trim() === em.textContent.trim()) {
      const caption = document.createElement('figcaption');
      caption.append(...em.childNodes);
      figure.append(caption);
      next.remove();
    }
    p.replaceWith(figure);
  });
}

/**
 * Area of service (city) layout: "All Areas of service" back link, article body and the
 * Fetch plans card in a sticky left sidebar (below the article on mobile).
 * @param {Element} main decorated main element
 */
export default function decorate(main) {
  const section = main.querySelector('.section');
  const content = section?.querySelector('.default-content-wrapper');
  if (!content) return;
  section.classList.add('area-service-article');

  // authored back link: a link-only paragraph before the h1
  const h1 = content.querySelector('h1');
  const first = content.firstElementChild;
  let back = first !== h1 && first?.tagName === 'P' && first.children.length === 1 ? first.querySelector(':scope > a') : null;
  if (back && first.textContent.trim() === back.textContent.trim()) {
    first.remove();
  } else {
    back = document.createElement('a');
    back.href = `${localePrefix()}/areas-of-service/`;
    back.textContent = 'All Areas of service';
  }
  back.className = 'area-service-back';
  back.removeAttribute('title');
  const label = document.createElement('span');
  label.append(...back.childNodes);
  back.innerHTML = BACK_ICON;
  back.append(label);
  section.prepend(back);

  buildFigures(content);

  const cta = section.querySelector('.fetch-plans-wrapper');
  if (cta) {
    const aside = document.createElement('aside');
    aside.className = 'area-service-sidebar';
    aside.append(cta);
    section.append(aside);
  }
}
