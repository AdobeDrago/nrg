import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import {
  t, blogsPath, formatDate, dateValue,
} from '../../scripts/blog.js';

const DEFAULT_PAGE_SIZE = 6;
const QUERY_INDEX = '/blog-index.json';
// Code-bus snapshot of the migrated posts (all locales); lowest priority, overridden by
// the query index and the authored DA sheet when those are available.
const SEED = '/data/blog-posts.json';

async function fetchSheet(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

/**
 * Posts for the current locale, newest first. Merges the query index (picks up new
 * posts automatically once published) with the authored DA sheet `{locale}/blogs/posts`
 * and the code-bus seed of migrated posts.
 * @param {string} [source] optional explicit sheet / index URL
 * @returns {Promise<object[]>}
 */
async function fetchPosts(source) {
  const base = blogsPath();
  const sources = source ? [source] : [SEED, QUERY_INDEX, `${base}posts.json`];
  const lists = await Promise.all(sources.map(fetchSheet));
  const posts = new Map();
  lists.flat().forEach((row) => {
    const path = (row.path || '').replace(/\/index$/, '/');
    if (!path.startsWith(base) || path === base || row.template === 'blog-index') return;
    posts.set(path, { ...posts.get(path), ...Object.fromEntries(Object.entries(row).filter(([, v]) => v !== '')), path });
  });
  return [...posts.values()]
    .filter((post) => post.title)
    .sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

function cleanTitle(title) {
  return title.replace(/\s*[|–-]\s*Everything Energy\s*$/i, '');
}

function buildCard(post, featured = false) {
  const li = document.createElement('li');
  li.className = featured ? 'blog-list-card blog-list-featured' : 'blog-list-card';
  const link = document.createElement('a');
  link.href = post.path;

  const media = document.createElement('div');
  media.className = 'blog-list-card-image';
  if (post.image && !post.image.includes('default-meta-image')) {
    const widths = featured
      ? [{ media: '(min-width: 600px)', width: '1200' }, { width: '750' }]
      : [{ width: '750' }];
    media.append(createOptimizedPicture(post.image, '', featured, widths));
  }

  const body = document.createElement('div');
  body.className = 'blog-list-card-body';
  if (post.category) {
    const category = document.createElement('p');
    category.className = 'blog-list-card-category';
    category.textContent = post.category;
    body.append(category);
  }
  const title = document.createElement('h2');
  title.className = 'blog-list-card-title';
  title.textContent = cleanTitle(post.title);
  body.append(title);

  const meta = document.createElement('p');
  meta.className = 'blog-list-card-meta';
  if (post.date) {
    const time = document.createElement('time');
    time.dateTime = post.date;
    time.textContent = formatDate(post.date);
    meta.append(time);
  }
  if (post.author) {
    const author = document.createElement('span');
    author.className = 'blog-list-card-author';
    author.textContent = post.author;
    meta.append(author);
  }
  body.append(meta);

  link.append(media, body);
  li.append(link);
  return li;
}

/**
 * Blog listing: featured "most recent" card, grid of cards and a "Load more" button.
 * Optional config rows: `source` (sheet/index URL), `page size` (cards per load).
 * @param {Element} block
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const pageSize = parseInt(config['page-size'], 10) || DEFAULT_PAGE_SIZE;
  block.textContent = '';

  const posts = await fetchPosts(config.source);
  if (!posts.length) return;

  const label = document.createElement('p');
  label.className = 'blog-list-label';
  label.textContent = t('mostRecent');

  const list = document.createElement('ul');
  list.className = 'blog-list-cards';
  list.append(buildCard(posts[0], true));

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'blog-list-more';
  more.textContent = t('loadMore');

  let shown = 1;
  const showMore = () => {
    posts.slice(shown, shown + pageSize).forEach((post) => list.append(buildCard(post)));
    shown = Math.min(posts.length, shown + pageSize);
    more.hidden = shown >= posts.length;
  };
  more.addEventListener('click', () => {
    const first = shown;
    showMore();
    list.children[first]?.querySelector('a')?.focus({ preventScroll: true });
  });
  showMore();

  block.append(label, list, more);
}
