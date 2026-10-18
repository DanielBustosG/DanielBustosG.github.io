# Portafolio científico — Daniel Bustos

Sitio estático (HTML + CSS + JS, sin build ni dependencias) con secciones de perfil,
líneas de investigación, publicaciones, grupo y proyectos.

## Cómo verlo

Las publicaciones se piden por `fetch`, así que **abrir `index.html` con doble clic
(`file://`) hace que el navegador bloquee la petición local por CORS**. Levanta un
servidor mínimo:

```bash
cd ~/Documents/Github/Webpage
python3 -m http.server 8000
# luego abre http://localhost:8000
```

Cualquier alternativa sirve (`npx serve`, extensión Live Server de VS Code, etc.).

## Publicaciones: cómo se mantienen actualizadas

Hay tres capas, y en el día a día **no tienes que hacer nada**:

1. **En vivo.** Cada vez que alguien abre la página, la tabla, las citas, el índice h y
   el i10 se calculan desde la API de [OpenAlex](https://openalex.org). Publicas un
   paper, OpenAlex lo indexa (normalmente en días o pocas semanas) y aparece solo.
2. **Respaldo semanal automático.** La GitHub Action
   `.github/workflows/update-publications.yml` corre cada lunes, ejecuta
   `scripts/update_publications.py` y hace commit de `data/publications.json` si cambió.
   Ese JSON es lo que se muestra si OpenAlex no responde. También puedes lanzarla a mano:
   pestaña **Actions → Actualizar publicaciones → Run workflow**.
3. **Ajustes manuales en un solo archivo:** `data/pub-config.json`.
   - Un paper tuyo que OpenAlex **todavía no indexa** → agrégalo en `extraWorks`
     (hay una plantilla en `_plantillaExtra`). Cuando OpenAlex lo indexe, se deduplica
     solo por título.
   - Un paper **ajeno** que se coló (homónimo) → agrega su título a `blocklist`.
   - Un paper tuyo que **no aparece** porque OpenAlex lo asignó a otra entidad →
     agrega `author.id:<id>` a `authorFilters` (ver más abajo).

Antes estos valores estaban duplicados entre el script de PowerShell y `app.js`; ahora
ambos (la página y el script de Python) leen `data/pub-config.json`.

- Google Scholar no tiene API pública y bloquea el scraping, por eso OpenAlex.
  La cobertura es prácticamente la misma y además entrega DOI y enlaces de acceso abierto.
- Si OpenAlex no responde (sin red, o `file://`), la página cae automáticamente al
  respaldo `data/publications.json` y lo avisa bajo el título de la sección.

### Por qué hay DOS filtros y no uno

OpenAlex **partió a Daniel Bustos en tres entidades distintas**:

| Author ID | Contenido | ¿Lleva el ORCID? |
|---|---|---|
| `A5065920526` | perfil principal, 73 trabajos | sí |
| `A5140677645` | solo el paper de RgpB (RSC Advances, 2026) | sí |
| `A5137396268` | solo el paper de Calcium–Alginate (2026) | **no** |

Por eso los filtros son estos dos, y sus resultados se fusionan y deduplican por título:

```
author.orcid:0000-0002-2136-2305   → 74 trabajos (las dos primeras entidades)
author.id:A5137396268              → 1  trabajo  (la tercera, sin ORCID)
```

Filtrar **por ORCID y no por author ID** es lo que hace esto razonablemente
auto-mantenible: si OpenAlex vuelve a inventar una entidad nueva para un paper futuro
pero registra el ORCID, el filtro la captura sola. El ID suelto cubre el caso en que
OpenAlex ni siquiera guardó el ORCID — eso sí requiere intervención manual.

**Si un paper conocido no aparece:** búscalo en
`https://api.openalex.org/works?search=<título>`, mira el `author.id` que está junto a
"Daniel Bustos" en la lista de autores, y agrega `author.id:<ese id>` a `authorFilters`
en `data/pub-config.json`.

### Regenerar el respaldo a mano

```bash
python3 scripts/update_publications.py
```

Solo usa la biblioteca estándar de Python (nada que instalar). Reescribe
`data/publications.json` e imprime publicaciones, citas, h e i10. En GitHub lo hace la
Action cada semana, así que esto solo hace falta para probar localmente.
`update-publications.ps1` queda como versión antigua para Windows y **ya no lee**
`pub-config.json`; puedes borrarlo.

> Las métricas de la página vienen de OpenAlex, no de Google Scholar (que no tiene API).
> Pueden diferir un poco de Scholar, que cuenta más fuentes (tesis, preprints,
> congresos).

### Registros filtrados — importante

Además de partirlo, OpenAlex **fusionó a varios investigadores llamados Daniel Bustos**
dentro del author ID `A5065920526` (su `display_name` interno es de hecho "Daniel
Sebastian Bravo Bustos"). Sin filtrar, la lista incluía papers de un gastroenterólogo
argentino, un matemático que trabaja en geometría diferencial con Ripoll, un químico
educativo mexicano, un cardiólogo, un bioquímico clínico y un médico que publica sobre
agonistas GLP-1. Scholar suma además dos trabajos de un sociólogo homónimo.

Se limpian con dos mecanismos:

1. **Piso de año** (`minYear = 2016`) — casi toda la contaminación es anterior a tu
   carrera (1989–2012), y tu perfil de Scholar parte en 2016. Esto elimina el grueso
   sin mantener una lista de títulos ajenos.
2. **Blocklist por título** — para los homónimos posteriores a 2016: los papers de
   geometría de 2019–2020, el de frío extremo de 2019 y el review de GLP-1 de 2025.

Resultado: **56 publicaciones, 390 citas, índice h = 11** — que coincide con el h-index
que reporta tu perfil de Scholar.

Todos estos valores viven en `data/pub-config.json` (`authorFilters`, `minYear`,
`blocklist`). `app.js` conserva una copia solo como respaldo si ese archivo no carga.

Si aparece otro registro ajeno, agrega su título a `blocklist` **en minúsculas, sin
acentos y sin puntuación** (así se normaliza antes de comparar). Truco para obtenerlo:
la tabla resalta tu nombre en azul, así que **una fila sin nombre resaltado es casi
siempre una atribución errónea**.

## Idioma (ES / EN)

El botón **ES / EN** del header cambia todo el sitio: textos, `<title>`, `<html lang>`,
etiquetas de accesibilidad y hasta el formato de fecha. La elección se guarda en
`localStorage`, y en la primera visita se detecta el idioma del navegador (inglés → EN,
cualquier otro → ES).

**El español es la fuente de la verdad y vive en `index.html`.** Así la página sirve
contenido real aunque el JavaScript falle, y Google la indexa en español.
`assets/js/i18n.js` contiene **solo el inglés**: al cargar, la página guarda una copia
del español del DOM, así que volver a ES es restaurar esa copia. El español nunca está
duplicado en dos archivos.

Cada texto traducible lleva `data-i18n="clave"` en el HTML, y esa misma clave existe en
`I18N_EN`. El valor es HTML y reemplaza el contenido completo del elemento, así que debe
conservar la misma estructura interna (mismos `<li>`, `<strong>`, clases…).

**Si editas un texto en español, actualiza su par en `i18n.js`.** Si una clave falta,
simplemente se muestra el español: se degrada, no se rompe.

Los textos que genera el JavaScript (estado de carga, "Mostrando 55 de 55…", tipos de
publicación) no están en el HTML: viven en `I18N_UI`, al final de `i18n.js`, con ambos
idiomas.

Para verificar que no falte ninguna traducción:

```powershell
$html = Get-Content .\index.html -Raw -Encoding UTF8
$js   = Get-Content .\assets\js\i18n.js -Raw -Encoding UTF8
$keys = [regex]::Matches($html,'data-i18n(?:-placeholder)?="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
$en   = $js.Substring($js.IndexOf('var I18N_EN'), $js.IndexOf('var I18N_UI') - $js.IndexOf('var I18N_EN'))
$keys | Where-Object { $en -notmatch ("(?m)^\s{2}" + [regex]::Escape($_) + "\s*:") }
```

No debe imprimir nada.

## Qué editar

| Quieres cambiar | Archivo | Dónde |
|---|---|---|
| Biografía, formación, métodos | `index.html` | `#sobre-mi` |
| Texto de las 5 líneas de investigación | `index.html` | `#investigacion` |
| Integrantes del grupo | `index.html` | `#grupo`, bloques `<li>` dentro de `.roster-list` |
| Etiqueta de graduado(a) | `index.html` | `<b class="grad">Graduada</b>` dentro del `<strong>` del nombre |
| Tesis dirigidas | `index.html` | `#grupo`, `.theses`: duplica un `<li>` y sube `.thesis-count` |
| Papers que OpenAlex no tiene / homónimos | `data/pub-config.json` | `extraWorks` / `blocklist` |
| Proyectos y financiamiento | `index.html` | `#proyectos` |
| Correo y dirección | `index.html` | `#contacto` |
| Traducciones al inglés | `assets/js/i18n.js` | clave igual al `data-i18n` |
| Colores, tipografía, espaciado | `assets/css/styles.css` | bloque `:root` |

Los puntos que requieren tu input están marcados con `<!-- EDITA: ... -->` en el HTML.

**Pendientes conocidos:**
- Falta el **código** del proyecto FONDECYT Exploración 2025 (ABC transporters). Agrégalo
  como `<span class="project-code">N° …</span>` en `index.html` y en `projects_list` de `i18n.js`.
- El **correo** `dbustos@ucm.cl` es una suposición según el formato de la UCM. Verifícalo.

### Nota sobre los proyectos

Cada tarjeta termina en una fila de financiamiento: logo de ANID
(`assets/img/anid.webp`, tomado de anid.cl) + instrumento + código. El proyecto interno
UCM no lleva logo de ANID.

Las tarjetas usan el **rol** como badge (`badge-lead` = Director, `badge-coi` =
Coinvestigador) en vez de un estado "en ejecución / finalizado". Es deliberado: el rol es
un dato que no caduca, mientras que el estado se desactualiza solo y obliga a editar la
página cada año.

Los **títulos oficiales no se traducen** — aparecen iguales en ES y EN, en el idioma en
que fueron postulados. Un título adjudicado es citable tal cual; traducirlo lo vuelve
imposible de buscar. Solo se traducen el rol, el instrumento y la descripción.

## Fotos

- Retrato: reemplaza el `<div class="portrait">` en `#inicio` por
  `<img src="assets/img/daniel.jpg" alt="Daniel Bustos">`.
- Integrantes: dentro de `.avatar`, pon `<img src="assets/img/persona.jpg" alt="Nombre">`.

Ambos contenedores ya recortan con `object-fit: cover`.

## Estructura

```
index.html                — contenido en español (fuente de la verdad) + claves data-i18n
assets/css/styles.css     — estilos, tema claro/oscuro vía :root
assets/js/i18n.js         — traducciones al inglés + textos generados por JS
assets/js/app.js          — idioma, nav, pestañas, tema, carga de publicaciones
assets/img/anid.webp      — logo ANID para las tarjetas de proyectos
data/pub-config.json      — filtros, blocklist y papers manuales (fuente única)
data/publications.json    — respaldo offline (generado, lo actualiza la Action)
scripts/update_publications.py            — regenera el respaldo desde OpenAlex
.github/workflows/update-publications.yml — corre el script cada lunes
update-publications.ps1   — versión antigua (Windows), reemplazada por el script de Python
```

`i18n.js` debe cargarse **antes** que `app.js`.

## Publicar en GitHub Pages

Es estático, así que basta con subir la carpeta:

```bash
git init
git add .
git commit -m "Portafolio científico"
git branch -M main
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

Luego en el repo: *Settings → Pages → Source: main / (root)*.
