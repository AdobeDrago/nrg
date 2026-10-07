/**
 * Details FAQ: a titled list of questions with their full answers and a "Back to top"
 * button, matching the original's details-faq section.
 * Authoring (DA table):
 *   | Details FAQ |                                        |
 *   | Most frequently asked |                              <- optional: section title
 *   | What is a fixed-rate energy plan? | answer copy     <- one row per question
 *   | Back to top |                                        <- optional: button label
 * Title and label rows only fill the first cell (the second is left empty or merged):
 * one before the questions is the title, one after them is the button label.
 */
export default function decorate(block) {
  const rows = [...block.children];
  // DA keeps an empty second cell on unmerged rows, so a question needs an actual answer
  const hasContent = (cell) => !!cell && !!(cell.textContent.trim() || cell.querySelector('img, picture'));
  const isQuestion = (row) => hasContent(row.children[1]);
  const firstQuestion = rows.findIndex(isQuestion);
  const titleRow = firstQuestion > 0 ? rows[0] : null;
  const labelRow = rows.slice(firstQuestion + 1).find((row) => !isQuestion(row));

  const content = [];

  const titleText = titleRow?.textContent.trim();
  if (titleText) {
    const title = document.createElement('h2');
    title.className = 'details-faq-title';
    title.textContent = titleText;
    content.push(title);
  }

  const list = document.createElement('ul');
  list.className = 'details-faq-list';
  rows.filter(isQuestion).forEach((row) => {
    const [questionCell, answerCell] = row.children;
    const item = document.createElement('li');
    const question = document.createElement('h3');
    question.className = 'details-faq-question';
    question.textContent = questionCell.textContent.trim();

    const answer = document.createElement('div');
    answer.className = 'details-faq-answer';
    // keep inline links as links, not the auto-decorated buttons
    answerCell.querySelectorAll('.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
    answerCell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
    if (answerCell.querySelector('p, ul, ol')) {
      answer.append(...answerCell.childNodes);
    } else {
      const p = document.createElement('p');
      p.append(...answerCell.childNodes);
      answer.append(p);
    }

    item.append(question, answer);
    list.append(item);
  });
  content.push(list);

  const back = document.createElement('div');
  back.className = 'details-faq-back';
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = '<i class="ico-back-top" aria-hidden="true"></i><span></span>';
  button.querySelector('span').textContent = labelRow?.textContent.trim() || 'Back to top';
  button.addEventListener('click', () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  back.append(button);
  content.push(back);

  block.replaceChildren(...content);
}
