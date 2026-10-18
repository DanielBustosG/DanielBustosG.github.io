/* Idioma (ES/EN) y tema de los índices de cursos. Comparte claves de localStorage con el sitio principal. */
(function () {
  'use strict';
  var LANG_KEY = 'db-lang', THEME_KEY = 'db-theme';   // mismas claves que el sitio principal
  /* Título por idioma: <html data-title-es="…" data-title-en="…"> */
  var TITLES = { es: document.documentElement.getAttribute('data-title-es') || document.title,
                 en: document.documentElement.getAttribute('data-title-en') || document.title };

  function apply(lang) {
    lang = lang === 'en' ? 'en' : 'es';
    document.querySelectorAll('[data-es]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang);
      if (v != null) el.innerHTML = v;
    });
    // Enlaces que apuntan a la versión del documento en el idioma activo.
    document.querySelectorAll('[data-href-es]').forEach(function (el) {
      var h = el.getAttribute('data-href-' + lang);
      if (h) el.setAttribute('href', h);
    });
    document.querySelectorAll('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  var stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
  apply(stored || ((navigator.language || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'es'));
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-lang')); });
  });

  var btn = document.getElementById('themeToggle');
  btn.addEventListener('click', function () {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  var header = document.getElementById('siteHeader');
  window.addEventListener('scroll', function () { header.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
})();
