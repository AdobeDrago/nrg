export default function decorate(block) {
  block.classList.add('zip-hero-block');
  const input = block.querySelector('#zip-code-input');
  const submitBtn = block.querySelector('.zip-submit');
  const errorEl = block.querySelector('.zip-error');
  const movingYes = block.querySelector('#zip-moving-yes');
  const movingNo = block.querySelector('#zip-moving-no');

  if (submitBtn && input) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const zip = input.value.trim();
      if (/^\d{5}$/.test(zip)) {
        errorEl.style.display = 'none';
        window.location.href = `/plans?zip=${zip}`;
      } else {
        errorEl.style.display = 'block';
      }
    });
  }

  if (movingYes) {
    movingYes.addEventListener('click', (e) => {
      e.preventDefault();
      input.placeholder = 'Enter your new ZIP code';
    });
  }

  if (movingNo) {
    movingNo.addEventListener('click', (e) => {
      e.preventDefault();
      input.placeholder = 'Enter your ZIP code';
    });
  }
}
