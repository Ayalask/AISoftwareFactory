(function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const interval = Number(carousel.dataset.interval) || 5000;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('hero-slide--active'));
  if (activeIndex < 0) {
    activeIndex = 0;
  }
  let timer = null;

  function showSlide(index) {
    slides[activeIndex].classList.remove('hero-slide--active');
    dots[activeIndex]?.removeAttribute('aria-current');
    activeIndex = index;
    slides[activeIndex].classList.add('hero-slide--active');
    dots[activeIndex]?.setAttribute('aria-current', 'true');
  }

  function advance() {
    showSlide((activeIndex + 1) % slides.length);
  }

  function startAutoAdvance() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(advance, interval);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoAdvance();
    });
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  startAutoAdvance();
})();
