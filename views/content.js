const { renderLayout } = require('./layout');

function pageHero(title, subtitle) {
  return `  <section class="page-hero">
    <div class="container">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
  </section>`;
}

function renderAbout() {
  const main = `${pageHero('About TodoApp', 'A simple, focused tool for getting things done.')}
  <section class="container">
    <p>TodoApp helps you keep track of what needs doing by letting you create tasks and mark each one as low, medium, or high priority. Filter the list to focus on what matters most right now.</p>
    <p>The project is open source and under active development. Today's dashboard covers creating tasks, setting priority, and filtering &mdash; more capability is on the way.</p>
    <p><a class="btn btn-primary" href="/dashboard">Go to Dashboard</a></p>
  </section>`;

  return renderLayout({
    title: 'About - TodoApp',
    description: 'Learn what TodoApp does today.',
    activeHref: '/about',
    main,
  });
}

function renderFaq() {
  const items = [
    ['How do priorities work?', 'Every task is low, medium, or high priority. New tasks default to medium unless you choose otherwise.'],
    ['Is priority case-sensitive?', 'No. "High", "HIGH", and "high" are all accepted and stored as "high".'],
    ['How long can a task title be?', 'Titles must be shorter than 200 characters, and cannot be empty or only whitespace.'],
    ['Is there a limit on how many tasks I can create?', 'Yes, up to 100 tasks at a time.'],
    ['Does my data persist if the server restarts?', 'No. Tasks are stored in memory only, so a server restart clears the list.'],
  ];
  const list = items
    .map(([q, a]) => `      <dt>${q}</dt>\n      <dd>${a}</dd>`)
    .join('\n');
  const main = `${pageHero('Frequently Asked Questions', 'Answers about how TodoApp works today.')}
  <section class="container">
    <dl>
${list}
    </dl>
  </section>`;

  return renderLayout({
    title: 'FAQ - TodoApp',
    description: 'Frequently asked questions about TodoApp.',
    activeHref: '/faq',
    main,
  });
}

function renderFeatures() {
  const main = `${pageHero('Features', 'What TodoApp can do today.')}
  <section class="container">
    <ul>
      <li><strong>Create tasks</strong> &mdash; add a new task with a short title.</li>
      <li><strong>Set a priority</strong> &mdash; mark each task low, medium, or high.</li>
      <li><strong>Filter by priority</strong> &mdash; view only the tasks at a given priority level.</li>
    </ul>
    <p><a class="btn btn-primary" href="/dashboard">Try it now</a></p>
  </section>`;

  return renderLayout({
    title: 'Features - TodoApp',
    description: 'See the features TodoApp offers today.',
    activeHref: '/features',
    main,
  });
}

function renderContact() {
  const main = `${pageHero('Contact', 'Get in touch about TodoApp.')}
  <section class="container">
    <p>TodoApp is open source. The best way to reach the project is to open an issue on GitHub:</p>
    <p><a class="btn btn-primary" href="https://github.com/ayalask/AISoftwareFactory/issues">Open an issue on GitHub</a></p>
    <p>We aim to respond to new issues within a few business days.</p>
  </section>`;

  return renderLayout({
    title: 'Contact - TodoApp',
    description: 'How to get in touch about TodoApp.',
    activeHref: '/contact',
    main,
  });
}

module.exports = { renderAbout, renderFaq, renderFeatures, renderContact };
