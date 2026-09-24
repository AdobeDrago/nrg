/*
 * Copyright 2026 Adobe. All rights reserved.
 * Licensed under the Apache License, Version 2.0.
 */

/* eslint-env browser */
function sampleRUM(checkpoint, data) {
  const timeShift = () => (window.performance ? window.performance.now() : Date.now() - window.hlx.rum.firstReadTime);
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum || !window.hlx.rum.collector) {
      sampleRUM.enhance = () => {};
      const params = new URLSearchParams(window.location.search);
      const { currentScript } = document;
      const rate = params.get('rum') || window.SAMPLE_PAGEVIEWS_AT_RATE || params.get('optel') || (currentScript && currentScript.dataset.rate);
      const rateValue = { on: 1, off: 0, high: 10, low: 1000 }[rate];
      const weight = rateValue !== undefined ? rateValue : 100;
      const id = (window.hlx.rum && window.hlx.rum.id) || crypto.randomUUID().slice(-9);
      const isSelected = (window.hlx.rum && window.hlx.rum.isSelected) || (weight > 0 && Math.random() * weight < 1);
      window.hlx.rum = { weight, id, isSelected, firstReadTime: window.performance ? window.performance.timeOrigin : Date.now(), sampleRUM, queue: [], collector: (...args) => window.hlx.rum.queue.push(args) };
      if (isSelected) {
        sampleRUM.baseURL = sampleRUM.baseURL || new URL(window.RUM_BASE || '/', new URL('https://ot.aem.live'));
        sampleRUM.collectBaseURL = sampleRUM.collectBaseURL || sampleRUM.baseURL;
        sampleRUM.sendPing = (ck, time, pingData = {}) => {
          const rumData = JSON.stringify({ weight, id, referer: window.location.origin + window.location.pathname, checkpoint: ck, t: time, ...pingData });
          const url = new URL(`.rum/${weight}`, sampleRUM.collectBaseURL).href;
          navigator.sendBeacon(url, new Blob([rumData], { type: 'application/json' }));
        };
        sampleRUM.sendPing('top', timeShift());
        sampleRUM.enhance = () => {
          if (document.querySelector('script[src*="rum-enhancer"]')) return;
          const script = document.createElement('script');
          script.src = new URL(`.rum/@adobe/helix-rum-enhancer@^2/src/index.js`, sampleRUM.baseURL).href;
          document.head.appendChild(script);
        };
        if (!window.hlx.RUM_MANUAL_ENHANCE) sampleRUM.enhance();
      }
    }
    if (window.hlx.rum && window.hlx.rum.isSelected && checkpoint) window.hlx.rum.collector(checkpoint, data, timeShift());
  } catch (error) {}
}

function setup() {
  window.hlx = window.hlx || {};
  window.hlx.RUM_MASK_URL = 'full';
  window.hlx.RUM_MANUAL_ENHANCE = true;
  window.hlx.codeBasePath = '';
  window.hlx.lighthouse = new URLSearchParams(window.location.search).get('lighthouse') === 'on';
  const scriptEl = document.querySelector('script[src$="/scripts/scripts.js"]');
  if (scriptEl) {
    try {
      const scriptURL = new URL(scriptEl.src, window.location);
      if (scriptURL.host === window.location.host) [window.hlx.codeBasePath] = scriptURL.pathname.split('/scripts/scripts.js');
      else [window.hlx.codeBasePath] = scriptURL.href.split('/scripts/scripts.js');
    } catch (error) { console.log(error); }
  }
}

function init() { setup(); sampleRUM.collectBaseURL = window.origin; sampleRUM(); }

function toClassName(name) {
  return typeof name === 'string' ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : '';
}

function toCamelCase(name) { return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase()); }

function readBlockConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('a')) { const as = [...col.querySelectorAll('a')]; value = as.length === 1 ? as[0].href : as.map((a) => a.href); }
        else if (col.querySelector('img')) { const imgs = [...col.querySelectorAll('img')]; value = imgs.length === 1 ? imgs[0].src : imgs.map((img) => img.src); }
        else if (col.querySelector('p')) { const ps = [...col.querySelectorAll('p')]; value = ps.length === 1 ? ps[0].textContent : ps.map((p) => p.textContent); }
        else value = row.children[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

async function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href;
      link.onload = resolve; link.onerror = reject;
      document.head.append(link);
    } else resolve();
  });
}

async function loadScript(src, attrs) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      if (attrs) for (const attr in attrs) script.setAttribute(attr, attrs[attr]);
      script.onload = resolve; script.onerror = reject;
      document.head.append(script);
    } else resolve();
  });
}

function getMetadata(name, doc = document) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  return [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((m) => m.content).join(', ') || '';
}

function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]) {
  const url = !src.startsWith('http') ? new URL(src, window.location.href) : new URL(src);
  const picture = document.createElement('picture');
  const { origin, pathname } = url;
  const ext = pathname.split('.').pop();
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${origin}${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${origin}${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      img.setAttribute('src', `${origin}${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(img);
    }
  });
  return picture;
}

function decorateTemplateAndTheme() {
  const addClasses = (element, classes) => classes.split(',').forEach((c) => element.classList.add(toClassName(c.trim())));
  const template = getMetadata('template');
  if (template) addClasses(document.body, template);
  const theme = getMetadata('theme');
  if (theme) addClasses(document.body, theme);
}

function wrapTextNodes(block) {
  const validWrappers = ['P', 'PRE', 'UL', 'OL', 'PICTURE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR'];
  block.querySelectorAll(':scope > div > div').forEach((blockColumn) => {
    if (blockColumn.hasChildNodes()) {
      const hasWrapper = !!blockColumn.firstElementChild && validWrappers.some((tagName) => blockColumn.firstElementChild.tagName === tagName);
      if (!hasWrapper) {
        const wrapper = document.createElement('p');
        wrapper.append(...blockColumn.childNodes);
        blockColumn.append(wrapper);
      }
    }
  });
}

function decorateIcons(element, prefix = '') {
  element.querySelectorAll('span.icon').forEach((span) => {
    if (span.hasChildNodes()) return;
    const iconName = Array.from(span.classList).find((c) => c.startsWith('icon-')).substring(5);
    const img = document.createElement('img');
    img.src = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
    img.alt = ''; img.loading = 'lazy'; img.width = 16; img.height = 16;
    span.append(img);
  });
}

function decorateSections(main) {
  main.querySelectorAll(':scope > div:not([data-section-status])').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if ((e.tagName === 'DIV' && e.className) || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV' || !e.className;
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') meta.style.split(',').filter(Boolean).map((s) => toClassName(s.trim())).forEach((s) => section.classList.add(s));
        else section.dataset[toCamelCase(key)] = meta[key];
      });
      sectionMeta.parentNode.remove();
    }
  });
}

function buildBlock(blockName, content) {
  const table = Array.isArray(content) ? content : [[content]];
  const blockEl = document.createElement('div');
  blockEl.classList.add(blockName);
  table.forEach((row) => {
    const rowEl = document.createElement('div');
    row.forEach((col) => {
      const colEl = document.createElement('div');
      const vals = col.elems ? col.elems : [col];
      vals.forEach((val) => { if (val) { if (typeof val === 'string') colEl.innerHTML += val; else colEl.appendChild(val); } });
      rowEl.appendChild(colEl);
    });
    blockEl.appendChild(rowEl);
  });
  return blockEl;
}

async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const { blockName } = block.dataset;
    try {
      const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`);
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try { const mod = await import(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`); if (mod.default) await mod.default(block); }
          catch (error) { console.error(`failed to load module for ${blockName}`, error); }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (error) { console.error(`failed to load block ${blockName}`, error); }
    block.dataset.blockStatus = 'loaded';
  }
  return block;
}

function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName && !block.dataset.blockStatus) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
    wrapTextNodes(block);
    block.parentElement.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
  }
}

function decorateBlocks(main) { main.querySelectorAll('div.section > div > div').forEach(decorateBlock); }

async function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  decorateBlock(headerBlock);
  return loadBlock(headerBlock);
}

async function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  decorateBlock(footerBlock);
  return loadBlock(footerBlock);
}

async function waitForFirstImage(section) {
  const lcpCandidate = section.querySelector('img');
  await new Promise((resolve) => {
    if (lcpCandidate && !lcpCandidate.complete) {
      lcpCandidate.setAttribute('loading', 'eager');
      lcpCandidate.addEventListener('load', resolve);
      lcpCandidate.addEventListener('error', resolve);
    } else resolve();
  });
}

async function loadSection(section, loadCallback) {
  const status = section.dataset.sectionStatus;
  if (!status || status === 'initialized') {
    section.dataset.sectionStatus = 'loading';
    const blocks = [...section.querySelectorAll('div.block')];
    for (let i = 0; i < blocks.length; i += 1) await loadBlock(blocks[i]);
    if (loadCallback) await loadCallback(section);
    section.dataset.sectionStatus = 'loaded';
    section.style.display = null;
  }
}

async function loadSections(element) {
  const sections = [...element.querySelectorAll('div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    await loadSection(sections[i]);
    if (i === 0 && sampleRUM.enhance) sampleRUM.enhance();
  }
}

init();

export {
  buildBlock, createOptimizedPicture, decorateBlock, decorateBlocks, decorateIcons,
  decorateSections, decorateTemplateAndTheme, getMetadata, loadBlock, loadCSS,
  loadFooter, loadHeader, loadScript, loadSection, loadSections,
  readBlockConfig, sampleRUM, setup, toCamelCase, toClassName, waitForFirstImage, wrapTextNodes,
};
