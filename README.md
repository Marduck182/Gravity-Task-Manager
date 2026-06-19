# 🌌 Gravity Task Manager

Un gestor de tareas premium y minimalista de alto rendimiento para Windows. Diseñado con una interfaz **glassmorphic** moderna, transiciones fluidas y una experiencia de usuario optimizada al estilo de las aplicaciones de productividad más sofisticadas.

---

## ✨ Características Principales

*   **🗂️ Organización de Proyectos:** Crea, edita y archiva proyectos con iconos emoji personalizados y colores identificadores.
*   **📋 Tablero Kanban:** Organiza tus actividades diarias arrastrándolas entre columnas de estados (*Pendientes*, *En Curso*, *Bloqueadas* y *Completadas*).
*   **📅 Calendario y Agenda Semanal:** Planificación dinámica con cálculo de semanas en tiempo real y vista interactiva de actividades por fecha.
*   **⏱️ Temporizador Pomodoro:** Enfoque integrado con registro automático de sesiones vinculadas a tus tareas activas.
*   **🔗 Notion-Style Links (Mis Enlaces):** Guarda, edita en línea y clasifica por carpetas/secciones tus sitios web y recursos más visitados.
*   **💾 Copia de Seguridad:** Exporta e importa todo el estado de la aplicación (tareas, proyectos, enlaces, logs) en formato JSON con un solo clic.
*   **💬 Modales Personalizados:** Sistema de confirmaciones y alertas internas de diseño premium, previniendo congelamientos de interfaz causados por diálogos nativos del OS.

---

## 🛠️ Stack Tecnológico

*   **Core:** [Electron](https://www.electronjs.org/) (Framework para apps de escritorio) + [React](https://react.dev/) + [Vite](https://vite.dev/)
*   **Estado Global:** [Zustand](https://github.com/pmndrs/zustand) (Gestión de estado ligera y reactiva con persistencia automatizada)
*   **Diseño y Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Estilos utilitarios) + Vanilla CSS (Custom tokens) + [Lucide React](https://lucide.dev/) (Iconos)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto y seguro)

---

## 🚀 Comandos de Desarrollo

En la raíz del proyecto, puedes ejecutar:

```bash
# Instalar dependencias
npm install

# Iniciar la aplicación en modo desarrollo (Hot-reloading)
npm run dev

# Compilar los archivos de Renderer (Vite) y Main (TypeScript)
npm run compile

# Construir el instalador ejecutable portátil para Windows (.exe)
npm run build
```

---

## 📂 Estructura del Código

*   `src/main/`: Lógica del proceso principal de Electron (creación de ventanas, persistencia IPC de datos en formato JSON).
*   `src/renderer/`: Código de la interfaz de usuario en React.
    *   `src/components/`: Componentes UI reutilizables (Kanban, SidebarLeft, SidebarRight, LinksDashboard, CustomDialogModal, etc.).
    *   `src/hooks/`: Hooks de lógica desacoplada (`useTasks`, `useProjects`, `usePomodoro`).
    *   `src/store/`: Almacén central de estado global con Zustand (`useTodoStore.ts`).
