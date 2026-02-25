/* ========================================
   VTEX CSS Sanitizer — Landing Page JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // -- i18n Translations --
  const translations = {
    es: {
      nav_features: "Características",
      nav_versions: "Versiones",
      nav_downloads: "Descargas",
      hero_title: "Limpiá el CSS<br>de tus proyectos<br><span class=\"hero__highlight\">VTEX IO</span>",
      hero_subtitle: "Detectá reglas CSS huérfanas y <code>blockClass</code> sin uso.<br>Mantené tu proyecto limpio, performante y fácil de mantener.",
      hero_btn_download: "Descargar",
      hero_btn_github: "Ver en GitHub",
      feat_label: "Características",
      feat_title: "Todo lo que necesitás",
      feat_1_title: "Análisis Bidireccional",
      feat_1_desc: "Encuentra CSS sin <code>blockClass</code> y <code>blockClass</code> sin CSS. Doble chequeo para no dejar nada suelto.",
      feat_2_title: "Limpieza Interactiva",
      feat_2_desc: "El comando <code>fix</code> te guía regla por regla. Vos decidís qué se elimina y qué se conserva.",
      feat_3_title: "Informes Detallados",
      feat_3_desc: "Genera reportes en Markdown con cada análisis y sesión de limpieza para un registro histórico.",
      feat_4_title: "Seguro",
      feat_4_desc: "Ignora automáticamente los archivos CSS de componentes React custom para evitar falsos positivos.",
      feat_5_title: "Inteligente",
      feat_5_desc: "Reconoce clases de estado dinámicas de VTEX como <code>--isActive</code> y solo valida el <code>blockClass</code> principal.",
      feat_6_title: "CLI + GUI",
      feat_6_desc: "Usalo desde la terminal o con la aplicación de escritorio. Elegí la que mejor se adapte a tu workflow.",
      ver_label: "Versiones",
      ver_title: "Dos formas de usarlo",
      ver_cli_title: "Línea de Comandos",
      ver_cli_desc: "Ideal para integrar en tu workflow de desarrollo.",
      ver_gui_title: "Aplicación de Escritorio",
      ver_gui_desc: "Interfaz visual intuitiva para analizar y limpiar tu proyecto sin tocar la terminal.",
      dl_label: "Descargas",
      dl_title: "Empezá ahora",
      dl_desc: "Elegí la versión que mejor se adapte a tu necesidad.",
      dl_npm_desc: "Instalá globalmente con un solo comando.",
      dl_win_desc: "Descargá el instalador .exe para Windows.",
      dl_btn_win: "Descargar .exe",
      dl_linux_desc: "Descargá el AppImage para distribuciones Linux.",
      dl_btn_linux: "Descargar .AppImage"
    },
    en: {
      nav_features: "Features",
      nav_versions: "Versions",
      nav_downloads: "Downloads",
      hero_title: "Clean the CSS<br>of your<br><span class=\"hero__highlight\">VTEX IO</span> projects",
      hero_subtitle: "Detect orphaned CSS rules and unused <code>blockClass</code> declarations.<br>Keep your project clean, performant, and easy to maintain.",
      hero_btn_download: "Download",
      hero_btn_github: "View on GitHub",
      feat_label: "Features",
      feat_title: "Everything you need",
      feat_1_title: "Bidirectional Analysis",
      feat_1_desc: "Finds CSS without <code>blockClass</code> and <code>blockClass</code> without CSS. Double-checks to leave nothing behind.",
      feat_2_title: "Interactive Cleanup",
      feat_2_desc: "The <code>fix</code> command guides you rule by rule. You decide what stays and what goes.",
      feat_3_title: "Detailed Reports",
      feat_3_desc: "Generates Markdown reports on every analysis and cleanup session for a historical record.",
      feat_4_title: "Safe",
      feat_4_desc: "Automatically ignores CSS files from custom React components to prevent false positives.",
      feat_5_title: "Smart",
      feat_5_desc: "Recognizes dynamic VTEX state classes like <code>--isActive</code> and validates only the core <code>blockClass</code>.",
      feat_6_title: "CLI + GUI",
      feat_6_desc: "Use it from the terminal or through the desktop app. Choose the one that fits your workflow.",
      ver_label: "Versions",
      ver_title: "Two ways to use it",
      ver_cli_title: "Command Line",
      ver_cli_desc: "Ideal for integrating into your development workflow.",
      ver_gui_title: "Desktop App",
      ver_gui_desc: "Intuitive visual interface to analyze and clean your project without touching the terminal.",
      dl_label: "Downloads",
      dl_title: "Start now",
      dl_desc: "Choose the version that best fits your needs.",
      dl_npm_desc: "Install globally with a single command.",
      dl_win_desc: "Download the .exe installer for Windows.",
      dl_btn_win: "Download .exe",
      dl_linux_desc: "Download the AppImage for Linux distributions.",
      dl_btn_linux: "Download .AppImage"
    }
  };

  let currentLang = localStorage.getItem('vtex-css-sanitizer-lang') || 'es';
  const langToggleBtn = document.getElementById('langToggle');
  const langTextSpan = document.getElementById('langText');

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
    // The button shows the language that will be active when clicked.
    // So if current is "es", button shows "EN", if current is "en", button shows "ES"
    langTextSpan.textContent = lang === 'es' ? 'EN' : 'ES';
  }

  // Initial application
  applyLanguage(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('vtex-css-sanitizer-lang', currentLang);
      applyLanguage(currentLang);
    });
  }

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
