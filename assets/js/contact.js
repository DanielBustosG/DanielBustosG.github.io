/* Formulario de comentarios de la sección Contacto.
   Envía el comentario a un Google Apps Script (URL en data-endpoint del formulario),
   que lo agrega al final de un archivo .txt en Google Drive. */
(function () {
  var form = document.getElementById('commentForm');
  if (!form) return;
  // Sin URL configurada el formulario no se muestra (no puede guardar nada todavía).
  if (!(form.getAttribute('data-endpoint') || '').trim()) { form.hidden = true; return; }
  var status = form.querySelector('.cf-status');
  var btn = form.querySelector('button[type="submit"]');
  var MSG = {
    es: { sending: 'Enviando…', ok: '¡Gracias! Tu comentario quedó registrado.', empty: 'Escribe un comentario antes de enviar.',
          email: 'Revisa el formato del correo.', err: 'No se pudo enviar. Inténtalo más tarde o escríbeme por correo.',
          off: 'El formulario aún no está activo; por ahora escríbeme por correo.' },
    en: { sending: 'Sending…', ok: 'Thank you! Your comment has been recorded.', empty: 'Please write a comment before sending.',
          email: 'Please check the email format.', err: 'It could not be sent. Please try later or email me.',
          off: 'The form is not active yet; please email me for now.' }
  };
  function m(k) { return MSG[document.documentElement.lang === 'en' ? 'en' : 'es'][k]; }
  function show(k, cls) { status.textContent = m(k); status.className = 'cf-status' + (cls ? ' ' + cls : ''); }
  var t0 = Date.now();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var d = new FormData(form);
    if (d.get('website')) { show('ok', 'ok'); form.reset(); return; }          // trampa para bots
    var msg = (d.get('mensaje') || '').trim();
    var mail = (d.get('correo') || '').trim();
    if (!msg) { show('empty', 'err'); return; }
    if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { show('email', 'err'); return; }
    if (!endpoint) { show('off', 'err'); return; }
    if (Date.now() - t0 < 3000) { show('ok', 'ok'); form.reset(); return; } // envíos instantáneos = bots

    var body = new URLSearchParams();
    body.append('nombre', (d.get('nombre') || '').trim());
    body.append('correo', mail);
    body.append('mensaje', msg);
    body.append('idioma', document.documentElement.lang || 'es');
    body.append('pagina', location.href);
    btn.disabled = true; show('sending');
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () { show('ok', 'ok'); form.reset(); })
      .catch(function () { show('err', 'err'); })
      .then(function () { btn.disabled = false; });
  });
})();
