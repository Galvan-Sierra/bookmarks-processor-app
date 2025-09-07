## 📁 Overview

Desarrollar una herramienta simple y sencilla para administrar y procesar mis marcadores web desde el archivo HTML (formato estándar de exportación de navegadores).

### Objetivos Específicos

App back-end, desarrollado con buenas practicas, que permita:

- [ ] Importar y procesar archivos de marcadores en formato HTML/JSON.
- [ ] Permitir operaciones CRUD (crear, leer, actualizar, eliminar) sobre los marcadores.
- [ ] Filtrar y organizar los marcadores por palabras clave, carpetas, etc.
- [ ] Crear y ejecutar rutinas/procedimientos almacenados.
- [ ] Automatizar la extracción de información de páginas web específicas mediante scripts de scraping ejecutables en el navegador.

## Flujo de Uso Típico

- Importar un archivo de marcadores HTML.
- Manipular los marcadores: filtrar, limpiar, editar, eliminar, ejecutar rutinas predefinidas.
- Exportar los resultados en el formato deseado (por defecto HTML).
- (Opcional) Ejecutar scripts de scraping en el navegador para extraer enlaces de páginas web y agregarlos al sistema mediante archivos JSON.

## 📁 **Estructura del Proyecto (Revisada)**

```
bookmarks-processor/
├── src/
│   ├── core/
│   │   ├── bookmark-manager.ts
│   │   └── scraper-manager.ts
│   ├── config/
│   │   ├── constants.ts
│   │   ├── app-config.ts
│   │   └── scraping-sites.ts
│   ├── types/
│   │   ├── bookmark.ts
│   │   ├── selectors.ts
│   │   └── scraping.ts
│   ├── parsers/
│   │   └── html-parser.ts
│   ├── services/
│   │   ├── bookmark.service.ts
│   │   ├── routine.service.ts
│   │   └── scraping.service.ts
│   ├── utils/
│   │   ├── file-handler.ts
│   │   ├── helpers.ts
│   │   └── scraping-utils.ts
│   ├── routines/
│   │   └── organizer.ts
│   ├── scrapers/
│   │   ├── base.scraper.ts
│   │   ├── twitter.scraper.ts
│   │   └── reddit.scraper.ts
│   └── index.ts
├── scripts/
│   └── build-scrapers.ts
├── docs/
├── dist/
│   └── scrapers/
├── package.json
├── tsconfig.json
├── bun.lockb
└── README.md
```

## 📋 **Descripción de Cada Carpeta**

### **`src/core/`**

**Gestores principales del flujo de la aplicación**

- **`bookmark-manager.ts`**: Orquestador principal que coordina todas las operaciones sobre marcadores (importar, exportar, ejecutar rutinas, integración con scraping)
- **`scraper-manager.ts`**: Gestor centralizado de scrapers que maneja la configuración de sitios, ejecución de scrapers específicos y transformación de datos extraídos

### **`src/config/`**

**Configuración centralizada de toda la aplicación**

- **`constants.ts`**: Constantes globales (regex patterns, formatos soportados, paths por defecto)
- **`app-config.ts`**: Configuración general de la aplicación (rutas de archivos, opciones por defecto, límites de procesamiento)
- **`scraping-sites.ts`**: Configuraciones específicas para cada sitio web (selectores, rate limits, URLs base, reglas de extracción)

### **`src/types/`**

**Definiciones de TypeScript unificadas**

- **`bookmark.ts`**: Interfaces para bookmarks, folders, metadata y estructuras de datos principales
- **`selectors.ts`**: Tipos para selectores CSS/DOM y configuraciones de parsing HTML
- **`scraping.ts`**: Tipos para configuraciones de scraping, resultados, errores y estados de ejecución

### **`src/parsers/`**

**Procesamiento de archivos de entrada**

- **`html-parser.ts`**: Parser principal para archivos HTML de marcadores exportados desde navegadores (Chrome, Firefox, Safari, Edge)

### **`src/services/`**

**Servicios de negocio con responsabilidades específicas**

- **`bookmark.service.ts`**: Operaciones CRUD sobre marcadores (crear, leer, actualizar, eliminar, búsqueda, filtrado)
- **`routine.service.ts`**: Orquestación y ejecución de rutinas predefinidas (limpieza, organización, transformaciones en lote)
- **`scraping.service.ts`**: Puente entre el sistema de marcadores y el módulo de scraping, maneja la integración de datos extraídos

### **`src/utils/`**

**Utilidades reutilizables organizadas por contexto**

- **`file-handler.ts`**: Operaciones de lectura/escritura de archivos (import/export HTML, JSON, validación de formatos)
- **`helpers.ts`**: Funciones auxiliares generales (validaciones, transformaciones de datos, utilidades de strings/URLs)
- **`scraping-utils.ts`**: Utilidades específicas para scraping (validación de selectores, rate limiting, manejo de errores de red)

### **`src/routines/`**

**Rutinas especializadas como módulos independientes**

- **`organizer.ts`**: Rutinas de organización automática (por fecha, categorías, duplicados)
- _(Extensible para futuras rutinas como `cleaner.ts`, `validator.ts`, `migrator.ts`)_

### **`src/scrapers/`**

**Scripts de extracción específicos por sitio**

- **`base.scraper.ts`**: Clase abstracta base con funcionalidad común (rate limiting, error handling, DOM utilities)
- **`twitter.scraper.ts`**: Scraper específico para Twitter/X (manejo de paginación infinita, tweets, enlaces)
- **`reddit.scraper.ts`**: Scraper para Reddit (posts, comentarios, subreddits)
- _(Extensible para nuevos sitios siguiendo el patrón base)_

### **`scripts/`**

**Scripts de automatización y build**

- **`build-scrapers.ts`**: Script automatizado para transpilar scrapers individuales a formato browser usando Bun, con soporte para build selectivo y watch mode

### **`dist/scrapers/`**

**Archivos compilados para ejecución en navegador**

- Contendrá los scrapers transpilados listos para inyección en páginas web (`.js` files optimizados y minificados)
