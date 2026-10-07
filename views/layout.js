const { escapeHtml } = require('./html');

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function renderNavLinks(activeHref) {
  return NAV_ITEMS
    .map(({ href, label }) => {
      const isActive = href === activeHref;
      const activeAttrs = isActive ? ' aria-current="page" class="nav-link nav-link--active"' : ' class="nav-link"';
      return `        <a href="${href}"${activeAttrs}>${escapeHtml(label)}</a>`;
    })
    .join('\n');
}

function renderLayout({ title, description, activeHref, main, scripts = [] }) {
  const scriptTags = scripts.map((src) => `  <script src="${src}" defer></script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/animations.css">
  <link rel="stylesheet" href="/css/header.css">
  <link rel="stylesheet" href="/css/footer.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="navbar">
    <a class="navbar-brand" href="/">
      <span class="logo" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="6" fill="#F59E0B"/>
          <path d="M8 14l4 4 8-8" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      TodoApp
    </a>
    <nav class="navbar-menu" id="navbar-menu">
${renderNavLinks(activeHref)}
    </nav>
    <button type="button" class="hamburger" id="hamburger" aria-controls="navbar-menu" aria-expanded="false" aria-label="Open menu">&#9776;</button>
  </header>
  <main id="main">
${main}
  </main>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>About</h3>
        <p>TodoApp is a simple task manager for organizing your day by priority. Open source on GitHub.</p>
        <ul>
          <li><a href="https://github.com/ayalask/AISoftwareFactory">GitHub</a></li>
        </ul>
        <p>&copy; ${new Date().getFullYear()} TodoApp</p>
      </div>
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/features">Features</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Support</h3>
        <ul>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="https://github.com/ayalask/AISoftwareFactory/issues">Report Issue</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} TodoApp. All rights reserved.</p>
    </div>
  </footer>
  <script src="/js/navigation.js" defer></script>
${scriptTags}
</body>
</html>
`;
}

module.exports = { NAV_ITEMS, renderLayout };
