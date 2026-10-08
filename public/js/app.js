(function () {
  'use strict';

  function setUpHamburger() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('navbar-menu');
    if (!hamburger || !menu) {
      return;
    }
    hamburger.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setUpTodoForm() {
    const form = document.getElementById('todo-form');
    if (!form) {
      return;
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('title');
      const priority = document.getElementById('new-priority');
      const dueDate = document.getElementById('new-due-date');
      const payload = { title: input.value, priority: priority.value };
      if (dueDate && dueDate.value) {
        payload.dueDate = dueDate.value;
      }
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  function setUpPrioritySelect() {
    const list = document.getElementById('todo-list');
    if (!list) {
      return;
    }
    list.addEventListener('change', async (event) => {
      if (!event.target.classList.contains('priority-select')) {
        return;
      }
      const id = event.target.closest('li').dataset.id;
      const response = await fetch('/api/todos/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: event.target.value }),
      });
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  function setUpDueDateInput() {
    const list = document.getElementById('todo-list');
    if (!list) {
      return;
    }
    list.addEventListener('change', async (event) => {
      if (!event.target.classList.contains('due-date-input')) {
        return;
      }
      const id = event.target.closest('li').dataset.id;
      const response = await fetch('/api/todos/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: event.target.value || null }),
      });
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  function setUpHeroCarousel() {
    const track = document.querySelector('.hero-track');
    const dotsContainer = document.getElementById('hero-dots');
    if (!track) {
      return;
    }
    const slides = Array.from(track.querySelectorAll('.hero-slide'));
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.hero-dot')) : [];
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let paused = false;

    function show(next) {
      index = next;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });
    track.addEventListener('focusin', () => { paused = true; });
    track.addEventListener('focusout', () => { paused = false; });

    setInterval(() => {
      if (!paused) {
        show((index + 1) % slides.length);
      }
    }, 5000);
  }

  function setUpFeatureCarousel() {
    const track = document.getElementById('feature-track');
    const dotsContainer = document.getElementById('feature-dots');
    const prev = document.getElementById('feature-prev');
    const next = document.getElementById('feature-next');
    if (!track) {
      return;
    }
    const cards = Array.from(track.children);
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.feature-dot')) : [];
    let perPage = 3;
    let pageIndex = 0;
    let paused = false;

    function computePerPage() {
      if (window.matchMedia('(max-width: 768px)').matches) {
        return 1;
      }
      if (window.matchMedia('(max-width: 1024px)').matches) {
        return 2;
      }
      return 3;
    }

    function pageCount() {
      return Math.max(1, Math.ceil(cards.length / perPage));
    }

    function render() {
      pageIndex = Math.min(pageIndex, pageCount() - 1);
      track.style.transform = `translateX(-${pageIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === pageIndex));
    }

    function goTo(page) {
      pageIndex = (page + pageCount()) % pageCount();
      render();
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    if (prev) {
      prev.addEventListener('click', () => goTo(pageIndex - 1));
    }
    if (next) {
      next.addEventListener('click', () => goTo(pageIndex + 1));
    }
    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });

    window.addEventListener('resize', () => {
      perPage = computePerPage();
      render();
    });

    perPage = computePerPage();
    render();

    setInterval(() => {
      if (!paused) {
        goTo(pageIndex + 1);
      }
    }, 6000);
  }

  function setUpFaqSearch() {
    const input = document.getElementById('faq-search');
    if (!input) {
      return;
    }
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      document.querySelectorAll('.faq-item').forEach((item) => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.style.display = matches ? '' : 'none';
      });
      document.querySelectorAll('.faq-category').forEach((category) => {
        const hasVisibleItem = Array.from(category.querySelectorAll('.faq-item'))
          .some((item) => item.style.display !== 'none');
        category.style.display = hasVisibleItem ? '' : 'none';
      });
    });
  }

  function setUpContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('contact-status');
    if (!form) {
      return;
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
      };
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (status) {
        status.textContent = response.ok
          ? 'Message received. Thanks for reaching out.'
          : 'Something went wrong. Please check the form and try again.';
      }
      if (response.ok) {
        form.reset();
      }
    });
  }

  setUpHamburger();
  setUpTodoForm();
  setUpPrioritySelect();
  setUpDueDateInput();
  setUpHeroCarousel();
  setUpFeatureCarousel();
  setUpFaqSearch();
  setUpContactForm();
})();
