# NotSoToons

Portafolio de Juan Pablo Arango. Cinco pestañas, sin piezas de ejemplo. El diseño también se cambia desde Pages CMS, sin tocar código.

Dirección: <https://jp-arango.github.io/ToonsPortfolio/>

[Pages CMS](https://pagescms.org) entra con GitHub. Solo quien tenga permiso de escritura en el repositorio puede guardar. Cada guardado es un commit en `main` y GitHub Pages vuelve a publicar solo. Espera uno o dos minutos y recarga.

## Entrar

1. Abre <https://app.pagescms.org>.
2. Entra con GitHub (la cuenta `jp-arango` o una colaboradora).
3. Si pide instalar la app, autoriza **ToonsPortfolio**.
4. Abre el repositorio y la rama **main**.

Desde el teléfono es el mismo enlace, en Chrome o Safari.

No renombres `content`, `media`, `css`, `js`, `.pages.yml` ni `.nojekyll`.

## Pestañas

Solo se ve una sección a la vez. El orden y el nombre salen de **Diseño → Apariencia → Pestañas**.

| Pestaña | Enlace directo | Dónde se editan las piezas |
| --- | --- | --- |
| Ilustración | `#illustration` | Piezas → Ilustración |
| Animación | `#animation` | Piezas → Animación |
| 3D | `#3d` | Piezas → 3D |
| Videojuegos | `#games` | Piezas → Videojuegos |
| Contacto | `#contact` | Diseño → Apariencia (correo y redes) |

Ejemplo: `https://jp-arango.github.io/ToonsPortfolio/#animation`

En el teléfono las pestañas se deslizan en horizontal. En el computador quedan en la barra de arriba.

Para cambiar el orden, arrastra las filas de **Pestañas**. Para esconder una, apaga **Visible**. No borres las cinco filas: el `id` une la pestaña con su lista de piezas.

## Agregar una pieza

1. Entra a Ilustración, Animación, 3D o Videojuegos.
2. Añade una fila en **Piezas**.
3. Escribe el título en español y en inglés.
4. Sube una imagen, pega un YouTube o sube un MP4/WebM.
5. Deja el tamaño en **Wide**. Es el formato de cine a todo el ancho (2.39:1) y es el valor por defecto.
6. **Large**, **Medium** y **Small** solo se notan si en Diseño pones 2 o 3 columnas.
7. Guarda.

Si una fila no tiene imagen ni video, no se muestra. No hay piezas de ejemplo.

Para ordenar, arrastra la fila y guarda.

## Descripción bajo el nombre

En **Apariencia**, **Descripción corta** va debajo de «by Juan Pablo Arango» / «por Juan Pablo Arango». Tiene español e inglés. Si los dos quedan vacíos, esa línea no existe: no deja un hueco.

## Qué cambia cada ajuste de Diseño

Todo está en **Diseño → Apariencia** (`content/theme.json`). Al guardar, el sitio lo aplica solo.

| Campo | Qué hace |
| --- | --- |
| Color de fondo | Fondo general. Por defecto un blanco roto. |
| Color de superficie | Fondos de botones, redes y el recuadro del título cuando va pegado a la imagen. |
| Color del texto | Títulos y párrafos. |
| Color de acento | Pestaña activa y filete de cada pieza. Por defecto rojo. |
| Líneas de fondo | Apagadas por defecto. Actívalas si quieres las líneas gruesas. |
| Dibujo de las líneas | Esquinas, horizontes, diagonales o marco. |
| Color, grosor y opacidad | Cómo se ven esas líneas. Opacidad 1 es sólido; 0 las esconde. |
| Fuente de títulos / de texto | Unas pocas fuentes de Google. |
| Tamaño del título principal | Pequeño, medio o grande para «NotSoToons». |
| Columnas en escritorio | 1 = cada Wide ocupa todo el ancho. 2 o 3 permiten juntar piezas más chicas. |
| Espacio entre piezas | Separación, en píxeles. |
| Proporción por defecto | Cine 2.39:1, 21:9, 16:9, 4:3 o 1:1. La usan las piezas Wide y las secciones vacías. En el teléfono, si es muy ancha, se adapta para que se vea. |
| Posición del título de la pieza | Pegado al borde de arriba, encima de la imagen, o debajo. |
| Redondeo de esquinas | 0 es recto. |
| Título del inicio | El nombre grande. |
| Línea bajo el título | El crédito. Por defecto «by Juan Pablo Arango». |
| Descripción corta | Texto opcional bajo el crédito. Vacío = no se muestra. |
| Imagen de fondo del inicio | Opcional. Sin imagen, el inicio es solo color. |
| Correo y redes | Lo que sale en Contacto. Vacío = solo el aviso de que aún no hay datos. |
| Mostrar título dentro de la pestaña | Apagado por defecto. El nombre ya está en la pestaña; actívalo solo si quieres repetirlo debajo. |
| Texto de entrada (en cada pestaña) | Frase opcional bajo la pestaña. Vacío = no se muestra. |
| Pie de página | El texto del pie. Por defecto `J.P.Arango 2026` en español y en inglés. |
| Pestañas | Orden, nombre en ES/EN y si se ve. |

Los avisos de «aquí aparecerán tus piezas» y los botones están en **Textos de la interfaz**.

## Idioma

Si el idioma del navegador empieza por `es`, abre en español. Si no, en inglés. **ES / EN** guarda la elección en ese navegador.

## Si el sitio no aparece

**Settings → Pages → Build and deployment**

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

El repositorio tiene que ser público.

## Si cambias el usuario o el nombre del repositorio

Las rutas se calculan solas. La dirección nueva es `https://USUARIO.github.io/REPO/`. Revisa Pages (rama `main`, carpeta `/ (root)`) y abre el repositorio nuevo en Pages CMS.

## Verlo en tu computadora

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000/>. No abras el archivo con doble clic.
