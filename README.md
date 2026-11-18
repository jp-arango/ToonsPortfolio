# NotSoToons

Portafolio de Juan Pablo Arango. Dos categorías y contacto. Sin piezas de ejemplo: las obras las agregas tú.

Dirección: <https://jp-arango.github.io/ToonsPortfolio/>

No hace falta programar. [Pages CMS](https://pagescms.org) entra con tu cuenta de GitHub y solo quien tenga permiso de escritura en este repositorio puede guardar. Al guardar se crea un commit en `main` y GitHub Pages vuelve a publicar solo. Espera uno o dos minutos y recarga.

El formato base de cada pieza, y de las secciones cuando están vacías, es una página ancha de cine (más ancha que 16:9, cerca de 2.39:1) a todo el ancho en el computador. En el teléfono se adapta.

## Entrar

1. Abre <https://app.pagescms.org>.
2. Entra con GitHub (la cuenta `jp-arango` o una colaboradora).
3. Si pide instalar la app, autoriza el repositorio **ToonsPortfolio**.
4. Abre el repositorio y la rama **main**.

No renombres `content`, `media`, `css`, `js`, `.pages.yml` ni `.nojekyll`.

## Desde el teléfono

El mismo enlace funciona en el navegador del teléfono.

1. Entra con GitHub y abre **ToonsPortfolio**, rama `main`.
2. Toca **Ilustración y animación** o **3D y videojuegos**.
3. Toca añadir una pieza.
4. Escribe el título en español y en inglés.
5. Toca el campo de imagen y elige una foto (JPG, PNG o WebP). Si el teléfono guarda HEIC, expórtala como JPG.
6. Deja el tamaño en **Wide**. Eso es el formato de cine a todo el ancho.
7. Guarda arriba. Espera un poco y recarga el sitio.

## Agregar una pieza

1. Entra a la categoría.
2. Añade una fila en **Piezas**.
3. Título en los dos idiomas. Queda pegado al borde de arriba de la imagen.
4. Sube la imagen, o pega un enlace de YouTube, o sube un MP4/WebM.
5. Tamaño:
   - **Wide**: cine, todo el ancho. Es el valor por defecto. Si no eliges otro, sale así.
   - **Large**, **Medium**, **Small**: más chicas, para combinar varias en la misma fila.
6. Guarda.

Si una fila no tiene imagen ni video, no se muestra.

## Ordenar

En la lista de piezas, arrastra la fila hacia arriba o hacia abajo. El orden de la lista es el orden del sitio. Guarda después de soltar.

## Contacto

En **Sitio** puedes poner el correo y una lista de redes. Si los dejas vacíos, la pestaña Contacto solo muestra el aviso de que aún no hay datos. No hay cuentas inventadas.

## Idioma

Si el idioma del navegador empieza por `es`, el sitio abre en español. Si no, en inglés. El botón **ES / EN** guarda la elección en ese navegador.

## Si el sitio no aparece

**Settings → Pages → Build and deployment**

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

El repositorio tiene que ser público.

## Si cambias el usuario o el nombre del repositorio

Las rutas se calculan solas. La dirección nueva es `https://USUARIO.github.io/REPO/`.

1. Revisa Settings → Pages: Deploy from a branch, `main`, carpeta `/ (root)`.
2. En Pages CMS abre el repositorio con el nombre nuevo.
3. Actualiza el enlace donde lo hayas compartido.

## Verlo en tu computadora

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000/>. No abras el archivo con doble clic.
