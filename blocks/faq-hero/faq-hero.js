import { localePrefix } from '../../scripts/locale.js';

/**
 * FAQ hero: title with the pink accent bar and the FAQ search pill,
 * matching the original's hero-single-col.
 * Authoring: row 1 = heading; row 2 (optional) = search placeholder text,
 * plus an optional link to the search results page.
 * Searching submits GET {results page}?search-faq=QUERY like the original.
 */
export default function decorate(block) {
  const [titleRow, searchRow] = block.children;
  const heading = titleRow?.querySelector('h1, h2, h3');

  const link = searchRow?.querySelector('a[href]');
  const action = link?.getAttribute('href') || `${localePrefix()}/faq-result`;
  if (link) (link.closest('p') || link).remove();
  const placeholder = searchRow?.textContent.trim() || 'Enter your question';

  const title = document.createElement('div');
  title.className = 'faq-hero-title';
  if (heading) title.append(heading);

  const form = document.createElement('form');
  form.className = 'faq-hero-search';
  form.action = action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  form.innerHTML = `<div class="faq-hero-field">
      <input type="text" name="search-faq" autocomplete="off">
      <button type="submit" aria-label="Search"><i class="ico-search" aria-hidden="true"></i></button>
    </div>`;

  const input = form.querySelector('input');
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      input.focus();
    }
  });

  const content = document.createElement('div');
  content.className = 'faq-hero-content';
  content.append(title, form);
  block.replaceChildren(content);
}
