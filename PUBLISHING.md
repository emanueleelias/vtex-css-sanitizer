# Guía de Publicación y Releases

Este repositorio actúa como un monorepo que contiene 2 proyectos independientes que conviven juntos:

1. **CLI (Línea de comandos)**: Publicado en el registro de `npm`.
2. **GUI (Aplicación de Escritorio)**: Compilado y publicado en GitHub Releases a través de GitHub Actions.

A continuación se detallan los 3 escenarios posibles de publicación.

> **Nota sobre la versión de la GUI:** No es necesario actualizar manualmente la versión en `gui/package.json`. El workflow de GitHub Actions la sincroniza automáticamente desde el tag de Git antes de compilar.

---

## Escenario 1: Cambios en CLI y GUI

Cuando hay cambios en ambos proyectos, una sola secuencia de comandos publica todo:

```bash
# 1. Compilar el CLI
npm run build

# 2. Bump de versión (genera commit + tag automáticamente)
npm version patch   # o minor / major según corresponda

# 3. Publicar CLI en npm
npm publish

# 4. Push de todo (el tag v*.*.* dispara el build de la GUI)
git push origin main --follow-tags
```

El `npm version` crea el tag `v*.*.*` que automáticamente dispara la GitHub Action para compilar y publicar la GUI.

---

## Escenario 2: Solo cambios en la GUI

Cuando los cambios fueron exclusivamente dentro de `/gui` y no hay nada nuevo en el CLI:

```bash
# 1. Commit de los cambios
git add gui/
git commit -m "feat(gui): descripción del cambio"

# 2. Crear tag manualmente (la versión del tag se inyecta en gui/package.json durante el build)
git tag v1.0.8   # usar la versión que corresponda

# 3. Push de todo (el tag dispara el build de la GUI)
git push origin main --follow-tags
```

> No se ejecuta `npm publish` porque no hay cambios en el CLI.

---

## Escenario 3: Solo cambios en el CLI

Cuando los cambios fueron exclusivamente en `/src` y no hay nada nuevo en la GUI:

```bash
# 1. Compilar el CLI
npm run build

# 2. Bump de versión
npm version patch   # o minor / major según corresponda

# 3. Publicar en npm
npm publish

# 4. Push de commits (sin --follow-tags para NO disparar el build de la GUI)
git push origin main
```

> **Importante:** Se usa `git push origin main` (sin `--follow-tags`) para evitar que el tag dispare un release innecesario de la GUI. Si en el futuro querés generar un release de la GUI con esta misma versión, podés hacer `git push origin v*.*.*` manualmente.

---

## ¿Qué ocurre después de pushear un tag?

1. GitHub intercepta el tag `v*.*.*` y automáticamente arranca la [GitHub Action programada](.github/workflows/release.yml).
2. La Action levanta dos entornos virtuales en los servidores de GitHub (uno con Windows y otro con Ubuntu).
3. Automáticamente ingresa a la carpeta `/gui`, instala dependencias, **sincroniza la versión del tag en `gui/package.json`**, compila el framework y genera los instaladores `.exe` (NSIS para Windows) y `.AppImage` (para Linux).
4. La Action crea la entrada en la sección **Releases** de este repositorio y sube ambos binarios como *assets*.
5. A partir de ese momento, los botones de la Landing Page empezarán a servir automáticamente esta nueva versión.
