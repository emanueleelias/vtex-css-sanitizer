# VTEX CSS Sanitizer

Una herramienta de línea de comandos (CLI) diseñada para limpiar y optimizar las hojas de estilo en proyectos de **VTEX IO**. Analiza tu base de código para encontrar clases CSS huérfanas y declaraciones `blockClass` sin uso, ayudándote a mantener tu proyecto limpio, performante y fácil de mantener.

---

### El Problema

En el desarrollo diario con VTEX IO, es común que:

1. **Las reglas CSS queden huérfanas:** Se elimina un `blockClass` de un archivo JSON, pero sus estilos asociados permanecen en los archivos `.css`.
2. **Las `blockClass` queden sin uso:** Se declara un `blockClass` en un bloque, pero nunca se crea una regla CSS para estilizarlo.

Estos restos de código aumentan el tamaño de los bundles y hacen que la base de código sea más difícil de navegar. Esta herramienta automatiza el proceso de detección y limpieza.

### ✨ Características

- **Análisis Bidireccional:** Encuentra tanto CSS sin `blockClass` como `blockClass` sin CSS.
- **Limpieza Interactiva:** El comando `fix` te guía a través de cada regla candidata, dándote el control total para decidir qué se elimina y qué se conserva.
- **Inteligente:** Reconoce las clases de estado dinámicas de VTEX (ej. `--isActive`) y solo valida el `blockClass` principal.
- **Seguro:** Ignora automáticamente los archivos CSS de componentes React custom para evitar falsos positivos.
- **Informes Detallados:** Genera informes en formato Markdown de cada análisis y sesión de limpieza para un registro histórico.

### 📦 Instalación

Para usar esta herramienta en cualquier proyecto de tu máquina, instálala globalmente:

```bash
npm install -g vtex-css-sanitizer
```

### 🚀 Uso

Navega a la carpeta raíz de tu proyecto VTEX IO y ejecuta los siguientes comandos.

#### 1. Analizar el Proyecto (`analyze`)

Este comando escanea tu proyecto en modo de solo lectura y te muestra un informe en la consola, además de generar un archivo Markdown en la carpeta `.sanitizer-reports/`.

```bash
vtex-css-sanitizer analyze .
```

**Salida de ejemplo en consola:**

```
--- INFORME DE RESULTADOS ---

🔴 Se encontraron 3 SUFIJOS CSS que no corresponden a ninguna 'blockClass' declarada:

  - Sufijo: --main-header-old
    └─ Usado en: styles/css/vtex.flex-layout.css (selector: ".flexRow--main-header-old")

🟡 Se encontraron 2 'blockClass' declaradas que NO se usan en ningún archivo CSS:

  - blockClass: "promo-banner-temporary"
    └─ Declarada en: store/blocks/home/home.jsonc (en el bloque: "rich-text#promo-banner")

--- ANÁLISIS COMPLETADO ---

📄 Informe de análisis guardado en: .sanitizer-reports/analysis-report-2025-07-17.md
```

#### 2. Limpiar el Proyecto (`fix`)

Este comando inicia un proceso interactivo que te guiará regla por regla para que decidas cuál eliminar.

```bash
vtex-css-sanitizer fix .
```

**Proceso interactivo de ejemplo:**

```
[ Progreso: Archivo 24 de 59 ]
------------------------------------------------------------------
Revisando Archivo: styles/css/vtex.breadcrumb.css
Candidato 1 de 1
------------------------------------------------------------------
Se encontró la siguiente regla CSS que podría no estar en uso:

:global(.vtex-breadcrumb-1-x-link--2) {
  font-weight: 900;
}
? ¿Deseas eliminar esta regla CSS? › (Y/n)
```

- **(Y)** para `Sí` (elimina la regla).
- **(n)** para `No` (conserva la regla).
- **Ctrl+C** para cancelar el proceso.

Al finalizar, se genera un informe detallado de las reglas eliminadas y conservadas en la carpeta `.sanitizer-reports/`.

### 📄 Informes

Todos los informes generados se guardan en una nueva carpeta `.sanitizer-reports` en la raíz de tu proyecto. Esta carpeta debería ser añadida a tu `.gitignore`.

### 🤝 Contribuciones

Las contribuciones, issues y peticiones de funcionalidades son bienvenidas.

### 📜 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
