import { getMetadata } from '../../scripts/aem.js';
import { localePrefix } from '../../scripts/locale.js';
import {
  t, blogsPath, formatDate,
} from '../../scripts/blog.js';

const WORDS_PER_MINUTE = 190;

const SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.2-1.4 1.4-4.2-4.2A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>';

function readingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const total = Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  const parts = [];
  if (min) parts.push(`${min} ${t(min === 1 ? 'minute' : 'minutes')}`);
  if (sec) parts.push(`${sec} ${t(sec === 1 ? 'second' : 'seconds')}`);
  return parts.join(', ');
}

function buildByline(content) {
  const byline = document.createElement('p');
  byline.className = 'blog-post-byline';
  const date = getMetadata('date');
  const author = getMetadata('author');
  if (date) {
    const time = document.createElement('time');
    time.dateTime = date;
    time.textContent = formatDate(date);
    byline.append(`${t('postedOn')} `, time);
  }
  if (author) {
    const em = document.createElement('em');
    em.textContent = author;
    byline.append(` ${t('by')} `, em);
  }
  const reading = document.createElement('span');
  reading.className = 'blog-post-reading-time';
  reading.textContent = readingTime(content.textContent);
  byline.append(reading);
  return byline;
}

function buildZipCard() {
  const aside = document.createElement('aside');
  aside.className = 'blog-post-sidebar';
  aside.innerHTML = `<form class="blog-post-zip" novalidate>
      <label for="blog-zip"><strong></strong> <span></span></label>
      <input id="blog-zip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code"
        maxlength="5" pattern="[0-9]{5}" aria-describedby="blog-zip-error">
      <p class="blog-post-zip-error" id="blog-zip-error" role="alert" hidden></p>
      <button type="submit"><span></span>${SEARCH_ICON}</button>
    </form>`;
  const form = aside.querySelector('form');
  const input = form.querySelector('input');
  const error = form.querySelector('.blog-post-zip-error');
  form.querySelector('label strong').textContent = t('zipIntroStrong');
  form.querySelector('label span').textContent = t('zipIntro');
  form.querySelector('button span').textContent = t('zipSubmit');
  input.placeholder = t('zipPlaceholder');
  error.textContent = t('zipError');
  form.action = `${localePrefix()}/plans`;

  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 5);
    if (digits !== input.value) input.value = digits;
    if (digits.length === 5) error.hidden = true;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = input.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    window.location.href = `${localePrefix()}/plans?${new URLSearchParams({ zip })}`;
  });
  return aside;
}

/**
 * Blog post layout: "All Blogs" back link, title, byline (date, author, reading time),
 * article body and a ZIP lookup card in a sticky sidebar.
 * @param {Element} main decorated main element
 */
export default function decorate(main) {
  const section = main.querySelector('.section');
  const content = section?.querySelector('.default-content-wrapper');
  if (!content) return;
  section.classList.add('blog-post-article');

  const back = document.createElement('a');
  back.className = 'blog-post-back';
  back.href = blogsPath();
  back.innerHTML = `${BACK_ICON}<span>${t('allBlogs')}</span>`;
  section.prepend(back);

  const h1 = content.querySelector('h1');
  const byline = buildByline(content);
  if (h1) h1.after(byline);
  else content.prepend(byline);

  section.append(buildZipCard());
}
