(function () {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('navbar-menu');
  if (!hamburger || !menu) {
    return;
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    const isOpen = menu.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  hamburger.addEventListener('click', toggleMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
})();
