import { loadCSS } from '../../scripts/aem.js';
import decorateArticle from '../area-service/area-service.js';

/**
 * Single FAQ (question) layout — same article + sticky "Fetch plans" sidebar as the
 * area-service template, plus the "Posted on … by …" byline under the h1.
 * @param {Element} main decorated main element
 */
export default async function decorate(main) {
  await loadCSS(`${window.hlx.codeBasePath}/templates/area-service/area-service.css`);
  decorateArticle(main);
  const section = main.querySelector('.area-service-article');
  if (!section) return;
  section.classList.add('faq-question-article');
  const byline = section.querySelector('.default-content-wrapper h1 + p');
  if (byline && /^posted on/i.test(byline.textContent.trim())) byline.classList.add('faq-question-byline');
}
