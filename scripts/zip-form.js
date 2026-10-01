import { loadCSS } from './aem.js';

const ICONS = {
  yes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h11v10H3zM14 9h4l3 3v3h-7zM6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>',
  no: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/></svg>',
};

let formCount = 0;

/**
 * Builds the ZIP lookup card (floating-label ZIP input, moving Yes/No tiles, submit).
 * Submitting a valid ZIP navigates to /plans?zip=XXXXX[&moving=yes|no].
 * @param {object} [options]
 * @param {string} [options.zipLabel] label for the ZIP input
 * @param {string} [options.movingLabel] question above the Yes/No tiles
 * @param {string} [options.submitLabel] button text
 * @returns {Promise<HTMLFormElement>}
 */
export default async function buildZipForm({
  zipLabel = 'Enter your ZIP code',
  movingLabel = 'Moving to a new address?',
  submitLabel = 'View plans',
} = {}) {
  await loadCSS(`${window.hlx.codeBasePath}/styles/zip-form.css`);
  formCount += 1;
  const id = `zip-input-${formCount}`;

  const form = document.createElement('form');
  form.className = 'zip-card';
  form.noValidate = true;
  form.action = '/plans';
  form.innerHTML = `<div class="zip-field">
      <input id="${id}" name="zip" type="text" inputmode="numeric" autocomplete="postal-code"
        maxlength="5" pattern="[0-9]{5}" placeholder=" " aria-describedby="${id}-error">
      <label for="${id}"></label>
    </div>
    <p class="zip-error" id="${id}-error" role="alert" hidden>Invalid ZIP code. Please try again.</p>
    <fieldset class="zip-moving">
      <legend></legend>
      <div class="zip-moving-options">
        <button type="button" class="zip-moving-option" data-moving="yes" aria-pressed="false">${ICONS.yes}<span>Yes</span></button>
        <button type="button" class="zip-moving-option" data-moving="no" aria-pressed="false">${ICONS.no}<span>No</span></button>
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
      label.textContent = moving === 'yes' ? 'Enter your new ZIP code' : zipLabel;
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
    window.location.href = `/plans?${params}`;
  });

  return form;
}
