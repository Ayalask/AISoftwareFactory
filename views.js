const { PRIORITIES, DEFAULT_PRIORITY, priorityLabel } = require('./priority');
const { DUE_FILTERS, computeDueStatus, dueStatusLabel, compareByDueDate } = require('./dueDate');

const REPO_URL = 'https://github.com/Ayalask/AISoftwareFactory';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLogo() {
  return `<svg class="navbar-logo" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="var(--color-primary)"/>
        <path d="M8 14l4 4 8-9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`;
}

function renderNav(activePath) {
  return NAV_LINKS
    .map((link) => {
      const isActive = link.href === activePath;
      const classAttr = isActive ? ' class="nav-link is-active"' : ' class="nav-link"';
      const currentAttr = isActive ? ' aria-current="page"' : '';
      return `      <a href="${link.href}"${classAttr}${currentAttr}>${link.label}</a>`;
    })
    .join('\n');
}

function renderFooter() {
  return `  <footer class="footer">
    <div class="footer-columns">
      <div class="footer-column footer-about">
        <div class="footer-brand">${renderLogo()}<span>Todo Factory</span></div>
        <p>A small todo application built incrementally by an automated software factory, used here to demonstrate server-rendered UI, filtering, and a REST API.</p>
        <a class="footer-social" href="${REPO_URL}" aria-label="View source on GitHub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.9.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.17 0 1.57-.01 2.84-.01 3.23 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/></svg>
        </a>
        <p class="footer-copyright">&copy; ${new Date().getFullYear()} Todo Factory. All rights reserved.</p>
      </div>
      <div class="footer-column">
        <h3>Quick Links</h3>
        <a href="/">Home</a>
        <a href="/features">Features</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/contact">Contact</a>
      </div>
      <div class="footer-column">
        <h3>Resources</h3>
        <a href="${REPO_URL}#readme">Documentation</a>
        <a href="/features#api">API Reference</a>
        <a href="${REPO_URL}/commits/main">Changelog</a>
        <a href="${REPO_URL}/issues">Roadmap</a>
      </div>
      <div class="footer-column">
        <h3>Support</h3>
        <a href="/faq">Help Center</a>
        <a href="/contact">Contact Us</a>
        <a href="${REPO_URL}/issues/new">Report an Issue</a>
        <a href="/health">Service Status</a>
      </div>
      <div class="footer-column">
        <h3>Legal</h3>
        <a href="/legal#privacy">Privacy Policy</a>
        <a href="/legal#terms">Terms of Service</a>
        <a href="/legal#cookies">Cookie Policy</a>
        <a href="/legal#disclaimer">Disclaimer</a>
      </div>
    </div>
  </footer>`;
}

function renderLayout({ title, description, activePath, bodyClass, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="${bodyClass}">
  <header class="navbar">
    <div class="navbar-inner">
      <a class="navbar-brand" href="/" aria-label="Todo Factory home">
        ${renderLogo()}
        <span>Todo Factory</span>
      </a>
      <nav class="navbar-menu" id="navbar-menu">
${renderNav(activePath)}
      </nav>
      <button type="button" class="hamburger" id="hamburger" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <main>
${body}
  </main>
${renderFooter()}
  <script src="/js/app.js" defer></script>
</body>
</html>
`;
}

function buildFilterQuery({ priority, due, sort }) {
  const params = [];
  if (priority) {
    params.push(`priority=${priority}`);
  }
  if (due) {
    params.push(`due=${due}`);
  }
  if (sort) {
    params.push(`sort=${sort}`);
  }
  return params.length ? `?${params.join('&')}` : '';
}

function renderTodoSection({ todos, basePath, filter, dueFilter, sort, showDashboardLink }) {
  let visible = filter ? todos.filter((todo) => todo.priority === filter) : todos;
  if (dueFilter) {
    visible = visible.filter((todo) => computeDueStatus(todo.dueDate) === dueFilter);
  }
  if (sort === 'dueDate' || sort === '-dueDate') {
    visible = [...visible].sort((a, b) => compareByDueDate(a, b, sort === '-dueDate' ? 'desc' : 'asc'));
  }

  const items = visible
    .map((todo) => {
      const status = computeDueStatus(todo.dueDate);
      const badge = status === 'overdue' || status === 'today' || status === 'this-week'
        ? `<span class="due-badge due-${status}">${dueStatusLabel(status)}</span>`
        : '';
      return `      <li class="todo-item" data-id="${todo.id}" data-priority="${todo.priority}" data-due-status="${status}">
        <span class="title">${escapeHtml(todo.title)}</span>
        <span class="priority priority-${todo.priority}">${priorityLabel(todo.priority)}</span>
        <select class="priority-select">
${PRIORITIES.map((p) => `          <option value="${p}"${p === todo.priority ? ' selected' : ''}>${priorityLabel(p)}</option>`).join('\n')}
        </select>
        ${badge}
        <input type="date" class="due-date-input" value="${todo.dueDate || ''}">
      </li>`;
    })
    .join('\n');
  const newPriorityOptions = PRIORITIES
    .map((p) => `        <option value="${p}"${p === DEFAULT_PRIORITY ? ' selected' : ''}>${priorityLabel(p)}</option>`)
    .join('\n');
  const priorityFilterLinks = [
    `      <a href="${basePath}${buildFilterQuery({ due: dueFilter, sort })}"${!filter ? ' aria-current="page"' : ''}>All</a>`,
    ...PRIORITIES.map((p) => `      <a href="${basePath}${buildFilterQuery({ priority: p, due: dueFilter, sort })}"${filter === p ? ' aria-current="page"' : ''}>${priorityLabel(p)}</a>`),
  ].join('\n');
  const dueFilterLinks = [
    `      <a href="${basePath}${buildFilterQuery({ priority: filter, sort })}"${!dueFilter ? ' aria-current="page"' : ''}>All</a>`,
    ...DUE_FILTERS.map((d) => `      <a href="${basePath}${buildFilterQuery({ priority: filter, due: d, sort })}"${dueFilter === d ? ' aria-current="page"' : ''}>${dueStatusLabel(d)}</a>`),
  ].join('\n');
  const sortLinks = [
    `      <a href="${basePath}${buildFilterQuery({ priority: filter, due: dueFilter })}"${!sort ? ' aria-current="page"' : ''}>Unsorted</a>`,
    `      <a href="${basePath}${buildFilterQuery({ priority: filter, due: dueFilter, sort: 'dueDate' })}"${sort === 'dueDate' ? ' aria-current="page"' : ''}>Due date &uarr;</a>`,
    `      <a href="${basePath}${buildFilterQuery({ priority: filter, due: dueFilter, sort: '-dueDate' })}"${sort === '-dueDate' ? ' aria-current="page"' : ''}>Due date &darr;</a>`,
  ].join('\n');
  const dashboardLink = showDashboardLink
    ? '    <a class="todo-section-link" href="/dashboard">Open the dashboard &rarr;</a>\n'
    : '';

  return `  <section class="todo-section" id="todos">
    <h2>Your Todos</h2>
${dashboardLink}    <form id="todo-form" class="todo-form">
      <input type="text" id="title" name="title" placeholder="What needs doing?" required>
      <select id="new-priority" name="priority">
${newPriorityOptions}
      </select>
      <input type="date" id="new-due-date" name="dueDate">
      <button type="submit">Add Todo</button>
    </form>
    <nav id="priority-filter" class="priority-filter">
${priorityFilterLinks}
    </nav>
    <nav id="due-filter" class="due-filter">
${dueFilterLinks}
    </nav>
    <nav id="due-sort" class="due-sort">
${sortLinks}
    </nav>
    <ul id="todo-list" class="todo-list">
${items}
    </ul>
  </section>
`;
}

const HERO_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
    headline: 'Organize your work, your way',
    subheading: 'A fast, dependency-light todo app with priority levels and live filtering.',
  },
  {
    gradient: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
    headline: 'Three priority levels, zero friction',
    subheading: 'Mark tasks low, medium, or high priority and filter your list in one click.',
  },
  {
    gradient: 'linear-gradient(135deg, #10B981, #2563EB)',
    headline: 'A dashboard that tells you what matters',
    subheading: 'See your todo counts broken down by priority at a glance.',
  },
  {
    gradient: 'linear-gradient(135deg, #0F172A, #2563EB)',
    headline: 'Built by an automated software factory',
    subheading: 'Every feature here shipped from a GitHub issue, end to end.',
  },
  {
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    headline: 'A simple REST API underneath',
    subheading: 'Create and update todos over HTTP — no account required.',
  },
];

function renderHeroIllustration() {
  return `<svg class="hero-illustration" width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true">
          <circle cx="110" cy="110" r="90" fill="rgba(255,255,255,0.12)"/>
          <circle cx="110" cy="110" r="60" fill="rgba(255,255,255,0.18)"/>
          <rect x="70" y="95" width="80" height="14" rx="7" fill="rgba(255,255,255,0.85)"/>
          <rect x="70" y="120" width="56" height="14" rx="7" fill="rgba(255,255,255,0.6)"/>
        </svg>`;
}

function renderHeroCarousel() {
  const slides = HERO_SLIDES
    .map((slide, index) => {
      const activeClass = index === 0 ? 'hero-slide is-active' : 'hero-slide';
      return `      <div class="${activeClass}" style="background: ${slide.gradient}" data-slide-index="${index}">
        <div class="hero-content">
          <h1>${escapeHtml(slide.headline)}</h1>
          <p>${escapeHtml(slide.subheading)}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="/dashboard">Get Started</a>
            <a class="btn btn-secondary" href="#features-carousel">Learn More</a>
          </div>
        </div>
        ${renderHeroIllustration()}
      </div>`;
    })
    .join('\n');
  const dots = HERO_SLIDES
    .map((_, index) => `      <button type="button" class="hero-dot${index === 0 ? ' is-active' : ''}" data-dot-index="${index}" aria-label="Show slide ${index + 1}"></button>`)
    .join('\n');

  return `  <section class="hero" id="hero">
    <div class="hero-track">
${slides}
    </div>
    <div class="hero-dots" id="hero-dots">
${dots}
    </div>
  </section>`;
}

const FEATURE_CARDS = [
  {
    slug: 'priority-levels',
    title: 'Priority Levels',
    description: 'Tag every todo low, medium, or high priority, case-insensitively, with medium as the default.',
    icon: '<path d="M4 18h4v-6H4v6zm6 0h4V6h-4v12zm6 0h4v-9h-4v9z" fill="currentColor"/>',
  },
  {
    slug: 'filtering',
    title: 'Smart Filtering',
    description: 'Jump straight to the todos that matter with one-click priority filters on every list view.',
    icon: '<path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>',
  },
  {
    slug: 'dashboard',
    title: 'Live Dashboard',
    description: 'See total, high, medium, and low counts at a glance on a dedicated dashboard view.',
    icon: '<path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 7h7v9h-7v-9zM4 14h7v6H4v-6z" fill="currentColor"/>',
  },
  {
    slug: 'api',
    title: 'Simple REST API',
    description: 'Create and update todos over plain HTTP JSON — POST /api/todos, PATCH /api/todos/:id.',
    icon: '<path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
  {
    slug: 'lightweight',
    title: 'Lightweight & Fast',
    description: 'No images, no webfonts, no front-end framework. Every visual here is a gradient or inline SVG.',
    icon: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor"/>',
  },
  {
    slug: 'open-source',
    title: 'Open Source',
    description: 'The full history of this app, including every feature shown here, is public on GitHub.',
    icon: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" stroke="currentColor" stroke-width="2" fill="none"/>',
  },
];

function renderFeatureCarousel() {
  const cards = FEATURE_CARDS
    .map((card) => `        <article class="feature-card" data-feature-slug="${card.slug}">
          <svg class="feature-icon" width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">${card.icon}</svg>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.description)}</p>
          <a class="feature-link" href="/features#${card.slug}">Learn more &rarr;</a>
        </article>`)
    .join('\n');
  const dots = FEATURE_CARDS
    .map((_, index) => `      <button type="button" class="feature-dot${index === 0 ? ' is-active' : ''}" data-dot-index="${index}" aria-label="Show feature page ${index + 1}"></button>`)
    .join('\n');

  return `  <section class="feature-carousel" id="features-carousel">
    <h2>Why people use Todo Factory</h2>
    <div class="carousel-controls">
      <button type="button" class="carousel-prev" id="feature-prev" aria-label="Previous features">&larr;</button>
      <div class="feature-track" id="feature-track">
${cards}
      </div>
      <button type="button" class="carousel-next" id="feature-next" aria-label="Next features">&rarr;</button>
    </div>
    <div class="feature-dots" id="feature-dots">
${dots}
    </div>
  </section>`;
}

function renderHome({ todos, filter, dueFilter, sort }) {
  const body = `${renderHeroCarousel()}
${renderFeatureCarousel()}
${renderTodoSection({ todos, basePath: '/', filter, dueFilter, sort, showDashboardLink: true })}`;
  return renderLayout({
    title: 'Todo Factory — Organize your work',
    description: 'A fast, dependency-light todo app with priority levels, filtering, and a REST API.',
    activePath: '/',
    bodyClass: 'page-home',
    body,
  });
}

function renderDashboard({ todos, filter, dueFilter, sort }) {
  const total = todos.length;
  const high = todos.filter((t) => t.priority === 'high').length;
  const medium = todos.filter((t) => t.priority === 'medium').length;
  const low = todos.filter((t) => t.priority === 'low').length;
  const overdue = todos.filter((t) => computeDueStatus(t.dueDate) === 'overdue').length;
  const dueToday = todos.filter((t) => computeDueStatus(t.dueDate) === 'today').length;
  const dueThisWeek = todos.filter((t) => computeDueStatus(t.dueDate) === 'this-week').length;
  const noDueDate = todos.filter((t) => computeDueStatus(t.dueDate) === 'no-date').length;
  const body = `  <section class="dashboard-banner">
    <h1>Dashboard</h1>
    <p>A live snapshot of everything on your list.</p>
  </section>
  <section class="stats-grid">
    <div class="stat-card">
      <span class="stat-label">Total todos</span>
      <span class="stat-value" data-stat="total">${total}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">High priority</span>
      <span class="stat-value" data-stat="high">${high}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Medium priority</span>
      <span class="stat-value" data-stat="medium">${medium}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Low priority</span>
      <span class="stat-value" data-stat="low">${low}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Overdue</span>
      <span class="stat-value" data-stat="overdue">${overdue}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Due today</span>
      <span class="stat-value" data-stat="due-today">${dueToday}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Due this week</span>
      <span class="stat-value" data-stat="due-this-week">${dueThisWeek}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">No due date</span>
      <span class="stat-value" data-stat="no-due-date">${noDueDate}</span>
    </div>
  </section>
${renderTodoSection({ todos, basePath: '/dashboard', filter, dueFilter, sort, showDashboardLink: false })}`;
  return renderLayout({
    title: 'Todo Factory — Dashboard',
    description: 'A live snapshot of your todos by priority and due date.',
    activePath: '/dashboard',
    bodyClass: 'page-dashboard',
    body,
  });
}

function renderAbout() {
  const body = `  <section class="page-header">
    <h1>About Todo Factory</h1>
    <p>What this app is, and how it got here.</p>
  </section>
  <section class="content-section">
    <h2>Our mission</h2>
    <p>Todo Factory is a demo application: a small, in-memory todo list built incrementally to show off server-rendered UI, priority-based filtering, and a REST API — all built by an automated software factory working from GitHub issues.</p>
    <h2>Why it's built this way</h2>
    <p>No database, no accounts, no third-party services. That keeps the app easy to read end-to-end and easy to verify: every feature on this site traces back to a real commit and a real test.</p>
    <h2>Milestones</h2>
    <ul class="timeline">
      <li><strong>Initial skeleton</strong> — a bare Express server with a health check.</li>
      <li><strong>Configuration fixes</strong> — corrected package.json and server startup.</li>
      <li><strong>Todo creation via web form</strong> — added POST /api/todos and an in-browser form.</li>
      <li><strong>Priority levels</strong> — added low/medium/high priority, filtering, and the PATCH endpoint.</li>
      <li><strong>This redesign</strong> — added navigation, a dashboard, and this set of content pages.</li>
    </ul>
  </section>`;
  return renderLayout({
    title: 'Todo Factory — About',
    description: 'What Todo Factory is and how it was built.',
    activePath: '/about',
    bodyClass: 'page-about',
    body,
  });
}

const FAQ_CATEGORIES = [
  {
    name: 'Getting Started',
    items: [
      ['How do I add a todo?', 'Use the form on the Home or Dashboard page, or send a POST request to /api/todos with a title.'],
      ['What priority levels are available?', 'low, medium, and high. If you don’t specify one, new todos default to medium.'],
      ['Is priority case-sensitive?', 'No. "High", "high", and "HIGH" are all accepted and stored as "high".'],
      ['Can I filter todos by priority?', 'Yes — use the filter links above the list, or request GET /?priority=<level> directly.'],
      ['Do I need an account to use this?', 'No. There are no accounts, logins, or passwords — this is a single shared demo list.'],
    ],
  },
  {
    name: 'Features',
    items: [
      ['Can I change a todo’s priority later?', 'Yes — use the priority dropdown next to a todo, or call PATCH /api/todos/:id.'],
      ['Is there a dashboard?', 'Yes, at /dashboard — it shows total, high, medium, and low counts alongside your todo list.'],
      ['Can I mark a todo as completed?', 'Not yet. The current data model only tracks title, priority, due date, and creation time.'],
      ['How many todos can I store?', 'Up to 100. Creating a 101st todo returns an error.'],
      ['Is there a limit on title length?', 'Yes — titles must be shorter than 200 characters.'],
    ],
  },
  {
    name: 'API & Limits',
    items: [
      ['What endpoints does the API expose?', 'GET /health, GET /build-id, GET /, POST /api/todos, PATCH /api/todos/:id, and POST /api/contact.'],
      ['What happens if I exceed the 100-todo limit?', 'POST /api/todos responds 400 with an error message instead of creating the todo.'],
      ['What does GET /health return?', 'A JSON body of {"status":"ok"} — used by our own uptime checks.'],
      ['What is GET /build-id for?', 'It returns the git commit hash the running server was built from.'],
      ['Is the API rate-limited or authenticated?', 'No — it’s an open demo API with no auth and no rate limiting.'],
    ],
  },
  {
    name: 'Support',
    items: [
      ['Where is my todo data stored?', 'In memory, on the server process. Restarting the server clears every todo.'],
      ['I found a bug. What do I do?', 'Please open an issue on GitHub — see the "Report an Issue" link in the footer.'],
      ['How do I contact the team?', 'Use the form on the Contact page, or open a GitHub issue.'],
      ['Does the contact form send an email?', 'No — messages are logged on the server, not emailed. See the Contact page for details.'],
      ['Is my data private?', 'There are no accounts and no cookies. See the Legal page for the full, honest answer.'],
    ],
  },
];

function renderFaq() {
  const categories = FAQ_CATEGORIES
    .map((category) => {
      const items = category.items
        .map(([question, answer]) => `      <details class="faq-item">
        <summary>${escapeHtml(question)}</summary>
        <p>${escapeHtml(answer)}</p>
      </details>`)
        .join('\n');
      return `    <section class="faq-category" data-faq-category="${escapeHtml(category.name)}">
      <h2>${escapeHtml(category.name)}</h2>
${items}
    </section>`;
    })
    .join('\n');

  const body = `  <section class="page-header">
    <h1>Frequently Asked Questions</h1>
    <input type="search" id="faq-search" placeholder="Search questions&hellip;" aria-label="Search FAQ">
  </section>
  <section class="faq-list">
${categories}
  </section>`;
  return renderLayout({
    title: 'Todo Factory — FAQ',
    description: 'Answers to common questions about Todo Factory.',
    activePath: '/faq',
    bodyClass: 'page-faq',
    body,
  });
}

function renderFeatures() {
  const cards = FEATURE_CARDS
    .map((card) => `    <article class="feature-detail-card" id="${card.slug}">
      <svg class="feature-icon" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">${card.icon}</svg>
      <h2>${escapeHtml(card.title)}</h2>
      <p>${escapeHtml(card.description)}</p>
    </article>`)
    .join('\n');

  const body = `  <section class="page-header">
    <h1>Features</h1>
    <p>Everything Todo Factory does today, nothing it doesn’t.</p>
  </section>
  <section class="feature-grid">
${cards}
  </section>`;
  return renderLayout({
    title: 'Todo Factory — Features',
    description: 'A full list of what Todo Factory can do.',
    activePath: '/features',
    bodyClass: 'page-features',
    body,
  });
}

function renderContact() {
  const body = `  <section class="page-header">
    <h1>Contact Us</h1>
    <p>Questions, bug reports, or feedback — we’d like to hear it.</p>
  </section>
  <section class="content-section">
    <form id="contact-form" class="contact-form">
      <label for="contact-name">Name</label>
      <input type="text" id="contact-name" name="name" required>
      <label for="contact-email">Email</label>
      <input type="email" id="contact-email" name="email" required>
      <label for="contact-subject">Subject</label>
      <input type="text" id="contact-subject" name="subject" required>
      <label for="contact-message">Message</label>
      <textarea id="contact-message" name="message" rows="5" required></textarea>
      <button type="submit">Send Message</button>
      <p id="contact-status" role="status"></p>
    </form>
    <p class="contact-note">This is a demo: submitted messages are logged on the server and are not emailed anywhere. For a guaranteed response, please <a href="${REPO_URL}/issues/new">open a GitHub issue</a> instead.</p>
  </section>`;
  return renderLayout({
    title: 'Todo Factory — Contact',
    description: 'Get in touch about Todo Factory.',
    activePath: '/contact',
    bodyClass: 'page-contact',
    body,
  });
}

function renderLegal() {
  const body = `  <section class="page-header">
    <h1>Legal</h1>
  </section>
  <section class="content-section">
    <h2 id="privacy">Privacy Policy</h2>
    <p>Todo Factory does not collect personal data, does not require an account, and stores todos only in server memory for the lifetime of the process. Contact form submissions are logged on the server and never emailed or shared.</p>
    <h2 id="terms">Terms of Service</h2>
    <p>This is a demonstration application provided as-is, with no uptime guarantee. Todos are not persisted and may be cleared at any time, including on server restart.</p>
    <h2 id="cookies">Cookie Policy</h2>
    <p>Todo Factory sets no cookies. The server sends no Set-Cookie header and uses no client-side storage.</p>
    <h2 id="disclaimer">Disclaimer</h2>
    <p>Todo Factory is provided without warranty of any kind. It is a demo built to show how an automated software factory ships incremental features, not a production task-management product.</p>
  </section>`;
  return renderLayout({
    title: 'Todo Factory — Legal',
    description: 'Privacy policy, terms of service, cookie policy, and disclaimer for Todo Factory.',
    activePath: '/legal',
    bodyClass: 'page-legal',
    body,
  });
}

module.exports = {
  escapeHtml,
  renderLayout,
  renderTodoSection,
  renderHome,
  renderDashboard,
  renderAbout,
  renderFaq,
  renderFeatures,
  renderContact,
  renderLegal,
};
