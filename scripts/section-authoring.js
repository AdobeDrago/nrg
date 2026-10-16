const sizes = ['none', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
const containers = ['narrow', 'standard', 'full'];
const surfaces = ['default', 'subtle', 'muted', 'highlight', 'inverse', 'inverse-raised'];
const imagePath = /\.(avif|gif|jpe?g|png|svg|webp)$|\/media_[0-9a-f]+/i;

/**
 * aem.js decorateSections already turned the Section Metadata table into
 * section.dataset entries (camelCased field names) and removed the table.
 * Reads one field and drops the raw attribute so only data-section-* remain.
 */
function take(section, key) {
  const value = section.dataset[key];
  if (value === undefined) return '';
  delete section.dataset[key];
  return String(value).trim();
}

/** Style classes (also added by aem.js) can carry the same options as aliases. */
function styleOptions(section) {
  const options = {};
  [...section.classList].forEach((name) => {
    const [, grid] = name.match(/^grid-([1-6])$/) || [];
    if (grid) options.grid = grid;
    ['gap', 'spacing', 'container'].forEach((key) => {
      if (name.startsWith(`${key}-`)) options[key] = name.slice(key.length + 1);
    });
    const [, scheme] = name.match(/^(light|dark)-scheme$/) || [];
    if (scheme) options.theme = scheme;
    if (['left', 'center', 'right'].includes(name)) options.align = name;
  });
  return options;
}

function isImageUrl(value) {
  try {
    return imagePath.test(new URL(value, window.location).pathname);
  } catch {
    return false;
  }
}

function backgroundValue(text) {
  const value = text.trim();
  const surface = value.toLowerCase().replace(/^surface-/, '');
  if (surfaces.includes(surface)) {
    return {
      color: `var(--color-surface-${surface})`,
      theme: surface.startsWith('inverse') ? 'dark' : 'light',
    };
  }
  const token = value.match(/^(?:var\(\s*)?(--(?:color|palette|gradient)-[a-z0-9-]+)\s*\)?$/i);
  if (token) {
    return token[1].startsWith('--gradient-') ? { gradient: `var(${token[1]})` } : { color: `var(${token[1]})` };
  }
  if (window.CSS?.supports('color', value)) return { color: value };
  if (/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(value)
    && window.CSS?.supports('background-image', value)) return { gradient: value };
  return null;
}

function setBackground(section, background, color, image, main) {
  const imageUrl = [image, background].find(isImageUrl);
  const value = backgroundValue(color || (isImageUrl(background) ? '' : background));
  if (value?.color) {
    section.style.backgroundColor = value.color;
    section.dataset.sectionBackground = 'color';
  }
  if (value?.gradient) {
    section.style.backgroundImage = value.gradient;
    section.dataset.sectionBackground = 'gradient';
  }
  if (imageUrl && !section.querySelector(':scope > .section-background')) {
    const picture = document.createElement('picture');
    picture.className = 'section-background';
    picture.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.loading = section === main.querySelector(':scope > .section') ? 'eager' : 'lazy';
    img.decoding = 'async';
    picture.append(img);
    section.prepend(picture);
    section.dataset.sectionBackground = 'image';
  }
  return value?.theme;
}

/** Consume authored section options before blocks load, without moving block wrappers. */
export default function decorateSectionAuthoring(main) {
  main.querySelectorAll(':scope > .section').forEach((section) => {
    const options = styleOptions(section);
    ['container', 'grid', 'gap', 'spacing', 'align'].forEach((key) => {
      const value = take(section, key).toLowerCase();
      if (value) options[key] = value;
    });
    const backgroundTheme = setBackground(
      section,
      take(section, 'background'),
      take(section, 'backgroundColor'),
      take(section, 'backgroundImage'),
      main,
    );
    const theme = (take(section, 'colorScheme') || take(section, 'theme')
      || options.theme || backgroundTheme || '').toLowerCase();

    const { container } = options;
    if (containers.includes(container)) section.dataset.sectionContainer = container;
    if (/^[1-6]$/.test(options.grid)) {
      section.dataset.sectionGrid = options.grid;
      section.style.setProperty('--section-grid-count', options.grid);
    }
    if (sizes.includes(options.gap)) section.dataset.sectionGap = options.gap;
    if (sizes.includes(options.spacing)) section.dataset.sectionSpacing = options.spacing;
    if (['left', 'center', 'right'].includes(options.align)) section.dataset.sectionAlign = options.align;
    if (['light', 'dark'].includes(theme)) section.dataset.sectionTheme = theme;

    const anchor = (take(section, 'anchor') || take(section, 'id')).replace(/^#/, '');
    if (anchor && !/\s/.test(anchor)) section.id = anchor;

    if ([...section.attributes].some(({ name }) => name.startsWith('data-section-')
      && name !== 'data-section-status')) section.dataset.sectionLayout = 'authored';
  });
}
