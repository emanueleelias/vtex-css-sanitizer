# Guía de Publicación y Releases

Este repositorio actúa como un monorepo que contiene 3 proyectos independientes que conviven juntos. Cada uno tiene su propio flujo de publicación y distribución:

1. **Landing Page (`/docs`)**: Hospedada en GitHub Pages.
2. **CLI (Línea de comandos)**: Publicado en el registro de `npm`.
3. **GUI (Aplicación de Escritorio)**: Compilado y publicado en GitHub Releases a través de GitHub Actions.

A continuación se detalla cómo trabajar con cada uno de ellos cuando hay cambios.

---

## 1. Landing Page (`/docs`)

La página web se actualiza automáticamente a través de GitHub Pages cada vez que se hace un `push` a la rama `main` que incluya cambios en la carpeta `/docs`.

**Cómo publicar cambios (ej. modificar textos, diseño o iconos):**

1. Haz tus cambios en los archivos correspondientes (ej: `docs/index.html`, `docs/styles.css`).
2. Haz commit y push de los cambios:
   ```bash
   git add docs/
   git commit -m "docs: actualizar landing page"
   git push origin main
   ```
3. Los cambios se verán reflejados en [https://emanueleelias.github.io/vtex-css-sanitizer/](https://emanueleelias.github.io/vtex-css-sanitizer/) en 1 o 2 minutos.

*Nota: No es necesario crear un Release de la aplicación para que la landing page se actualice.*

---

## 2. CLI (NPM Package)

La versión de línea de comandos se encuentra en la raíz del proyecto (`/src`) y se distribuye a través del registro de `npm` (`vtex-css-sanitizer-cli`).

**Cómo publicar una nueva versión:**

1. Realiza tus cambios o correcciones en la carpeta `/src`.
2. Asegúrate de compilar el código TypeScript:
   ```bash
   npm run build
   ```
3. Actualiza la versión en el `package.json` de la raíz del proyecto. Puedes usar el comando de npm para que te genere el commit y el tag automáticamente:
   ```bash
   npm version patch # Para fixes menores (ej: 1.0.4 -> 1.0.5)
   npm version minor # Para nuevas funciones (ej: 1.0.4 -> 1.1.0)
   npm version major # Para cambios que rompen compatibilidad (ej: 1.0.4 -> 2.0.0)
   ```
4. Publica el paquete en npm (requiere estar logueado previamente con `npm login` si no lo estás):
   ```bash
   npm publish
   ```
5. Empuja los commits y tags generados al repositorio remoto:
   ```bash
   git push origin main --follow-tags
   ```

---

## 3. GUI (Aplicación de Escritorio)

La aplicación con interfaz gráfica y Electron se encuentra completamente autocontenida en la carpeta `/gui`. Las actualizaciones de esta aplicación se distribuyen a través de la pestaña de **Releases** en GitHub.

Los botones de "Descargar para Windows" o "Descargar para Linux" en la Landing Page siempre apuntan al tag especial genérico de `/releases/latest` en GitHub, garantizando que los usuarios siempre descarguen la versión más reciente publicada.

**Cómo generar y publicar una nueva versión de la GUI:**

1. Realiza y prueba tus cambios dentro de la carpeta `/gui`.
2. Actualiza la versión en el archivo `/gui/package.json` (esto es importante para que el nombre del binario generado y los reportes de versión internos sean los correctos).
3. Haz commit y push de los cambios a la rama `main`:
   ```bash
   git add gui/
   git commit -m "feat(gui): nueva funcionalidad"
   git push origin main
   ```
4. **Dispara la creación del Release en GitHub creando un tag Git:**
   Debes crear un tag en Git que comience con la letra `v` apuntando a la versión que quieres publicar:
   ```bash
   git tag v1.0.5
   git push origin v1.0.5
   ```
   *(También puedes empujar tus tags de una vez usando `git push origin main --tags`)*

**¿Qué ocurre después de pushear el tag en Git?**

1. GitHub intercepta el tag `v*.*.*` y automáticamente arranca la [GitHub Action programada](.github/workflows/release.yml).
2. La Action levanta dos entornos virtuales en los servidores de GitHub (uno con Windows y otro con Ubuntu).
3. Automáticamente ingresa a la carpeta `/gui`, instala dependencias, compila el framework y genera los instaladores `.exe` (NSIS para Windows) y `.AppImage` (para Linux).
4. La Action crea la entrada en la sección **Releases** de este repositorio y sube ambos binarios como *assets*.
5. A partir de ese momento, los botones de la Landing Page empezarán a servir automáticamente esta nueva versión.
