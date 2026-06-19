import { create } from 'zustand';

const getLocalTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// --- INTERFACES ---
export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  archived?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PomodoroLog {
  id: string;
  date: string;
  duration: number;
  taskId?: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  status: 'pendiente' | 'en-curso' | 'bloqueada' | 'completada';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  subtasks?: SubTask[];
  tags?: string[];
}

export interface LinkFolder {
  id: string;
  name: string;
  emoji: string;
  isCollapsed?: boolean;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  folderId: string;
}

export interface CustomDialog {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}


interface TodoStore {
  // --- STATE ---
  projects: Project[];
  tasks: Task[];
  selectedDate: string;
  isDarkMode: boolean;
  availableTags: string[];
  pomodoroLogs: PomodoroLog[];
  links: SavedLink[];
  linkFolders: LinkFolder[];
  
  // UI State
  activeView: 'panel' | 'kanban' | 'tareas' | 'enlaces';
  selectedProjectId: string | null;
  activeTab: 'Todas' | 'Pendientes' | 'Listas';
  searchQuery: string;
  showArchived: boolean;
  customDialog: CustomDialog | null;

  // --- ACTIONS ---
  setTasks: (tasks: Task[]) => void;
  setProjects: (projects: Project[]) => void;
  setDarkMode: (mode: boolean) => void;
  setSelectedDate: (date: string) => void;
  setAvailableTags: (tags: string[]) => void;
  setPomodoroLogs: (logs: PomodoroLog[]) => void;
  setLinks: (links: SavedLink[]) => void;
  setLinkFolders: (folders: LinkFolder[]) => void;

  // UI Actions
  setActiveView: (view: 'panel' | 'kanban' | 'tareas' | 'enlaces') => void;
  setSelectedProjectId: (id: string | null) => void;
  setActiveTab: (tab: 'Todas' | 'Pendientes' | 'Listas') => void;
  setSearchQuery: (query: string) => void;
  setShowArchived: (show: boolean) => void;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, cancelLabel?: string) => void;
  closeDialog: () => void;

  // Persistence
  loadSavedData: () => Promise<void>;
  saveState: (overrides?: Partial<TodoStore>) => Promise<void>;

  // Task Actions
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtasks: (taskId: string, subtasks: SubTask[]) => void;

  // Project Actions
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Links & Folders Actions
  addFolder: (name: string, emoji: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolderCollapse: (id: string) => void;
  addLink: (title: string, url: string, folderId: string) => void;
  deleteLink: (id: string) => void;
  updateLink: (id: string, title: string, url: string, folderId?: string) => void;

  // Backup
  exportData: () => void;
  importData: (jsonData: any) => { success: boolean; error?: string };
}

// Initial default seed states
const defaultProjects: Project[] = [
  { id: 'p-1', name: 'Trabajo', emoji: '💻', color: '#0088ff' },
  { id: 'p-2', name: 'Proyectos', emoji: '🚀', color: '#ff3366' },
  { id: 'p-3', name: 'Estilo de Vida', emoji: '🔋', color: '#ffaa00' }
];

const defaultTasks: Task[] = [
  { id: 't-1', title: 'Planificación de Sprint Semanal', projectId: 'p-1', status: 'completada', startDate: '2026-06-13', endDate: '2026-06-13', startTime: '', endTime: '', description: 'Reunión con el equipo para definir objetivos del sprint.' },
  { id: 't-2', title: 'Comprar Suministros de Oficina', projectId: 'p-3', status: 'pendiente', startDate: '2026-06-13', endDate: '2026-06-14', startTime: '', endTime: '', description: 'Comprar hojas, café y marcadores.' },
  { id: 't-3', title: 'Reunión de Feedback de Cliente', projectId: 'p-1', status: 'bloqueada', startDate: '2026-06-15', endDate: '2026-06-15', startTime: '', endTime: '', description: 'Presentar demo y recibir comentarios.' },
  { id: 't-4', title: 'Estructura Inicial del Backend', projectId: 'p-2', status: 'en-curso', startDate: '2026-06-15', endDate: '2026-06-17', startTime: '', endTime: '', description: 'Configurar servidor Express y base de datos local.' },
  { id: 't-7', title: 'Auditoría de Seguridad del Sistema', projectId: 'p-1', status: 'completada', startDate: '2026-06-14', endDate: '2026-06-16', startTime: '', endTime: '', description: 'Revisión de vulnerabilidades y logs del servidor.' },
  { id: '1', title: 'Rediseñar Portafolio Personal', projectId: 'p-2', status: 'en-curso', startDate: '2026-06-16', endDate: '2026-06-18', startTime: '', endTime: '', description: 'Actualizar diseños anteriores y redactar casos de estudio.' },
  { id: '2', title: 'Revisión de Finanzas Mensuales', projectId: 'p-3', status: 'pendiente', startDate: '2026-06-17', endDate: '2026-06-17', startTime: '', endTime: '', description: 'Conciliar cuentas bancarias y revisar presupuestos.' },
  { id: '3', title: 'Ajustar Configuración del Servidor VPS', projectId: 'p-1', status: 'pendiente', startDate: '2026-06-17', endDate: '2026-06-19', startTime: '', endTime: '', description: 'Optimizar memoria RAM y configurar backups automáticos.' },
  { id: '4', title: 'Sesión de Cardio & Estiramientos', projectId: 'p-3', status: 'completada', startDate: '2026-06-17', endDate: '2026-06-17', startTime: '', endTime: '', description: 'Calentamiento 5m + Cardio HIIT 30m + Estiramientos.' },
  { id: '5', title: 'Escribir Artículo para el Blog', projectId: 'p-2', status: 'completada', startDate: '2026-06-17', endDate: '2026-06-17', startTime: '', endTime: '', description: 'Escribir sobre mejores prácticas en CSS con gradientes.' },
  { id: 't-5', title: 'Preparar Presentación Comercial', projectId: 'p-1', status: 'pendiente', startDate: '2026-06-18', endDate: '2026-06-18', startTime: '', endTime: '', description: 'Crear diapositivas en formato corporativo.' },
  { id: 't-6', title: 'Meditación Guiada', projectId: 'p-3', status: 'en-curso', startDate: '2026-06-18', endDate: '2026-06-19', startTime: '', endTime: '', description: 'Sesión zen de respiración profunda.' },
  { id: 't-8', title: 'Lanzamiento de Campaña de Marketing', projectId: 'p-2', status: 'bloqueada', startDate: '2026-06-19', endDate: '2026-06-19', startTime: '', endTime: '', description: 'Publicación de anuncios y envío de newsletter masivo.' }
];

export const useTodoStore = create<TodoStore>((set, get) => ({
  // --- STATE INITIALIZATION ---
  projects: defaultProjects,
  tasks: defaultTasks,
  selectedDate: getLocalTodayStr(),
  isDarkMode: true,
  availableTags: ['Urgente', 'Importante', 'Personal', 'Trabajo'],
  pomodoroLogs: [],
  links: [],
  linkFolders: [{ id: 'f-general', name: 'General', emoji: '🏠', isCollapsed: false }],
  
  // UI State
  activeView: 'panel',
  selectedProjectId: null,
  activeTab: 'Todas',
  searchQuery: '',
  showArchived: false,
  customDialog: null,

  // --- SETTERS ---
  setTasks: (tasks) => set({ tasks }),
  setProjects: (projects) => set({ projects }),
  setAvailableTags: (availableTags) => set({ availableTags }),
  setPomodoroLogs: (pomodoroLogs) => set({ pomodoroLogs }),
  setLinks: (links) => set({ links }),
  setLinkFolders: (linkFolders) => set({ linkFolders }),

  setDarkMode: (isDarkMode) => {
    set({ isDarkMode });
    get().saveState({ isDarkMode });
  },

  setSelectedDate: (selectedDate) => {
    set({ selectedDate });
    get().saveState({ selectedDate });
  },

  setActiveView: (activeView) => set({ activeView }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowArchived: (showArchived) => set({ showArchived }),
  showAlert: (title, message) => {
    set({
      customDialog: {
        isOpen: true,
        title,
        message,
        type: 'alert',
        confirmLabel: 'Entendido'
      }
    });
  },
  showConfirm: (title, message, onConfirm, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar') => {
    set({
      customDialog: {
        isOpen: true,
        title,
        message,
        type: 'confirm',
        confirmLabel,
        cancelLabel,
        onConfirm
      }
    });
  },
  closeDialog: () => set({ customDialog: null }),

  // --- PERSISTENCE ---
  saveState: async (overrides) => {
    if (window.electronAPI) {
      const state = get();
      await window.electronAPI.saveData({
        tasks: overrides?.tasks ?? state.tasks,
        projects: overrides?.projects ?? state.projects,
        isDarkMode: overrides?.isDarkMode ?? state.isDarkMode,
        selectedDate: overrides?.selectedDate ?? state.selectedDate,
        availableTags: overrides?.availableTags ?? state.availableTags,
        pomodoroLogs: overrides?.pomodoroLogs ?? state.pomodoroLogs,
        links: overrides?.links ?? state.links,
        linkFolders: overrides?.linkFolders ?? state.linkFolders
      });
    }
  },

  loadSavedData: async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.loadData();
      if (data) {
        let folders = data.linkFolders || [];
        if (folders.length === 0) {
          folders = [{ id: 'f-general', name: 'General', emoji: '🏠', isCollapsed: false }];
        }

        let links = data.links || [];
        // Migración de links antiguos sin folderId
        links = links.map((l: any) => ({
          ...l,
          folderId: l.folderId || 'f-general'
        }));

        set({
          tasks: data.tasks || defaultTasks,
          projects: data.projects || defaultProjects,
          isDarkMode: data.isDarkMode !== undefined ? data.isDarkMode : true,
          selectedDate: getLocalTodayStr(), // Always start on today's date on app startup
          availableTags: data.availableTags || ['Urgente', 'Importante', 'Personal', 'Trabajo'],
          pomodoroLogs: data.pomodoroLogs || [],
          linkFolders: folders,
          links: links
        });
      }
    }
  },

  // --- TASK ACTIONS ---
  addTask: (task) => {
    const updated = [...get().tasks, task];
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  updateTask: (task) => {
    const updated = get().tasks.map(t => t.id === task.id ? task : t);
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  deleteTask: (id) => {
    const updated = get().tasks.filter(t => t.id !== id);
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  toggleTaskStatus: (id) => {
    const updated = get().tasks.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completada' ? 'pendiente' : 'completada';
        return { ...t, status: newStatus as any };
      }
      return t;
    });
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  toggleSubtask: (taskId, subtaskId) => {
    const updated = get().tasks.map(t => {
      if (t.id === taskId) {
        const subtasks = (t.subtasks || []).map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks };
      }
      return t;
    });
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  updateSubtasks: (taskId, subtasks) => {
    const updated = get().tasks.map(t => 
      t.id === taskId ? { ...t, subtasks } : t
    );
    set({ tasks: updated });
    get().saveState({ tasks: updated });
  },

  // --- PROJECT ACTIONS ---
  addProject: (project) => {
    const updated = [...get().projects, project];
    set({ projects: updated });
    get().saveState({ projects: updated });
  },

  updateProject: (project) => {
    const updated = get().projects.map(p => p.id === project.id ? project : p);
    set({ projects: updated });
    get().saveState({ projects: updated });
  },

  archiveProject: (id) => {
    const updated = get().projects.map(p => p.id === id ? { ...p, archived: true } : p);
    set({ projects: updated });
    get().saveState({ projects: updated });
  },

  unarchiveProject: (id) => {
    const updated = get().projects.map(p => p.id === id ? { ...p, archived: false } : p);
    set({ projects: updated });
    get().saveState({ projects: updated });
  },

  deleteProject: (id) => {
    const updatedProjects = get().projects.filter(p => p.id !== id);
    const updatedTasks = get().tasks.filter(t => t.projectId !== id);
    set({ projects: updatedProjects, tasks: updatedTasks });
    get().saveState({ projects: updatedProjects, tasks: updatedTasks });
  },

  // --- LINKS & FOLDERS ACTIONS ---
  addFolder: (name, emoji) => {
    const newFolder: LinkFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim() || 'Nueva Sección',
      emoji: emoji || '📁',
      isCollapsed: false
    };
    const updated = [...get().linkFolders, newFolder];
    set({ linkFolders: updated });
    get().saveState({ linkFolders: updated });
  },

  deleteFolder: (id) => {
    const updatedFolders = get().linkFolders.filter(f => f.id !== id);
    const updatedLinks = get().links.filter(l => l.folderId !== id);
    set({ linkFolders: updatedFolders, links: updatedLinks });
    get().saveState({ linkFolders: updatedFolders, links: updatedLinks });
  },

  toggleFolderCollapse: (id) => {
    const updated = get().linkFolders.map(f => 
      f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f
    );
    set({ linkFolders: updated });
    get().saveState({ linkFolders: updated });
  },

  addLink: (title, url, folderId) => {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const newLink: SavedLink = {
      id: `link-${Date.now()}`,
      title: title.trim() || 'Enlace',
      url: cleanUrl,
      folderId
    };
    const updated = [...get().links, newLink];
    set({ links: updated });
    get().saveState({ links: updated });
  },

  deleteLink: (id) => {
    const updated = get().links.filter(l => l.id !== id);
    set({ links: updated });
    get().saveState({ links: updated });
  },

  updateLink: (id, title, url, folderId) => {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const updated = get().links.map(l => {
      if (l.id === id) {
        return {
          ...l,
          title: title.trim() || 'Enlace',
          url: cleanUrl,
          ...(folderId ? { folderId } : {})
        };
      }
      return l;
    });
    set({ links: updated });
    get().saveState({ links: updated });
  },

  // --- BACKUP EXPORT & IMPORT ---
  exportData: () => {
    const state = get();
    const backupData = {
      tasks: state.tasks,
      projects: state.projects,
      availableTags: state.availableTags,
      pomodoroLogs: state.pomodoroLogs,
      links: state.links,
      linkFolders: state.linkFolders,
      isDarkMode: state.isDarkMode
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const exportFileDefaultName = `gravity-backup-${dateStr}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  importData: (jsonData) => {
    try {
      if (!jsonData || typeof jsonData !== 'object') {
        return { success: false, error: 'Formato de archivo inválido. Debe ser un JSON.' };
      }

      // Validaciones básicas de campos indispensables
      if (!Array.isArray(jsonData.tasks) || !Array.isArray(jsonData.projects)) {
        return { success: false, error: 'El archivo no contiene la estructura de tareas/proyectos esperada.' };
      }

      const folders = Array.isArray(jsonData.linkFolders) && jsonData.linkFolders.length > 0
        ? jsonData.linkFolders
        : [{ id: 'f-general', name: 'General', emoji: '🏠', isCollapsed: false }];

      const links = Array.isArray(jsonData.links)
        ? jsonData.links.map((l: any) => ({ ...l, folderId: l.folderId || 'f-general' }))
        : [];

      const newState = {
        tasks: jsonData.tasks,
        projects: jsonData.projects,
        availableTags: Array.isArray(jsonData.availableTags) ? jsonData.availableTags : ['Urgente', 'Importante', 'Personal', 'Trabajo'],
        pomodoroLogs: Array.isArray(jsonData.pomodoroLogs) ? jsonData.pomodoroLogs : [],
        linkFolders: folders,
        links: links,
        isDarkMode: jsonData.isDarkMode !== undefined ? !!jsonData.isDarkMode : get().isDarkMode
      };

      set(newState);
      get().saveState(newState);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al procesar el archivo.' };
    }
  }
}
));
