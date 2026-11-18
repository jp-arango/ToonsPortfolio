# NotSoToons

Portafolio de Juan Pablo Arango (NotSoToons): ilustración, animación y videojuegos.

Dirección pública: <https://jp-arango.github.io/ToonsPortfolio/>

No hace falta programar para cambiar textos, fotos, videos, juegos o precios. Todo eso vive en archivos y se edita con [Pages CMS](https://pagescms.org), que entra con tu cuenta de GitHub. Solo quien tenga permiso de escritura en este repositorio puede guardar cambios.

El sitio no se compila. Cada vez que guardas en Pages CMS, se crea un commit en la rama `main` y GitHub Pages vuelve a publicar solo. Espera uno o dos minutos y recarga la página.

## Entrar a Pages CMS

1. Abre <https://app.pagescms.org> en el navegador.
2. Entra con GitHub, con la cuenta dueña del repositorio (`jp-arango`) o con una cuenta que sea colaboradora.
3. Si te pide instalar la aplicación de Pages CMS, elige tu cuenta y autoriza el repositorio **ToonsPortfolio**.
4. Abre **ToonsPortfolio** y la rama **main**.
5. Elige una sección en el menú, edita los campos y guarda. El botón de guardar crea el commit.

No renombres las carpetas `content`, `media`, `css` o `js`, ni los archivos `.pages.yml` y `.nojekyll`. Si los renombras, el sitio o el editor dejan de encontrarse.

## Desde el teléfono

El mismo enlace, <https://app.pagescms.org>, funciona en Chrome o Safari.

1. Entra con GitHub. Si el teléfono te manda a la app de GitHub para autorizar, acepta y vuelve al navegador.
2. Abre el repositorio y la rama `main`.
3. Toca la sección (por ejemplo **Ilustraciones** o **Encargos**).
4. Toca un campo. Se abre el teclado. Escribe y guarda arriba.
5. Para cambiar una foto, toca el campo de imagen y elige un archivo de la galería o de la cámara. Mejor JPG, PNG o WebP. Si el teléfono guarda HEIC, exporta la foto como JPG antes de subirla.
6. Espera uno o dos minutos y recarga <https://jp-arango.github.io/ToonsPortfolio/>. Si sigue igual, cierra la pestaña y ábrela de nuevo.

## Qué se edita en cada sección

| Quieres cambiar | En Pages CMS | Archivo |
| --- | --- | --- |
| Título, tagline, menú, hero, textos de botones | Textos generales | `content/site.json` |
| Galería de ilustración | Ilustraciones | `content/illustrations.json` |
| Reel y videos | Animación | `content/animations.json` |
| Juegos, incluido el de la universidad | Videojuegos | `content/games.json` |
| Precios | Encargos | `content/commissions.json` |
| Biografía y retrato | Acerca de | `content/about.json` |
| Correo y redes | Contacto | `content/contact.json` |
| Archivos de imagen | Cualquier campo de imagen | carpeta `media/` |

Cada texto visible tiene español (`es`) e inglés (`en`). Llena los dos. El orden de las secciones está fijo: Ilustración, Animación, Videojuegos, Encargos, Acerca de, Contacto. Dentro de una lista sí puedes cambiar el orden arrastrando las filas.

La primera ilustración de la lista es la pieza grande. En videojuegos, el primer proyecto con **Destacado** activado ocupa la ficha grande: déjalo en el juego de la universidad.

## Poner un video de YouTube

En **Animación**, abre el reel o un video. En **YouTube (ID o URL)** puedes pegar cualquiera de estas dos cosas:

- la URL completa, por ejemplo `https://www.youtube.com/watch?v=XXXXXXXXXXX`
- solo el ID, los 11 caracteres que van después de `v=`

Si el campo está vacío, el sitio no incrusta nada y muestra el enlace del campo **Enlace** (ahora apunta al canal NotSoToons). El póster es la imagen de antes de dar play.

## Precios

En **Encargos**, la moneda está una sola vez (`USD`). En cada fila el precio es solo el número:

- Pose base con render: `25`
- Foto de perfil: `10`

Puedes agregar otra fila con el botón de añadir, o borrar una que no uses.

## Idioma de quien visita

La primera vez, el sitio mira el idioma del navegador. Si empieza por `es` (por ejemplo `es-CO` o `es-MX`), abre en español. Si no, abre en inglés. El interruptor **ES / EN** guarda la elección en ese navegador.

## Si el sitio sale en blanco o en 404

En GitHub: **Settings → Pages → Build and deployment**.

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/ (root)`

Guarda y espera un par de minutos. El repositorio tiene que seguir siendo público. No hace falta un workflow de GitHub Actions: no hay paso de compilación.

## Si cambias el usuario de GitHub o el nombre del repositorio

Las rutas del sitio se calculan solas a partir de la carpeta donde está publicada la página. No tienes que editar `js/` ni reescribir las imágenes si siguen guardadas como `media/archivo.png`.

1. La dirección nueva será `https://USUARIO.github.io/REPO/`.
2. Entra a **Settings → Pages** y confirma otra vez: Deploy from a branch, rama `main`, carpeta `/ (root)`.
3. En Pages CMS abre el repositorio con el nombre nuevo (puede hacer falta autorizarlo de nuevo).
4. Actualiza la dirección en la bio de YouTube y en las otras redes.
5. Si más adelante usas un dominio propio, se configura en Settings → Pages. Este proyecto no trae dominio propio.

La página de error (`404.html`) también arma el enlace de regreso con el nombre actual del repositorio.

## Verlo en tu computadora

Dentro de la carpeta del repositorio:

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000/>. No abras el `index.html` con doble clic: el navegador no deja cargar los JSON así.
