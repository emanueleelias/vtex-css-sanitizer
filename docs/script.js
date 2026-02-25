/* ========================================
   VTEX CSS Sanitizer — Landing Page JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // -- Copy to clipboard --
  function setupCopyButton(blockId, btnId) {
    const block = document.getElementById(blockId);
    const btn = document.getElementById(btnId);
    if (!block || !btn) return;

    btn.addEventListener('click', () => {
      const code = block.querySelector('code');
      if (!code) return;

      const text = code.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        block.classList.add('copied');
        setTimeout(() => block.classList.remove('copied'), 2000);
      });
    });
  }

  setupCopyButton('copyBlock', 'copyBtn');
  setupCopyButton('copyBlockDl', 'copyBtnDl');

  // -- Scroll reveal --
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // -- Smooth scroll for anchor links --
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});
