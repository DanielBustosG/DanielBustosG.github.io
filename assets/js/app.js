/* ============================================================
   Daniel Bustos — portafolio científico
   Idioma, navegación, pestañas, tema y publicaciones (OpenAlex)
   Requiere assets/js/i18n.js cargado antes que este archivo.
   ============================================================ */
(function () {
  'use strict';

  // ── Configuración ─────────────────────────────────────────
  // La configuración real vive en data/pub-config.json (la comparte el script
  // scripts/update_publications.py). Estos valores son solo el respaldo por si ese
  // archivo no se puede leer. Para cambiar filtros, blocklist o agregar papers a mano,
  // edita data/pub-config.json — no este bloque.
  var CONFIG = {
    configUrl: 'data/pub-config.json',
    extraWorks: [],
    // OpenAlex partió a este autor en TRES entidades, así que un solo filtro no basta:
    //   A5065920526  perfil principal, 73 trabajos, lleva el ORCID
    //   A5140677645  solo el paper de RgpB en RSC Advances, también lleva el ORCID
    //   A5137396268  solo el paper de Calcium-Alginate, SIN ORCID registrado
    // Filtrar por ORCID captura las dos primeras (74) y seguirá funcionando con papers
    // futuros indexados bajo entidades nuevas; el ID explícito cubre el caso en que
    // OpenAlex no registró el ORCID. Los resultados se fusionan y deduplican por título.
    //
    // Si un paper conocido deja de aparecer, búscalo en
    // https://api.openalex.org/works?search=<título>, mira el author id junto a
    // "Daniel Bustos" y agrega 'author.id:<id>' aquí.
    // Mantener sincronizado con $AuthorFilters en update-publications.ps1.
    authorFilters: [
      'author.orcid:0000-0002-2136-2305',
      'author.id:A5137396268'
    ],
    // OpenAlex pide un correo de contacto para el "polite pool" (respuestas más rápidas).
    mailto: 'danielbustos.ibi@gmail.com',
    fallback: 'data/publications.json',
    // OpenAlex mezcla en este ID a varios homónimos, y casi toda esa contaminación
    // es anterior a tu carrera (gastroenterología 1989-2001, química educativa 2012...).
    // Tu perfil de Scholar parte en 2016, así que ese piso limpia el grueso sin
    // mantener una lista de títulos ajenos. Súbelo o bájalo si hiciera falta.
    minYear: 2016,
    // Variantes con las que aparece tu nombre en las listas de autores.
    mePattern: /^(d(aniel)?\.?\s*(m(at[ií]as)?\.?\s*)?bustos)/i,
    // OpenAlex fusionó varios investigadores llamados Daniel Bustos en este author ID
    // (su display_name interno es "Daniel Sebastian Bravo Bustos"), y Scholar suma otro.
    // Estos títulos son de homónimos: sociología, geometría diferencial, cardiología y
    // bioquímica clínica. Mantener sincronizado con $TitleBlocklist en update-publications.ps1.
    blocklist: [
      'el barrio esta en extincion',
      'transformaciones en la estructura socio-ocupacional de la provincia de nuble mirada desde la perspectiva funcionalista',
      'influencia do frio extremo na temperatura interna corporal na pressao arterial sanguinea e frequencia cardiaca',
      'variabilidade biologica de aldolase serica sua utilidade na interpretacao dos resultados',
      'biological variation of serum aldolase its use for interpretation of the results variabilidade biologica de aldolase serica sua utilidade na interpretacao dos resultados',
      'on the existence of foliations by solutions to the exterior dirichlet problem for the minimal surface equation',
      'harmonic gauss maps of submanifolds of arbitrary codimension of the euclidean space and sphere and some applications',
      'paradoxical low flowlow gradient severe aortic stenosis a clinical entity or a scientific artifact',
      // Review clínico de otro Daniel Bustos; es posterior a minYear, así que solo la lista lo saca.
      'psychological and behavioral effects of glp1 and gip agonists in weight loss a comprehensive review'
    ]
  };

  // Lee data/pub-config.json y sobrescribe los valores por defecto.
  function loadConfig() {
    return fetch(CONFIG.configUrl, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('config HTTP ' + r.status); return r.json(); })
      .then(function (c) {
        if (Array.isArray(c.authorFilters) && c.authorFilters.length) CONFIG.authorFilters = c.authorFilters;
        if (typeof c.minYear === 'number') CONFIG.minYear = c.minYear;
        if (Array.isArray(c.blocklist)) CONFIG.blocklist = c.blocklist;
        if (Array.isArray(c.extraWorks)) CONFIG.extraWorks = c.extraWorks;
        if (c.mailto) CONFIG.mailto = c.mailto;
      })
      .catch(function (err) { console.warn('Usando configuración embebida:', err.message); });
  }

  // Papers agregados a mano en pub-config.json (los que OpenAlex aún no indexa).
  // Si después OpenAlex lo indexa, dedupe() se queda con una sola copia.
  function withExtras(list) {
    var extras = (CONFIG.extraWorks || []).map(function (w) {
      return {
        id: w.doi || w.title, title: w.title, authors: w.authors || [], venue: w.venue || null,
        year: w.year || null, volume: w.volume || null, issue: w.issue || null, pages: w.pages || null,
        doi: w.doi || null, url: w.url || w.doi || null, oa_url: w.oa_url || null,
        citations: w.citations || 0, type: w.type || 'article'
      };
    });
    return list.concat(extras);
  }

  var LANG_KEY = 'db-lang';
  var THEME_KEY = 'db-theme';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var state = { pubs: [], view: [], lang: 'es', meta: {} };

  // Textos generados por JS, en el idioma activo.
  function t() { return I18N_UI[state.lang]; }

  // ── Utilidades ────────────────────────────────────────────
  // U+0300–U+036F es el bloque de diacríticos combinantes que produce NFD.
  // Se construye con escapes ASCII para no depender de la codificación del archivo.
  var COMBINING = new RegExp('[\\u0300-\\u036f]', 'g');

  function stripAccents(s) {
    return (s || '').normalize('NFD').replace(COMBINING, '');
  }
  function normTitle(s) {
    return stripAccents(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  }
  function titleKey(s) {
    return stripAccents(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function clearMarkup(s) {
    if (!s) return '';
    var d = document.createElement('textarea');
    d.innerHTML = s;
    var once = d.value;
    d.innerHTML = once;               // algunos títulos vienen doblemente escapados
    return d.value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function cleanDoi(u) {
    return u ? String(u).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '') : '';
  }

  /* ══════════════════════════════════════════════════════════
     Idioma

     El español es la fuente de la verdad y vive en index.html, así que la
     página sirve contenido real sin JavaScript. Al arrancar guardamos una copia
     del español de cada [data-i18n]; i18n.js solo necesita traer el inglés, y
     volver a ES es restaurar la copia. Así el español nunca está duplicado.
     ══════════════════════════════════════════════════════════ */
  var esSnapshot = Object.create(null);
  var esAttrSnapshot = Object.create(null);

  function snapshotSpanish() {
    $$('[data-i18n]').forEach(function (el) {
      esSnapshot[el.getAttribute('data-i18n')] = el.innerHTML;
    });
    $$('[data-i18n-placeholder]').forEach(function (el) {
      esAttrSnapshot[el.getAttribute('data-i18n-placeholder')] = el.placeholder;
    });
  }

  function applyLang(lang) {
    state.lang = (lang === 'en') ? 'en' : 'es';
    var en = (state.lang === 'en');
    var ui = t();

    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      // Una clave sin traducción deja el español a la vista: se degrada, no se rompe.
      var html = en ? I18N_EN[key] : esSnapshot[key];
      if (html == null) html = esSnapshot[key];
      if (html != null) el.innerHTML = html;
    });

    $$('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var v = en ? I18N_EN[key] : esAttrSnapshot[key];
      if (v == null) v = esAttrSnapshot[key];
      if (v != null) el.placeholder = v;
    });

    // Metadatos y etiquetas de accesibilidad, que no son nodos de texto.
    document.documentElement.lang = ui.htmlLang;
    document.title = ui.title;
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', ui.metaDesc);

    var navEl = $('#nav');
    if (navEl) navEl.setAttribute('aria-label', ui.navLabel);
    var themeBtn = $('#themeToggle');
    if (themeBtn) { themeBtn.setAttribute('aria-label', ui.themeLabel); themeBtn.title = ui.themeLabel; }
    var navToggle = $('#navToggle');
    if (navToggle) {
      var open = navEl && navEl.classList.contains('open');
      navToggle.setAttribute('aria-label', open ? ui.menuClose : ui.menuOpen);
    }
    var search = $('#pubSearch');
    if (search) search.setAttribute('aria-label', ui.searchLabel);
    var tablist = $('[role="tablist"]');
    if (tablist) tablist.setAttribute('aria-label', ui.tablistLabel);
    var caption = $('.pub-table caption');
    if (caption) caption.textContent = ui.tableCaption;

    $$('#langSwitch .lang-btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === state.lang;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('active', on);
    });

    // El pie se reemplaza completo, así que el año hay que volver a ponerlo.
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());

    try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) {}

    // Todo lo que dibuja el JS tiene que redibujarse en el nuevo idioma.
    if (state.pubs.length) {
      buildTypeOptions();
      applyFilters();
      renderStatus();
      renderMetricsNote();
      renderMiniRefs();
    }
  }

  function initLang() {
    snapshotSpanish();
    var stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
    var guess = (navigator.language || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
    applyLang(stored || guess);

    $$('#langSwitch .lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });
  }

  /* ══════════════════════════════════════════════════════════
     Tema
     ══════════════════════════════════════════════════════════ */
  function initTheme() {
    var root = document.documentElement;
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}

    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));

    var btn = $('#themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     Navegación
     ══════════════════════════════════════════════════════════ */
  function initNav() {
    var header = $('#siteHeader');
    var navEl = $('#nav');
    var toggle = $('#navToggle');

    if (toggle && navEl) {
      toggle.addEventListener('click', function () {
        var open = navEl.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? t().menuClose : t().menuOpen);
      });
      navEl.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          navEl.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', t().menuOpen);
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    // Resalta el enlace de la sección visible.
    var links = $$('#nav a');
    var sections = links
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ══════════════════════════════════════════════════════════
     Pestañas de investigación
     ══════════════════════════════════════════════════════════ */
  function initTabs() {
    var root = $('#researchTabs');
    if (!root) return;
    var tabEls = $$('[role="tab"]', root);

    function select(tab, focus) {
      tabEls.forEach(function (tb) {
        var on = tb === tab;
        tb.setAttribute('aria-selected', String(on));
        tb.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(tb.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabEls.forEach(function (tb) {
      tb.addEventListener('click', function () { select(tb, false); });
      tb.addEventListener('keydown', function (e) {
        var i = tabEls.indexOf(tb), next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabEls[(i + 1) % tabEls.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabEls[(i - 1 + tabEls.length) % tabEls.length];
        else if (e.key === 'Home') next = tabEls[0];
        else if (e.key === 'End') next = tabEls[tabEls.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     Publicaciones
     ══════════════════════════════════════════════════════════ */

  // Normaliza un registro de OpenAlex al formato que usa la tabla.
  function fromOpenAlex(w) {
    var loc = w.primary_location || {};
    var src = loc.source || {};
    var bib = w.biblio || {};
    var oa = w.open_access || {};
    var pages = (bib.first_page && bib.last_page)
      ? bib.first_page + '-' + bib.last_page
      : (bib.first_page || null);

    return {
      id: w.id,
      title: clearMarkup(w.title || w.display_name),
      authors: (w.authorships || []).map(function (a) {
        return a.raw_author_name || (a.author && a.author.display_name) || '';
      }).filter(Boolean),
      venue: src.display_name || null,
      year: w.publication_year || null,
      volume: bib.volume || null,
      issue: bib.issue || null,
      pages: pages,
      doi: w.doi || null,
      url: w.doi || loc.landing_page_url || null,
      oa_url: oa.oa_url || null,
      citations: w.cited_by_count || 0,
      type: w.type || null
    };
  }

  // OpenAlex mantiene preprint y versión publicada como obras distintas;
  // conservamos la de mayor conteo de citas.
  function dedupe(list) {
    var byKey = Object.create(null);
    list.forEach(function (p) {
      if (!p.title) return;
      if (CONFIG.minYear && p.year && p.year < CONFIG.minYear) return;
      if (CONFIG.blocklist.indexOf(normTitle(p.title)) !== -1) return;
      var k = titleKey(p.title);
      var prev = byKey[k];
      if (!prev || (p.citations || 0) > (prev.citations || 0)) byKey[k] = p;
    });
    return Object.keys(byKey).map(function (k) { return byKey[k]; });
  }

  function sortPubs(list, mode) {
    return list.slice().sort(function (a, b) {
      if (mode === 'citations') {
        return (b.citations - a.citations) || ((b.year || 0) - (a.year || 0));
      }
      return ((b.year || 0) - (a.year || 0)) || (b.citations - a.citations);
    });
  }

  function fetchOpenAlexFilter(filter) {
    // 'select' omite abstract_inverted_index: es el grueso del payload y no lo usamos.
    var select = ['id', 'doi', 'title', 'publication_year', 'cited_by_count',
                  'type', 'biblio', 'primary_location', 'open_access', 'authorships'].join(',');
    var acc = [];
    // Paginado por cursor: no se corta aunque el filtro supere los 200 trabajos.
    function page(cursor) {
      var url = 'https://api.openalex.org/works'
              + '?filter=' + filter
              + '&per-page=200&cursor=' + encodeURIComponent(cursor)
              + '&select=' + select
              + '&mailto=' + encodeURIComponent(CONFIG.mailto);
      return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('OpenAlex HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          var res = (data && data.results) || [];
          acc = acc.concat(res);
          var next = data && data.meta && data.meta.next_cursor;
          return (next && res.length) ? page(next) : acc;
        });
    }
    return page('*');
  }

  function fetchOpenAlex() {
    return Promise.all(CONFIG.authorFilters.map(fetchOpenAlexFilter))
      .then(function (pages) {
        var raw = pages.reduce(function (acc, p) { return acc.concat(p); }, []);
        if (!raw.length) throw new Error('OpenAlex sin resultados');
        // dedupe() fusiona lo que traen los distintos filtros: se solapan por diseño.
        return { pubs: dedupe(withExtras(raw.map(fromOpenAlex))), live: true };
      });
  }

  function fetchFallback() {
    return fetch(CONFIG.fallback)
      .then(function (r) {
        if (!r.ok) throw new Error('fallback HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        return { pubs: dedupe(withExtras(data.works || [])), live: false, generated: data.generated };
      });
  }

  function authorsHtml(authors) {
    if (!authors || !authors.length) return '';
    return authors.map(function (a) {
      return CONFIG.mePattern.test(a.trim())
        ? '<span class="me">' + esc(a) + '</span>'
        : esc(a);
    }).join(', ');
  }

  function venueHtml(p) {
    if (!p.venue) return '';
    var s = esc(p.venue);
    if (p.volume) {
      s += ' ' + esc(p.volume);
      if (p.issue) s += '(' + esc(p.issue) + ')';
    }
    if (p.pages) s += ', ' + esc(p.pages);
    return '<span class="pub-venue">' + s + '</span>';
  }

  function badgesHtml(p) {
    var out = '';
    if (p.type && p.type !== 'article') {
      var lbl = t().types[p.type] || p.type;
      out += '<span class="pill' + (p.type === 'preprint' ? ' preprint' : '') + '">' + esc(lbl) + '</span>';
    }
    if (p.oa_url) out += '<span class="pill oa" title="' + esc(t().oaTitle) + '">OA</span>';
    return out ? '<span class="pub-badges">' + out + '</span>' : '';
  }

  function render() {
    var body = $('#pubBody');
    var foot = $('#pubFoot');
    if (!body) return;

    if (!state.view.length) {
      body.innerHTML = '<tr><td colspan="5" class="pub-empty">' + esc(t().noMatch) + '</td></tr>';
      if (foot) foot.textContent = '';
      return;
    }

    body.innerHTML = state.view.map(function (p, i) {
      var link = p.oa_url || p.url;
      var titleHtml = link
        ? '<a class="pub-title" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>'
        : '<span class="pub-title">' + esc(p.title) + '</span>';

      var linkCell = p.doi
        ? '<a class="link-btn" href="https://doi.org/' + esc(cleanDoi(p.doi)) + '" target="_blank" rel="noopener">' + esc(t().doi) + '</a>'
        : (link ? '<a class="link-btn" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(t().view) + '</a>' : '<span class="pill">—</span>');

      return '<tr>'
        + '<td class="cell-n">' + (i + 1) + '</td>'
        + '<td class="cell-year">' + esc(p.year || '—') + '</td>'
        + '<td>' + titleHtml + badgesHtml(p)
        +   '<span class="pub-authors">' + authorsHtml(p.authors) + '</span>'
        +   venueHtml(p)
        + '</td>'
        + '<td><span class="cite-badge' + (p.citations >= 10 ? ' hot' : '') + '">' + p.citations + '</span></td>'
        + '<td>' + linkCell + '</td>'
        + '</tr>';
    }).join('');

    var cites = state.view.reduce(function (s, p) { return s + (p.citations || 0); }, 0);
    if (foot) foot.textContent = t().foot(state.view.length, state.pubs.length, cites);
  }

  function applyFilters() {
    var q = ($('#pubSearch') && $('#pubSearch').value || '').trim().toLowerCase();
    var year = $('#pubYear') && $('#pubYear').value;
    var type = $('#pubType') && $('#pubType').value;
    var sort = ($('#pubSort') && $('#pubSort').value) || 'year';
    var qn = stripAccents(q);

    state.view = sortPubs(state.pubs.filter(function (p) {
      if (year && String(p.year) !== year) return false;
      if (type && p.type !== type) return false;
      if (!qn) return true;
      var hay = stripAccents(
        (p.title || '') + ' ' + (p.authors || []).join(' ') + ' ' + (p.venue || '')
      ).toLowerCase();
      return hay.indexOf(qn) !== -1;
    }), sort);

    render();
  }

  function buildYearOptions() {
    var yearSel = $('#pubYear');
    if (!yearSel) return;
    var years = state.pubs.map(function (p) { return p.year; }).filter(Boolean);
    Array.from(new Set(years)).sort(function (a, b) { return b - a; }).forEach(function (y) {
      var o = document.createElement('option');
      o.value = String(y); o.textContent = String(y);
      yearSel.appendChild(o);
    });
  }

  // Se reconstruye en cada cambio de idioma: las etiquetas de tipo se traducen.
  function buildTypeOptions() {
    var sel = $('#pubType');
    if (!sel) return;
    var current = sel.value;

    // El primer <option> ("Todos"/"All") lo traduce data-i18n; solo se rehacen los demás.
    while (sel.options.length > 1) sel.remove(1);

    var counts = {};
    state.pubs.forEach(function (p) { if (p.type) counts[p.type] = (counts[p.type] || 0) + 1; });
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (ty) {
      var o = document.createElement('option');
      o.value = ty;
      o.textContent = (t().types[ty] || ty) + ' (' + counts[ty] + ')';
      sel.appendChild(o);
    });

    sel.value = current;
  }

  function initFilterEvents() {
    ['#pubSearch', '#pubYear', '#pubType', '#pubSort'].forEach(function (sel) {
      var el = $(sel);
      if (el) el.addEventListener(sel === '#pubSearch' ? 'input' : 'change', applyFilters);
    });
  }

  function renderStatus() {
    var status = $('#pubStatus');
    if (!status) return;
    if (state.meta.failed) {
      status.textContent = t().loadError;
      status.classList.add('error');
    } else if (state.meta.live) {
      status.textContent = t().liveStatus(state.pubs.length);
      status.classList.remove('error');
    } else {
      status.textContent = t().localStatus(state.pubs.length, state.meta.generated);
      status.classList.add('error');
    }
  }

  function renderMetricsNote() {
    var note = $('#metricsNote');
    if (!note) return;
    var d = new Date().toLocaleDateString(t().locale);
    note.textContent = state.meta.live ? t().metricsLive(d) : t().metricsLocal(state.meta.generated);
  }

  function renderMetrics() {
    var pubs = state.pubs;
    var cites = pubs.reduce(function (s, p) { return s + (p.citations || 0); }, 0);

    var desc = pubs.map(function (p) { return p.citations || 0; }).sort(function (a, b) { return b - a; });
    var h = 0;
    while (h < desc.length && desc[h] >= h + 1) h++;
    var i10 = desc.filter(function (c) { return c >= 10; }).length;

    var vals = { works: pubs.length, citations: cites, hindex: h, i10: i10 };
    $$('[data-metric]').forEach(function (el) {
      var v = vals[el.getAttribute('data-metric')];
      if (v != null) countUp(el, v);
    });

    renderMetricsNote();
  }

  function countUp(el, target) {
    // El valor final se escribe siempre: requestAnimationFrame no corre en pestañas
    // en segundo plano, y la métrica no puede quedarse en "—" esperando el foco.
    el.textContent = String(target);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || document.visibilityState !== 'visible') return;

    var start = performance.now(), dur = 900;
    function step(now) {
      var t2 = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t2, 3);
      el.textContent = String(Math.round(target * eased));
      if (t2 < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Llena las listas "Publicaciones clave" de cada pestaña buscando por fragmentos de título.
  function renderMiniRefs() {
    $$('.mini-refs').forEach(function (ul) {
      var needles = (ul.getAttribute('data-refs') || '').split('|')
        .map(function (s) { return stripAccents(s).toLowerCase().trim(); })
        .filter(Boolean);

      var picked = [];
      var seen = Object.create(null);
      needles.forEach(function (n) {
        state.pubs.forEach(function (p) {
          if (picked.length >= 5 || seen[p.id]) return;
          if (stripAccents(p.title).toLowerCase().indexOf(n) !== -1) {
            seen[p.id] = true;
            picked.push(p);
          }
        });
      });

      picked = sortPubs(picked, 'year').slice(0, 4);

      if (!picked.length) {
        ul.innerHTML = '<li class="ref-empty">' + esc(t().refEmpty) + '</li>';
        return;
      }

      ul.innerHTML = picked.map(function (p) {
        var link = p.oa_url || p.url;
        var ti = p.title.length > 92 ? p.title.slice(0, 92).trim() + '…' : p.title;
        var meta = [p.venue, p.year].filter(Boolean).join(' · ');
        var inner = '<span>' + esc(ti) + '</span><span class="ref-meta">' + esc(meta) + '</span>';
        return '<li>' + (link
          ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + inner + '</a>'
          : inner) + '</li>';
      }).join('');
    });
  }

  function loadPubs() {
    var status = $('#pubStatus');
    if (status) status.textContent = t().loading;

    loadConfig()
      .then(fetchOpenAlex)
      .catch(function (err) {
        // Sin red, o abierto con file:// y CORS bloqueado: usamos el JSON local.
        console.warn('OpenAlex no disponible, usando respaldo local:', err.message);
        return fetchFallback();
      })
      .then(function (res) {
        state.pubs = sortPubs(res.pubs, 'year');
        state.view = state.pubs.slice();
        state.meta = { live: !!res.live, generated: res.generated, failed: false };

        buildYearOptions();
        buildTypeOptions();
        initFilterEvents();
        render();
        renderMetrics();
        renderMiniRefs();
        renderStatus();
      })
      .catch(function (err) {
        console.error(err);
        state.meta = { failed: true };
        renderStatus();
        var body = $('#pubBody');
        if (body) body.innerHTML = '<tr><td colspan="5" class="pub-empty">' + esc(t().noData) + '</td></tr>';
        $$('.mini-refs').forEach(function (ul) {
          ul.innerHTML = '<li class="ref-empty">' + esc(t().refEmpty) + '</li>';
        });
      });
  }

  function boot() {
    initLang();     // debe ir primero: guarda la copia del español intacta
    initTheme();
    initNav();
    initTabs();
    loadPubs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
