import ffetch from '../../scripts/ffetch.js';
import { localePrefix } from '../../scripts/locale.js';

// Site-wide search index (helix-query.yaml); the default index is the fallback until it is built.
const SEARCH_INDEX = '/search-index.json';
const QUERY_INDEX = '/query-index.json';
const MAX_RESULTS = 6;
const LABELS = {
  en: { noResults: 'No pages match your search.', results: 'Suggested pages', search: 'Search' },
  es: {
    noResults: 'Ninguna página coincide con tu búsqueda.', results: 'Páginas sugeridas', search: 'Buscar',
  },
};

/** lower case, no accents, so "deposito" finds "depósito" */
function normalize(text) {
  return (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function cleanTitle(title) {
  return (title || '').replace(/\s*[|–-]\s*(everything energy|todo (sobre )?energ[ií]a)\s*\.?$/i, '').trim();
}

let questionsPromise;

/**
 * True when a path belongs to the current locale: /es/ pages for Spanish,
 * everything else (/en/ and root pages) for English.
 */
function inLocale(path) {
  const isSpanish = path === '/es' || path.startsWith('/es/');
  return localePrefix() === '/es' ? isSpanish : !isSpanish;
}

/**
 * Pages of the current locale with their searchable text normalized once.
 * @returns {Promise<object[]>}
 */
function loadQuestions() {
  if (questionsPromise) return questionsPromise;
  const fetchFrom = (url) => ffetch(url)
    .filter((row) => row.path && inLocale(row.path) && (row.title || row.pageTitle))
    .map((row) => {
      const title = cleanTitle(row.title || row.pageTitle);
      return {
        path: row.path,
        title,
        description: row.description || '',
        search: {
          title: normalize(title),
          rest: normalize(`${row.description || ''} ${row.content || ''}`),
        },
      };
    })
    .all();
  questionsPromise = fetchFrom(SEARCH_INDEX)
    .then((rows) => (rows.length ? rows : fetchFrom(QUERY_INDEX)))
    .catch(() => []);
  return questionsPromise;
}

/**
 * Questions containing every search term, best first: title hits outweigh answer hits,
 * and the whole query in the title wins.
 */
function search(questions, query) {
  const phrase = normalize(query).trim();
  const terms = phrase.split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1);
  if (!terms.length) return [];
  return questions
    .map((q) => {
      let score = q.search.title.includes(phrase) ? 10 : 0;
      const all = terms.every((term) => {
        if (q.search.title.includes(term)) score += 3;
        else if (q.search.rest.includes(term)) score += 1;
        else return false;
        return true;
      });
      return all ? { q, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ q }) => q);
}

/**
 * FAQ hero: title with the pink accent bar and the FAQ search pill,
 * matching the original's hero-single-col.
 * Authoring: row 1 = heading; row 2 (optional) = search placeholder text,
 * plus an optional link to a search results page.
 * Typing suggests matching pages from the site-wide search index (ffetch). With a results page
 * authored, submitting sends GET {results page}?search-faq=QUERY like the original;
 * otherwise it opens the best match.
 */
export default function decorate(block) {
  const [titleRow, searchRow] = block.children;
  const heading = titleRow?.querySelector('h1, h2, h3');
  const labels = LABELS[localePrefix().slice(1)] || LABELS.en;

  const link = searchRow?.querySelector('a[href]');
  const action = link?.getAttribute('href');
  if (link) (link.closest('p') || link).remove();
  const placeholder = searchRow?.textContent.trim() || 'Enter your question';

  const title = document.createElement('div');
  title.className = 'faq-hero-title';
  if (heading) title.append(heading);

  const listId = 'faq-hero-results';
  const form = document.createElement('form');
  form.className = 'faq-hero-search';
  if (action) form.action = action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  form.innerHTML = `<div class="faq-hero-field">
      <input type="text" name="search-faq" autocomplete="off" role="combobox"
        aria-autocomplete="list" aria-expanded="false" aria-controls="${listId}">
      <button type="submit" aria-label="${labels.search}"><i class="ico-search" aria-hidden="true"></i></button>
    </div>
    <ul class="faq-hero-results" id="${listId}" role="listbox" hidden></ul>
    <p class="faq-hero-status" aria-live="polite"></p>`;

  const input = form.querySelector('input');
  const list = form.querySelector('.faq-hero-results');
  const status = form.querySelector('.faq-hero-status');
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  list.setAttribute('aria-label', labels.results);

  let results = [];
  let active = -1;

  const options = () => [...list.children];
  const setActive = (index) => {
    active = index;
    options().forEach((li, i) => li.setAttribute('aria-selected', i === index ? 'true' : 'false'));
    const current = options()[index];
    if (current) {
      input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };
  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  };

  const render = (query) => {
    list.replaceChildren(...results.map((q, i) => {
      const li = document.createElement('li');
      li.id = `${listId}-${i}`;
      li.setAttribute('role', 'option');
      const a = document.createElement('a');
      a.href = q.path;
      a.tabIndex = -1;
      a.textContent = q.title;
      li.append(a);
      return li;
    }));
    const open = results.length > 0;
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    setActive(-1);
    status.textContent = query && !open ? labels.noResults : '';
  };

  let pending = 0;
  const update = async () => {
    const query = input.value.trim();
    pending += 1;
    const request = pending;
    const questions = await loadQuestions();
    if (request !== pending) return; // a newer keystroke already ran
    results = query.length > 1 ? search(questions, query) : [];
    render(query.length > 1 ? query : '');
  };

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  });
  // warm the index before the first keystroke
  input.addEventListener('focus', () => { loadQuestions(); }, { once: true });

  input.addEventListener('keydown', (e) => {
    const count = options().length;
    if (e.key === 'ArrowDown' && count) {
      e.preventDefault();
      if (list.hidden) render(input.value.trim());
      setActive((active + 1) % count);
    } else if (e.key === 'ArrowUp' && count) {
      e.preventDefault();
      setActive(active <= 0 ? count - 1 : active - 1);
    } else if (e.key === 'Escape' && !list.hidden) {
      e.preventDefault();
      close();
    }
  });

  // mousedown fires before the input blurs and closes the list
  list.addEventListener('mousedown', (e) => e.preventDefault());
  form.addEventListener('focusout', (e) => {
    if (!form.contains(e.relatedTarget)) close();
  });

  form.addEventListener('submit', async (e) => {
    const query = input.value.trim();
    if (!query) {
      e.preventDefault();
      input.focus();
      return;
    }
    const chosen = results[active];
    if (chosen) {
      e.preventDefault();
      window.location.href = chosen.path;
      return;
    }
    if (action) return; // results page authored: plain GET submit
    e.preventDefault();
    clearTimeout(timer);
    await update();
    if (results.length) window.location.href = results[0].path;
  });

  const content = document.createElement('div');
  content.className = 'faq-hero-content';
  content.append(title, form);
  block.replaceChildren(content);
}
