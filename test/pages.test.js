const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

after(() => {
  server.close();
});

const PAGE_ROUTES = ['/', '/dashboard', '/about', '/faq', '/features', '/contact'];
const STATIC_ASSETS = [
  '/css/styles.css',
  '/css/animations.css',
  '/css/header.css',
  '/css/footer.css',
  '/js/navigation.js',
  '/js/carousel.js',
  '/js/todo.js',
];

test('static assets', async (t) => {
  for (const assetPath of STATIC_ASSETS) {
    await t.test(`GET ${assetPath} resolves`, async () => {
      const res = await fetch(`${baseUrl}${assetPath}`);
      assert.equal(res.status, 200);
    });
  }

  await t.test('GET /css/styles.css contains the design system', async () => {
    const res = await fetch(`${baseUrl}/css/styles.css`);
    assert.equal(res.headers.get('content-type').includes('text/css'), true);
    const body = await res.text();
    assert.match(body, /--color-primary/);
  });

  await t.test('GET /css/animations.css respects reduced motion', async () => {
    const res = await fetch(`${baseUrl}/css/animations.css`);
    const body = await res.text();
    assert.match(body, /prefers-reduced-motion/);
  });

  await t.test('GET /js/navigation.js wires up aria-expanded', async () => {
    const res = await fetch(`${baseUrl}/js/navigation.js`);
    const body = await res.text();
    assert.match(body, /aria-expanded/);
  });

  await t.test('GET /js/carousel.js respects reduced motion', async () => {
    const res = await fetch(`${baseUrl}/js/carousel.js`);
    const body = await res.text();
    assert.match(body, /prefers-reduced-motion/);
  });

  await t.test('GET /js/todo.js talks to the todo API', async () => {
    const res = await fetch(`${baseUrl}/js/todo.js`);
    const body = await res.text();
    assert.match(body, /\/api\/todos/);
  });
});

test('shared chrome appears on every page', async (t) => {
  for (const route of PAGE_ROUTES) {
    await t.test(`GET ${route} includes header and footer`, async () => {
      const res = await fetch(`${baseUrl}${route}`);
      assert.equal(res.status, 200);
      const html = await res.text();
      assert.match(html, /class="navbar"/);
      assert.match(html, /class="footer"/);
      assert.match(html, new RegExp(`href="${route.replace('/', '\\/')}"[^>]*aria-current="page"`));
    });
  }
});

test('nav and footer link integrity', async () => {
  const res = await fetch(`${baseUrl}/`);
  const html = await res.text();
  const hrefs = new Set();
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    hrefs.add(match[1]);
  }
  assert.ok(hrefs.size > 0);
  for (const href of hrefs) {
    const target = href.split('#')[0] || '/';
    const linkRes = await fetch(`${baseUrl}${target}`);
    assert.equal(linkRes.status, 200, `expected ${target} to resolve, got ${linkRes.status}`);
  }
});

test('landing page hero', async (t) => {
  await t.test('GET / renders the headline and dashboard CTA', async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    assert.match(html, /<h1>Organize Your Life With Priority Todos<\/h1>/);
    assert.match(html, /href="\/dashboard"/);
  });

  await t.test('GET / renders exactly 5 hero slides and 5 dots', async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    const slideMatches = html.match(/class="hero-slide/g) || [];
    const dotMatches = html.match(/data-slide-target=/g) || [];
    assert.equal(slideMatches.length, 5);
    assert.equal(dotMatches.length, 5);
  });

  await t.test('GET / has exactly one active hero slide', async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    const activeMatches = html.match(/hero-slide--active/g) || [];
    assert.equal(activeMatches.length, 1);
  });

  await t.test('GET / does not reference the todo API', async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    assert.doesNotMatch(html, /\/api\/todos/);
  });
});

test('dashboard retains its interactive hooks inside the new layout', async () => {
  const res = await fetch(`${baseUrl}/dashboard`);
  const html = await res.text();
  assert.match(html, /id="todo-form"/);
  assert.match(html, /id="todo-list"/);
  assert.match(html, /id="new-priority"/);
  assert.match(html, /src="\/js\/todo\.js"/);
});
