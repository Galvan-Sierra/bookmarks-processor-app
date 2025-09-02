## 📁 Overview

Desarrollar una herramienta simple para gestionar marcadores web desde el archivo HTML (formato estándar de exportación de navegadores) con funciones como agregar, leer, editar, actualizar y borrar. Además de utilidades como formatear marcadores y ejecutar ciertas rutinas, por ejemplo buscar marcadores con 'x' característica y realizar 'x' cambios como formatearlos o editar algún atributo, facilitando la gestión personal.

### Objetivos Específicos

- Importar y gestionar archivos de marcadores en formato HTML.
- Permitir operaciones CRUD (crear, leer, actualizar, eliminar) sobre los marcadores.
- Filtrar y organizar los marcadores por palabras clave, carpetas, etc.
- Automatizar la extracción de información de páginas web específicas mediante scripts de scraping ejecutables en el navegador.

## Flujo de Uso Típico

- Importar un archivo de marcadores HTML.
- Manipular los marcadores: filtrar, limpiar, editar, eliminar, ejecutar rutinas predefinidas.
- Exportar los resultados en el formato deseado (por defecto HTML).
- (Opcional) Ejecutar scripts de scraping en el navegador para extraer enlaces de páginas web y agregarlos al sistema mediante archivos JSON.

## Estructura del Proyecto

Para el proyecto se usara esta estructura:

```
bookmarks-processor/
├── src/
│   ├── core/
│   │   └── bookmark-manager.ts
│   ├── config/
│   │   └── constants.ts
│   ├── types/
│   │   ├── bookmark.ts
│   ├── parsers/
│   │   ├── html-parser.ts
│   ├── services/
│   │   ├── bookmark.service.ts
│   │   └── routine.service.ts
│   ├── utils/
│   │   ├── file-handler.ts
│   │   └── helpers.ts
│   ├── routines/
│   │   └── organizer.ts
│   └── index.ts
├── scrapping/
├── docs/
├── package.json
├── tsconfig.json
├── bun.lockb
└── README.md

```

## Descripción de cada carpeta:

**`src/core`**

- `bookmark.service.ts`: gestionar el flujo principal de operaciones y rutinas sobre los marcadores web

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

- Cada rutina como un módulo independiente y reutilizable

---

Como nota estoy pensando usar el patron Result para evitar el uso de try-catch en la lectura, edición y guardado de archivos.
ademas del template patter e incluso el decorator patter para las rutinas
