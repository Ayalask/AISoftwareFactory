const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server.js');

let server;
let baseUrl;

const PAGES = ['/', '/dashboard', '/about', '/faq', '/features', '/contact', '/legal'];

before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

after(() => {
  server.close();
});

test('every page renders the shared header and footer', async () => {
  for (const page of PAGES) {
    const res = await fetch(`${baseUrl}${page}`);
    assert.equal(res.status, 200, `${page} should return 200`);
    const html = await res.text();
    assert.match(html, /<header class="navbar"/);
    assert.match(html, /id="navbar-menu"/);
    assert.match(html, /class="hamburger"/);
    assert.match(html, /<footer class="footer"/);
    assert.match(html, /\/css\/styles\.css/);
    assert.match(html, /\/js\/app\.js/);
  }
});

test('nav marks the active page with aria-current', async () => {
  const about = await (await fetch(`${baseUrl}/about`)).text();
  assert.match(about, /href="\/about" class="nav-link is-active" aria-current="page"/);

  const features = await (await fetch(`${baseUrl}/features`)).text();
  assert.match(features, /href="\/features" class="nav-link is-active" aria-current="page"/);
  assert.doesNotMatch(features, /href="\/about" class="nav-link is-active"/);
});

test('static assets are served with the right content type', async () => {
  const css = await fetch(`${baseUrl}/css/styles.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /text\/css/);

  const js = await fetch(`${baseUrl}/js/app.js`);
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type'), /javascript/);
});

test('the stylesheet declares the design tokens', async () => {
  const css = await (await fetch(`${baseUrl}/css/styles.css`)).text();
  assert.match(css, /--color-primary: #2563EB/);
  assert.match(css, /--color-secondary: #8B5CF6/);
  assert.match(css, /--color-accent: #F59E0B/);
  assert.match(css, /--color-success: #10B981/);
  assert.match(css, /--color-warning: #EF4444/);
});

test('the home page renders a five-slide hero carousel', async () => {
  const html = await (await fetch(`${baseUrl}/`)).text();
  const slideCount = (html.match(/hero-slide/g) || []).length;
  const activeCount = (html.match(/hero-slide is-active/g) || []).length;
  assert.equal(slideCount, 5);
  assert.equal(activeCount, 1);
  assert.match(html, /id="hero-dots"/);
});

test('the home page renders a six-card feature carousel', async () => {
  const html = await (await fetch(`${baseUrl}/`)).text();
  const cardCount = (html.match(/feature-card/g) || []).length;
  assert.ok(cardCount >= 6, `expected at least 6 feature-card occurrences, got ${cardCount}`);
  assert.match(html, /id="feature-dots"/);
  assert.match(html, /id="feature-prev"/);
  assert.match(html, /id="feature-next"/);
});

test('the FAQ page has 20 entries across 4 categories plus a search box', async () => {
  const html = await (await fetch(`${baseUrl}/faq`)).text();
  const detailsCount = (html.match(/<details/g) || []).length;
  const categoryCount = (html.match(/data-faq-category/g) || []).length;
  assert.equal(detailsCount, 20);
  assert.equal(categoryCount, 4);
  assert.match(html, /id="faq-search"/);
});

test('every internal link across all pages resolves and nothing links to "#"', async () => {
  const hrefs = new Set();
  for (const page of PAGES) {
    const html = await (await fetch(`${baseUrl}${page}`)).text();
    assert.doesNotMatch(html, /href="#"/, `${page} must not contain a dead href="#" link`);
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      hrefs.add(match[1].split('#')[0]);
    }
  }
  for (const href of hrefs) {
    const res = await fetch(`${baseUrl}${href}`);
    assert.equal(res.status, 200, `${href} should resolve to 200`);
  }
});

test('dashboard stats reflect the current todos by priority', async () => {
  await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Dashboard high task', priority: 'high' }),
  });
  await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Dashboard medium task', priority: 'medium' }),
  });
  await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Dashboard low task', priority: 'low' }),
  });

  const html = await (await fetch(`${baseUrl}/dashboard`)).text();
  assert.match(html, /data-stat="total">3</);
  assert.match(html, /data-stat="high">1</);
  assert.match(html, /data-stat="medium">1</);
  assert.match(html, /data-stat="low">1</);
});

test('dashboard honors priority filtering and rejects unknown values', async () => {
  const high = await (await fetch(`${baseUrl}/dashboard?priority=high`)).text();
  assert.match(high, /Dashboard high task/);
  assert.doesNotMatch(high, /Dashboard medium task/);
  assert.doesNotMatch(high, /Dashboard low task/);

  const bad = await fetch(`${baseUrl}/dashboard?priority=urgent`);
  assert.equal(bad.status, 400);
});

test('POST /api/contact validates and accepts a complete submission', async () => {
  const valid = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello there' }),
  });
  assert.equal(valid.status, 201);
  assert.deepEqual(await valid.json(), { status: 'received' });

  const missingMessage = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane', email: 'jane@example.com', subject: 'Hi' }),
  });
  assert.equal(missingMessage.status, 400);

  const badEmail = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane', email: 'janeexample.com', subject: 'Hi', message: 'Hello there' }),
  });
  assert.equal(badEmail.status, 400);

  const tooLong = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'x'.repeat(2001) }),
  });
  assert.equal(tooLong.status, 400);
});
