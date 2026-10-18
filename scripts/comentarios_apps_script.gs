/**
 * Recibe los comentarios del formulario de la sección Contacto del sitio web
 * y los agrega al final de un archivo de texto en Google Drive.
 *
 * Instalación (una sola vez, ~5 minutos):
 *  1. Entra a https://script.google.com con tu cuenta de Google → "Nuevo proyecto".
 *  2. Borra el contenido y pega este archivo completo. Guarda (nombre: "Comentarios web").
 *  3. Implementar → Nueva implementación → tipo "Aplicación web".
 *       Ejecutar como: Yo.   Quién tiene acceso: Cualquier usuario.
 *     Autoriza los permisos que pide (acceso a tu Drive) y copia la URL que termina en /exec.
 *  4. En index.html, pega esa URL en data-endpoint="" del <form id="commentForm">.
 *
 * Los comentarios quedan en "comentarios_sitio_web.txt" en la raíz de tu Drive
 * (se crea solo con el primer comentario). Puedes moverlo de carpeta: se sigue usando.
 */
var FILE_NAME = 'comentarios_sitio_web.txt';
var MAX_LEN = 4000;

function doPost(e) {
  var p = (e && e.parameter) || {};
  var msg = String(p.mensaje || '').trim().slice(0, MAX_LEN);
  if (!msg) return out('vacío');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var when = Utilities.formatDate(new Date(), 'America/Santiago', 'yyyy-MM-dd HH:mm');
    var entry = [
      '==================================================',
      'Fecha:   ' + when,
      'Nombre:  ' + clean(p.nombre, 120),
      'Correo:  ' + clean(p.correo, 160),
      'Idioma:  ' + clean(p.idioma, 5) + '   Página: ' + clean(p.pagina, 200),
      '',
      msg,
      ''
    ].join('\n');
    var file = getFile();
    file.setContent(file.getBlob().getDataAsString() + entry + '\n');
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

function doGet() { return out('Formulario de comentarios activo.'); }

function getFile() {
  var id = PropertiesService.getScriptProperties().getProperty('FILE_ID');
  if (id) { try { return DriveApp.getFileById(id); } catch (err) {} }
  var file = DriveApp.createFile(FILE_NAME, 'Comentarios recibidos desde el sitio web\n\n', MimeType.PLAIN_TEXT);
  PropertiesService.getScriptProperties().setProperty('FILE_ID', file.getId());
  return file;
}

function clean(v, n) { return String(v || '—').replace(/[\r\n]+/g, ' ').trim().slice(0, n) || '—'; }
function out(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
