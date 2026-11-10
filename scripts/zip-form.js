import { loadCSS } from './aem.js';
import { localePrefix } from './locale.js';

let formCount = 0;

// UI text by locale; the root site uses English. Authored labels passed in still win.
const LABELS = {
  en: {
    zipLabel: 'Enter your ZIP code',
    newZipLabel: 'Enter your new ZIP code',
    movingLabel: 'Moving to a new address?',
    yes: 'Yes',
    no: 'No',
    viewPlans: 'View plans',
    cardError: 'Invalid ZIP code. Please try again.',
    searchLabel: 'Enter your location',
    placeholder: 'Zip Code',
    search: 'Search plans',
    searchError: 'Invalid zip code. Try again.',
  },
  es: {
    zipLabel: 'Ingresa tu código postal',
    newZipLabel: 'Ingresa tu nuevo código postal',
    movingLabel: '¿Te mudas a una nueva dirección?',
    yes: 'Sí',
    no: 'No',
    viewPlans: 'Ver planes',
    cardError: 'Código postal no válido. Inténtalo de nuevo.',
    searchLabel: 'Ingresa tu ubicación',
    placeholder: 'Código postal',
    search: 'Buscar planes',
    searchError: 'Código postal no válido. Inténtalo de nuevo.',
  },
};

const labels = () => LABELS[localePrefix().slice(1)] || LABELS.en;

/**
 * Builds the ZIP lookup card (floating-label ZIP input, moving Yes/No tiles, submit).
 * Submitting a valid ZIP navigates to {locale}/plans?zip=XXXXX[&moving=yes|no].
 * @param {object} [options]
 * @param {string} [options.zipLabel] label for the ZIP input
 * @param {string} [options.movingLabel] question above the Yes/No tiles
 * @param {string} [options.submitLabel] button text
 * @returns {Promise<HTMLFormElement>}
 */
export default async function buildZipForm({
  zipLabel = labels().zipLabel,
  movingLabel = labels().movingLabel,
  submitLabel = labels().viewPlans,
} = {}) {
  await loadCSS(`${window.hlx.codeBasePath}/styles/zip-form.css`);
  formCount += 1;
  const id = `zip-input-${formCount}`;
  const t = labels();

  const form = document.createElement('form');
  form.className = 'zip-card';
  form.noValidate = true;
  form.action = `${localePrefix()}/plans`;
  form.innerHTML = `<div class="zip-field">
      <input id="${id}" name="zip" type="text" inputmode="numeric" autocomplete="postal-code"
        maxlength="5" pattern="[0-9]{5}" placeholder=" " aria-describedby="${id}-error">
      <label for="${id}"></label>
    </div>
    <p class="zip-error" id="${id}-error" role="alert" hidden>${t.cardError}</p>
    <fieldset class="zip-moving">
      <legend></legend>
      <div class="zip-moving-options">
        <button type="button" class="zip-moving-option" data-moving="yes" aria-pressed="false"><i class="ico-truck" aria-hidden="true"></i><span>${t.yes}</span></button>
        <button type="button" class="zip-moving-option" data-moving="no" aria-pressed="false"><i class="ico-house" aria-hidden="true"></i><span>${t.no}</span></button>
      </div>
    </fieldset>
    <button type="submit" class="zip-submit"></button>`;

  const input = form.querySelector('input');
  const label = form.querySelector('label');
  const error = form.querySelector('.zip-error');
  label.textContent = zipLabel;
  form.querySelector('legend').textContent = movingLabel;
  form.querySelector('.zip-submit').textContent = submitLabel;

  let moving = '';
  form.querySelectorAll('.zip-moving-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      moving = btn.dataset.moving;
      form.querySelectorAll('.zip-moving-option').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      label.textContent = moving === 'yes' ? t.newZipLabel : zipLabel;
    });
  });

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
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    const params = new URLSearchParams({ zip });
    if (moving) params.set('moving', moving);
    window.location.href = `${localePrefix()}/plans?${params}`;
  });

  return form;
}

/**
 * Builds the compact "Enter your location" pill search (ZIP input + round search button)
 * used by the providers pages. Submitting a valid ZIP navigates to {locale}/plans?zip=XXXXX.
 * @param {object} [options]
 * @param {string} [options.label] label above the pill
 * @param {string} [options.placeholder] input placeholder
 * @param {string} [options.submitLabel] when set, renders a full-width text button
 *   (e.g. "Fetch plans") below the input instead of the round icon button
 * @returns {Promise<HTMLFormElement>}
 */
export async function buildZipSearch({
  label = labels().searchLabel,
  placeholder = labels().placeholder,
  submitLabel = '',
} = {}) {
  await loadCSS(`${window.hlx.codeBasePath}/styles/zip-form.css`);
  formCount += 1;
  const id = `zip-search-${formCount}`;
  const t = labels();

  const form = document.createElement('form');
  form.className = 'zip-search';
  form.noValidate = true;
  form.action = `${localePrefix()}/plans`;
  // the error message and alert icon sit in the field, positioned against it (zip-form.css);
  // the stacked variant below moves the message out, above its button
  form.innerHTML = `<label for="${id}"></label>
    <div class="zip-search-field">
      <input id="${id}" name="zip" type="text" inputmode="numeric" autocomplete="postal-code"
        maxlength="5" pattern="[0-9]{5}" aria-describedby="${id}-error">
      <i class="zip-search-alert ico-exclamation" aria-hidden="true"></i>
      <button type="submit" aria-label="${t.search}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg></button>
      <p class="zip-error" id="${id}-error" role="alert" hidden>${t.searchError}</p>
    </div>`;

  const input = form.querySelector('input');
  const error = form.querySelector('.zip-error');
  form.querySelector('label').textContent = label;
  input.placeholder = placeholder;
  if (submitLabel) {
    form.classList.add('zip-search-stacked');
    const button = form.querySelector('button');
    button.removeAttribute('aria-label');
    button.prepend(document.createTextNode(submitLabel));
    form.append(error, button);
  }

  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 5);
    if (digits !== input.value) input.value = digits;
    if (digits.length === 5) {
      error.hidden = true;
      input.removeAttribute('aria-invalid');
    }
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

  return form;
}
