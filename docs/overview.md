## 📁 Overview

Desarrollar una herramienta sencilla para procesar marcadores web desde el archivo HTML (formato estándar de exportación de navegadores) con funciones como agregar, leer, editar, actualizar y borrar. Además de utilidades como formatear marcadores y ejecutar ciertas rutinas predefinidas, por ejemplo buscar marcadores con 'x' característica y realizar 'x' cambios como formatearlos o editar algún atributo, facilitando la gestión personal o automatizada de grandes volúmenes de enlaces web.

### Objetivos Específicos

- Importar y procesar archivos de marcadores en formato HTML/JSON.
- Permitir operaciones CRUD (crear, leer, actualizar, eliminar) sobre los marcadores.
- Filtrar y organizar los marcadores por palabras clave, carpetas, etc.
- Automatizar la extracción de información de páginas web específicas mediante scripts de scraping ejecutables en el navegador.

## Flujo de Uso Típico

- Importar un archivo de marcadores HTML.
- Procesar los marcadores: filtrar, limpiar, editar, eliminar, ejecutar rutinas predefinidas.
- Exportar los resultados en el formato deseado (por defecto HTML).
- (Opcional) Ejecutar scripts de scraping en el navegador para extraer enlaces de páginas web y agregarlos al sistema.

## Estructura del Proyecto

Para el proyecto se usara esta estructura:

```
bookmarks-processor/
├── src/
│   ├── core/
        └── bookmark-process.ts
│   ├── config/
│   │   ├── index.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── bookmark.ts
│   │   └── index.ts
│   ├── parsers/
│   │   ├── html-parser.ts
│   ├── services/
│   │   ├── bookmark.service.ts
│   │   └── routine.service.ts
│   ├── utils/
│   │   ├── file-handler.ts
│   │   └── helpers.ts
│   ├── routines/
│   │   ├── duplicate-finder.ts
│   │   ├── replace-content.ts
│   │   └── organizer.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│       └── sample-bookmarks.html
├── scrapping/
├── docs/
├── package.json
├── tsconfig.json
├── bun.lockb
└── README.md

```

## Descripción de cada carpeta:

**`src/config/`**

- Configuración de la aplicación (rutas de archivos, opciones por defecto)
- Constantes globales (regex patterns, formatos soportados)

**`src/types/`**

- Definiciones de TypeScript para bookmarks, folders
- Interfaces para servicios y parsers

**`src/parsers/`**

- Lógica para parsear archivos de bookmarks

**`src/services/`**

- `bookmark.service.ts`: CRUD operations (crear, leer, actualizar, eliminar)
- `routine.service.ts`: Orquestación de rutinas predefinidas

**`src/utils/`**

- `file-handler.ts`: Lectura/escritura de archivos
- `helpers.ts`: Funciones auxiliares reutilizables

**`src/routines/`**

- Rutinas específicas como buscar duplicados, remplazar dominios en la url, etc.
- Cada rutina como un módulo independiente y reutilizable

**`tests/`**

- Tests unitarios, de integración y archivos de ejemplo para testing
- Importar y procesar archivos de marcadores en formato HTML.
- Permitir operaciones CRUD (crear, leer, actualizar, eliminar) sobre los marcadores.
- Filtrar y organizar los marcadores por palabras clave, carpetas, etc.
- Exportar los resultados en distintos formatos (HTML y Markdown).
- Automatizar la extracción de información de páginas web específicas mediante scripts de scraping ejecutables en el navegador.
