const { renderLayout } = require('./layout');

const SLIDE_COUNT = 5;

function renderHeroSlides() {
  return Array.from({ length: SLIDE_COUNT }, (_, i) => {
    const n = i + 1;
    const activeClass = i === 0 ? ' hero-slide--active' : '';
    return `      <div class="hero-slide hero-slide--${n}${activeClass}" data-slide-index="${i}"></div>`;
  }).join('\n');
}

function renderHeroDots() {
  return Array.from({ length: SLIDE_COUNT }, (_, i) => {
    const n = i + 1;
    const current = i === 0 ? ' aria-current="true"' : '';
    return `      <button type="button" class="carousel-dot" data-slide-target="${i}" aria-label="Show slide ${n} of ${SLIDE_COUNT}"${current}></button>`;
  }).join('\n');
}

function renderLanding() {
  const main = `  <section class="hero">
    <div class="carousel" data-interval="5000">
${renderHeroSlides()}
    </div>
    <div class="hero-content">
      <h1>Organize Your Life With Priority Todos</h1>
      <p>Create tasks, assign a priority, and focus on what matters most today.</p>
      <a class="btn btn-primary" href="/dashboard">Get Started</a>
      <a class="btn btn-secondary" href="#features-preview">Learn More</a>
    </div>
    <div class="carousel-dots" id="hero-dots">
${renderHeroDots()}
    </div>
  </section>
  <section id="features-preview" class="container">
    <h2>What you can do today</h2>
    <div class="features-grid">
      <div class="todo-card">
        <h3>Create todos</h3>
        <p>Add a new task in seconds with a short title.</p>
      </div>
      <div class="todo-card">
        <h3>Set a priority</h3>
        <p>Mark each task as low, medium, or high priority.</p>
      </div>
      <div class="todo-card">
        <h3>Filter by priority</h3>
        <p>Jump straight to the tasks that need attention first.</p>
      </div>
    </div>
    <p><a href="/features">See all features</a></p>
  </section>`;

  return renderLayout({
    title: 'TodoApp - Organize Your Life With Priority Todos',
    description: 'A simple todo app for creating, prioritizing, and filtering your tasks.',
    activeHref: '/',
    main,
    scripts: ['/js/carousel.js'],
  });
}

module.exports = { renderLanding, SLIDE_COUNT };
