import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Check,
  Edit2,
  Trash2,
  Bold,
  List,
  Palette,
  Archive,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Components
import { Titlebar } from './components/Titlebar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { KanbanBoard } from './components/KanbanBoard';
import { ProjectModal } from './components/ProjectModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WeeklySchedule } from './components/WeeklySchedule';
import { LinksDashboard } from './components/LinksDashboard';
import { CustomDialogModal } from './components/CustomDialogModal';

// Hooks
import { usePomodoro } from './hooks/usePomodoro';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';

// Zustand Store
import { useTodoStore, Task } from './store/useTodoStore';

interface CalendarDay {
  name: string;
  num: number;
  dateStr: string;
}

export default function App() {
  // --- ZUSTAND STORE BINDINGS ---
  const projects = useTodoStore((state) => state.projects);
  const tasks = useTodoStore((state) => state.tasks);
  const selectedDate = useTodoStore((state) => state.selectedDate);
  const isDarkMode = useTodoStore((state) => state.isDarkMode);
  const availableTags = useTodoStore((state) => state.availableTags);
  const pomodoroLogs = useTodoStore((state) => state.pomodoroLogs);
  const links = useTodoStore((state) => state.links);
  const linkFolders = useTodoStore((state) => state.linkFolders);
  const activeView = useTodoStore((state) => state.activeView);
  const selectedProjectId = useTodoStore((state) => state.selectedProjectId);
  const activeTab = useTodoStore((state) => state.activeTab);
  const searchQuery = useTodoStore((state) => state.searchQuery);

  const setSelectedDate = useTodoStore((state) => state.setSelectedDate);
  const setActiveView = useTodoStore((state) => state.setActiveView);
  const setSelectedProjectId = useTodoStore((state) => state.setSelectedProjectId);
  const setActiveTab = useTodoStore((state) => state.setActiveTab);
  const setSearchQuery = useTodoStore((state) => state.setSearchQuery);
  const loadSavedData = useTodoStore((state) => state.loadSavedData);

  const addLink = useTodoStore((state) => state.addLink);
  const deleteLink = useTodoStore((state) => state.deleteLink);
  const addFolder = useTodoStore((state) => state.addFolder);
  const deleteFolder = useTodoStore((state) => state.deleteFolder);
  const toggleFolderCollapse = useTodoStore((state) => state.toggleFolderCollapse);

  // --- CALENDAR DAYS DYNAMIC CALCULATION ---
  const getCalendarDays = (baseDateStr: string): CalendarDay[] => {
    try {
      const baseDate = new Date(baseDateStr + 'T00:00:00');
      if (isNaN(baseDate.getTime())) {
        return [];
      }
      const day = baseDate.getDay();
      const diffToSaturday = (day + 1) % 7;
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - diffToSaturday);
      
      const weekDays: CalendarDay[] = [];
      const dayNames = ['Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
      for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek);
        current.setDate(startOfWeek.getDate() + i);
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        weekDays.push({
          name: dayNames[i],
          num: current.getDate(),
          dateStr: `${yyyy}-${mm}-${dd}`
        });
      }
      return weekDays;
    } catch (e) {
      return [];
    }
  };

  const calendarDays = getCalendarDays(selectedDate);

  const emojis = ['💻', '🚀', '🔋', '📚', '🎨', '🎵', '🏠', '📈', '✈️', '🛒', '🏋️', '🧠', '💼', '🌱', '🔒', '🍕'];
  const colors = ['#0088ff', '#ff3366', '#ffaa00', '#00cc66', '#9933ff', '#00cccc', '#e60000', '#737373'];

  // --- LOCAL NAVIGATION & FORMATTING STATES ---
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Editor Command Popover States
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuSelectedIdx, setSlashMenuSelectedIdx] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  // --- TIMER FOR CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- INITIALIZE CUSTOM HOOKS ---
  const pomodoro = usePomodoro();

  const { focusTaskId, setFocusTaskId } = pomodoro;

  const tasksHook = useTasks({
    editorRef,
    focusTaskId,
    setFocusTaskId
  });

  const { taskFormProjectId, setTaskFormProjectId } = tasksHook;

  const projectsHook = useProjects({
    taskFormProjectId,
    setTaskFormProjectId
  });

  // Fallback project setup on mount
  useEffect(() => {
    if (projects.length > 0 && !taskFormProjectId) {
      setTaskFormProjectId(projects[0].id);
    }
  }, [projects, taskFormProjectId, setTaskFormProjectId]);

  // --- SLASH COMMANDS POPULATION ---
  const slashCommands = [
    { label: 'Negrita', desc: 'Texto en negrita', action: 'bold', icon: Bold },
    { label: 'Lista de Viñetas', desc: 'Insertar lista', action: 'list', icon: List },
    { label: 'Resaltador', desc: 'Resaltado amarillo', action: 'highlight', icon: Palette },
    { label: 'Color Azul', desc: 'Texto color azul', action: 'color', icon: Palette }
  ];

  const getSelectionCoords = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    const tempSpan = document.createElement("span");
    tempSpan.appendChild(document.createTextNode("\u200b"));
    range.insertNode(tempSpan);
    const rect = tempSpan.getBoundingClientRect();
    const parent = tempSpan.parentNode;
    if (parent) {
      parent.removeChild(tempSpan);
      parent.normalize();
    }
    return rect;
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenuSelectedIdx((prev) => (prev + 1) % slashCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenuSelectedIdx((prev) => (prev - 1 + slashCommands.length) % slashCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSlashCommand(slashCommands[slashMenuSelectedIdx]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      }
    }
  };

  const handleEditorInput = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const offset = range.startOffset;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || '';
      const charBefore = text.slice(0, offset);
      if (charBefore.endsWith('/')) {
        const rect = getSelectionCoords();
        if (rect) {
          setSlashMenuPosition({
            top: rect.bottom,
            left: rect.left
          });
          setShowSlashMenu(true);
          setSlashMenuSelectedIdx(0);
        }
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  const executeSlashCommand = (cmd: typeof slashCommands[0]) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const offset = range.startOffset;
        if (text.substring(offset - 1, offset) === '/') {
          textNode.textContent = text.substring(0, offset - 1) + text.substring(offset);
          const newRange = document.createRange();
          newRange.setStart(textNode, offset - 1);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    }

    if (cmd.action === 'bold') {
      document.execCommand('bold', false);
    } else if (cmd.action === 'list') {
      document.execCommand('insertUnorderedList', false);
    } else if (cmd.action === 'highlight') {
      document.execCommand('backColor', false, '#ffaa0044');
    } else if (cmd.action === 'color') {
      document.execCommand('foreColor', false, '#0088ff');
    }

    setShowSlashMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      if (showSlashMenu) setShowSlashMenu(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showSlashMenu]);

  // --- RICH TEXT FORMATTING HANDLERS ---
  const handleEditorCommand = (e: React.MouseEvent, command: string, value: string = '') => {
    e.preventDefault();
    document.execCommand(command, false, value);
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
  };

  // --- FILTERING & MAPPING HELPERS ---
  const dayTasks = tasks.filter(task => {
    const proj = projects.find(p => p.id === task.projectId);
    return task.startDate === selectedDate && (!proj || !proj.archived);
  });

  const searchFilter = (task: Task) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const titleMatch = task.title.toLowerCase().includes(query);
    const descMatch = (task.description || '').toLowerCase().includes(query);
    const projName = projects.find(p => p.id === task.projectId)?.name.toLowerCase() || '';
    const projMatch = projName.includes(query);
    const tagsMatch = (task.tags || []).some(t => t.toLowerCase().includes(query));

    return titleMatch || descMatch || projMatch || tagsMatch;
  };

  const rightSidebarTasks = dayTasks.filter(task => {
    const matchesSearch = searchFilter(task);
    if (activeTab === 'Pendientes') return matchesSearch && task.status !== 'completada';
    if (activeTab === 'Listas') return matchesSearch && task.status === 'completada';
    return matchesSearch;
  });

  const getCategoryCount = (projId: string) => {
    return dayTasks.filter(t => t.projectId === projId).length;
  };

  const getCompletedCategoryCount = (projId: string) => {
    return dayTasks.filter(t => t.projectId === projId && t.status === 'completada').length;
  };

  const getCategoryPercentage = (projId: string) => {
    const total = getCategoryCount(projId);
    if (total === 0) return 0;
    return Math.round((getCompletedCategoryCount(projId) / total) * 100);
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start && !end) return 'Todo el día 📅';
    if (start && !end) return `Desde ${start}`;
    if (!start && end) return `Hasta ${end}`;
    return `${start} - ${end}`;
  };

  const pendingFocusTasks = tasks.filter(t => {
    const proj = projects.find(p => p.id === t.projectId);
    return t.status !== 'completada' && (!proj || !proj.archived);
  });

  const navigateWeek = (weeks: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + weeks * 7);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const newDate = `${yyyy}-${mm}-${dd}`;
    setSelectedDate(newDate);
  };

  const getMonthYearLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Junio 2026';
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return 'Junio 2026';
    }
  };

  // --- WINDOW ACTIONS ---
  const handleMinimize = () => window.electronAPI?.windowMinimize();
  const handleMaximize = () => window.electronAPI?.windowMaximize();
  const handleClose = () => window.electronAPI?.windowClose();

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark-mode bg-[#090a0f] text-gray-200' : 'light-mode bg-slate-50 text-slate-800'}`}>
      
      {/* 1. TITLEBAR */}
      <Titlebar
        isDarkMode={isDarkMode}
        handleMinimize={handleMinimize}
        handleMaximize={handleMaximize}
        handleClose={handleClose}
      />

      {/* 2. MAIN APP CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <SidebarLeft
          openNewProjectModal={projectsHook.openNewProjectModal}
          openEditProjectModal={projectsHook.openEditProjectModal}
          archiveProject={projectsHook.archiveProject}
          unarchiveProject={projectsHook.unarchiveProject}
          deleteProject={projectsHook.deleteProject}
          focusActive={pomodoro.focusActive}
          focusTimeLeft={pomodoro.focusTimeLeft}
          focusDuration={pomodoro.focusDuration}
          focusTaskId={pomodoro.focusTaskId}
          setFocusTaskId={pomodoro.setFocusTaskId}
          handleDurationChange={pomodoro.handleDurationChange}
          toggleFocus={pomodoro.toggleFocus}
          pendingFocusTasks={pendingFocusTasks}
        />

        {/* CENTER COLUMN */}
        <div className={`flex-1 flex flex-col overflow-y-auto transition-colors ${isDarkMode ? 'bg-[#090a0f]' : 'bg-[#f8fafc]'}`}>
          {/* Header search bar */}
          <div className={`p-6 pb-4 flex items-center justify-between border-b select-none shrink-0 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-200 bg-slate-100/50'}`}>
            <div className="relative w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar tareas o proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-full pl-9 pr-4 py-1.5 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-[#121420] border-white/5 text-white focus:border-customBlue/35 focus:ring-customBlue/10' : 'bg-white border-slate-200 text-slate-800 focus:border-customBlue/50 focus:ring-customBlue/10 shadow-sm'}`}
              />
            </div>

            {/* Time / Date */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className={`text-sm font-extrabold font-mono leading-none block transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 block transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  {calendarDays.find(d => d.dateStr === selectedDate)?.name} {calendarDays.find(d => d.dateStr === selectedDate)?.num} {getMonthYearLabel(selectedDate).toUpperCase()}
                </span>
              </div>
              
              <button 
                onClick={tasksHook.openAddTaskForm}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider active:scale-95 transition-all ${isDarkMode ? 'bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-600 shadow-sm'}`}
              >
                <Plus className="w-3.5 h-3.5" /> NUEVA ACTIVIDAD
              </button>
            </div>
          </div>

          {/* MAIN VIEWS */}
          {activeView === 'panel' && (
            <div className="p-6 space-y-6">
              {/* Projects progress cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Líneas de Progreso de Hoy</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Estadísticas por proyecto para la fecha activa (Haz clic para filtrar en Kanban)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={projectsHook.openNewProjectModal} 
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all border ${isDarkMode ? 'bg-[#121420] border-white/5 hover:border-white/10 text-gray-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Nuevo Proyecto
                    </button>
                    <button onClick={() => setActiveView('tareas')} className="text-xs font-bold text-customBlue hover:underline">Ver todas</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {projects.filter(p => !p.archived).map((proj) => {
                    const percentage = getCategoryPercentage(proj.id);
                    return (
                      <div 
                        key={proj.id}
                        onClick={() => { setSelectedProjectId(proj.id); setActiveView('kanban'); }}
                        className={`border rounded-2xl p-5 flex flex-col h-40 hover:shadow-sm transition-all group cursor-pointer hover:scale-[1.01] ${isDarkMode ? 'bg-[#121420] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-800'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className={`text-base font-black tracking-wide truncate max-w-40 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{proj.name}</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Progreso Actual</p>
                          </div>
                          <div className="flex items-start gap-1.5">
                            {/* Hover actions */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); projectsHook.openEditProjectModal(proj, e); }}
                                className="text-gray-500 hover:text-white p-0.5"
                                title="Editar Proyecto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => projectsHook.archiveProject(proj.id, e)}
                                className="text-gray-500 hover:text-indigo-400 p-0.5"
                                title="Archivar Proyecto"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => projectsHook.deleteProject(proj.id, e)}
                                className="text-gray-500 hover:text-red-500 p-0.5"
                                title="Eliminar Proyecto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center border text-base shadow-sm shrink-0"
                              style={{ backgroundColor: `${proj.color}15`, borderColor: `${proj.color}25` }}
                            >
                              {proj.emoji}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className={`text-[11px] font-black transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                              {getCompletedCategoryCount(proj.id)} de {getCategoryCount(proj.id)} completadas
                            </span>
                            <span className={`text-[9px] font-bold tracking-wider transition-colors ${isDarkMode ? 'text-gray-600' : 'text-slate-400'}`}>Hoy</span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <div 
                              className="h-full transition-all duration-500" 
                              style={{ width: `${percentage}%`, backgroundColor: proj.color }}
                            ></div>
                          </div>
                          <div className={`flex justify-between text-[10px] font-extrabold mt-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            <span>Porcentaje</span>
                            <span style={{ color: proj.color }}>{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Create New Project Dotted Button Card */}
                  <button 
                    onClick={projectsHook.openNewProjectModal}
                    className={`border border-dashed rounded-2xl p-5 flex flex-col items-center justify-center h-40 transition-all group ${isDarkMode ? 'bg-transparent border-white/10 hover:border-white/20 text-gray-500 hover:text-white' : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-400 hover:text-slate-700 shadow-sm'}`}
                  >
                    <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold tracking-wide">Nuevo Proyecto</span>
                  </button>
                </div>
              </div>

              {/* Horario Semanal */}
              <div>
                <div className="flex items-center justify-between mb-4 select-none">
                  <div>
                    <h3 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Mi Horario Semanal</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Fechas y tareas asignadas para cada día</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black transition-colors uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {getMonthYearLabel(selectedDate)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => navigateWeek(-1)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                        }`}
                        title="Semana Anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigateWeek(1)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                        }`}
                        title="Semana Siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <WeeklySchedule
                  searchFilter={searchFilter}
                  onEditTask={tasksHook.openEditTaskForm}
                />
              </div>

              {/* Analytics Section */}
              <AnalyticsDashboard
                isDarkMode={isDarkMode}
                tasks={tasks}
                pomodoroLogs={pomodoroLogs}
                availableTags={availableTags}
                calendarDays={calendarDays}
              />
            </div>
          )}

          {/* TABLERO KANBAN */}
          {activeView === 'kanban' && (
            <KanbanBoard
              isDarkMode={isDarkMode}
              selectedDate={selectedDate}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              projects={projects}
              dayTasks={dayTasks}
              searchFilter={searchFilter}
              handleDragStart={tasksHook.handleDragStart}
              handleDragOver={tasksHook.handleDragOver}
              handleDrop={tasksHook.handleDrop}
              handleDropOnTask={tasksHook.handleDropOnTask}
              openEditTaskForm={tasksHook.openEditTaskForm}
              toggleSubtask={tasksHook.toggleSubtask}
            />
          )}

          {/* LISTA COMPLETA */}
          {activeView === 'tareas' && (
            <div className="p-6 flex-1 flex flex-col min-h-0">
              <div className="mb-4">
                <h3 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Todas las Actividades ({selectedDate})</h3>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Listado centralizado de pendientes</p>
              </div>

              <div className={`flex-1 border rounded-xl overflow-hidden flex flex-col min-h-0 transition-colors ${isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="overflow-y-auto flex-1 p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Título</th>
                        <th className="py-3 px-4">Proyecto</th>
                        <th className="py-3 px-4">Horario</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs transition-colors ${isDarkMode ? 'divide-white/5' : 'divide-slate-200'}`}>
                      {dayTasks.filter(searchFilter).map(task => {
                        const proj = projects.find(p => p.id === task.projectId);
                        return (
                          <tr 
                            key={task.id} 
                            onClick={() => tasksHook.openEditTaskForm(task)}
                            className={`transition-colors group cursor-pointer ${isDarkMode ? 'hover:bg-white/[0.02] text-white' : 'hover:bg-slate-50 text-slate-800'}`}
                          >
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => tasksHook.toggleTaskStatus(task.id)}
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                  task.status === 'completada' 
                                    ? 'bg-customBlue border-customBlue text-white' 
                                    : 'border-gray-500 hover:border-customBlue'
                                }`}
                              >
                                {task.status === 'completada' && <Check className="w-2.5 h-2.5 font-bold" />}
                              </button>
                            </td>
                            <td className={`py-3.5 px-4 font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                              <span className={task.status === 'completada' ? (isDarkMode ? 'line-through text-gray-500' : 'line-through text-slate-400') : ''}>{task.title}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span 
                                className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase"
                                style={{ backgroundColor: `${proj?.color}15`, color: proj?.color }}
                              >
                                {proj?.emoji} {proj?.name}
                              </span>
                            </td>
                            <td className={`py-3.5 px-4 font-semibold transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{formatTimeRange(task.startTime, task.endTime)}</td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => tasksHook.openEditTaskForm(task)}
                                  className={`p-1 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => tasksHook.deleteTask(task.id)}
                                  className={`p-1 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {dayTasks.filter(searchFilter).length === 0 && (
                    <div className={`text-center py-16 text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      Sin tareas registradas para esta fecha
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MIS ENLACES */}
          {activeView === 'enlaces' && (
            <LinksDashboard
              isDarkMode={isDarkMode}
              links={links}
              linkFolders={linkFolders}
              onAddLink={addLink}
              onDeleteLink={deleteLink}
              onAddFolder={addFolder}
              onDeleteFolder={deleteFolder}
              onToggleFolderCollapse={toggleFolderCollapse}
            />
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <SidebarRight
          isDarkMode={isDarkMode}
          selectedDate={selectedDate}
          projects={projects}
          dayTasks={dayTasks}
          rightSidebarTasks={rightSidebarTasks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showTaskForm={tasksHook.showTaskForm}
          setShowTaskForm={tasksHook.setShowTaskForm}
          openAddTaskForm={tasksHook.openAddTaskForm}
          openEditTaskForm={tasksHook.openEditTaskForm}
          toggleTaskStatus={tasksHook.toggleTaskStatus}
          deleteTask={tasksHook.deleteTask}
          toggleSubtask={tasksHook.toggleSubtask}
          editingTask={tasksHook.editingTask}
          taskFormTitle={tasksHook.taskFormTitle}
          setTaskFormTitle={tasksHook.setTaskFormTitle}
          taskFormProjectId={tasksHook.taskFormProjectId}
          setTaskFormProjectId={tasksHook.setTaskFormProjectId}
          taskFormStartDate={tasksHook.taskFormStartDate}
          setTaskFormStartDate={tasksHook.setTaskFormStartDate}
          taskFormEndDate={tasksHook.taskFormEndDate}
          setTaskFormEndDate={tasksHook.setTaskFormEndDate}
          taskFormStartTime={tasksHook.taskFormStartTime}
          setTaskFormStartTime={tasksHook.setTaskFormStartTime}
          taskFormEndTime={tasksHook.taskFormEndTime}
          setTaskFormEndTime={tasksHook.setTaskFormEndTime}
          taskFormStatus={tasksHook.taskFormStatus}
          setTaskFormStatus={tasksHook.setTaskFormStatus}
          taskFormTags={tasksHook.taskFormTags}
          setTaskFormTags={tasksHook.setTaskFormTags}
          taskFormSubtasks={tasksHook.taskFormSubtasks}
          setTaskFormSubtasks={tasksHook.setTaskFormSubtasks}
          subtaskInputText={tasksHook.subtaskInputText}
          setSubtaskInputText={tasksHook.setSubtaskInputText}
          newTagInputText={tasksHook.newTagInputText}
          setNewTagInputText={tasksHook.setNewTagInputText}
          showNewTagInput={tasksHook.showNewTagInput}
          setShowNewTagInput={tasksHook.setShowNewTagInput}
          availableTags={availableTags}
          handleAddNewTag={tasksHook.handleAddNewTag}
          handleAddSubtask={tasksHook.handleAddSubtask}
          handleTaskSubmit={tasksHook.handleTaskSubmit}
          handleEditorCommand={handleEditorCommand}
          showTextColorPicker={showTextColorPicker}
          setShowTextColorPicker={setShowTextColorPicker}
          showBgColorPicker={showBgColorPicker}
          setShowBgColorPicker={setShowBgColorPicker}
          editorRef={editorRef}
          handleEditorKeyDown={handleEditorKeyDown}
          handleEditorInput={handleEditorInput}
        />

      </div>

      {/* 3. PROJECT MANAGER MODAL */}
      <ProjectModal
        isDarkMode={isDarkMode}
        showProjectModal={projectsHook.showProjectModal}
        setShowProjectModal={projectsHook.setShowProjectModal}
        editingProject={projectsHook.editingProject}
        projectFormName={projectsHook.projectFormName}
        setProjectFormName={projectsHook.setProjectFormName}
        projectFormEmoji={projectsHook.projectFormEmoji}
        setProjectFormEmoji={projectsHook.setProjectFormEmoji}
        projectFormColor={projectsHook.projectFormColor}
        setProjectFormColor={projectsHook.setProjectFormColor}
        emojis={emojis}
        colors={colors}
        handleProjectSubmit={projectsHook.handleProjectSubmit}
      />

      {/* 4. SLASH COMMANDS POPUP */}
      {showSlashMenu && (
        <div 
          style={{ 
            position: 'fixed', 
            top: `${slashMenuPosition.top}px`, 
            left: `${slashMenuPosition.left}px`,
            zIndex: 1000 
          }}
          onClick={(e) => e.stopPropagation()}
          className={`border rounded-xl shadow-2xl p-1 w-56 flex flex-col transition-all select-none animate-fade-in ${
            isDarkMode ? 'bg-[#121420] border-white/10 text-gray-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
            Comandos Rápidos
          </div>
          {slashCommands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const isSelected = idx === slashMenuSelectedIdx;
            return (
              <button
                key={cmd.label}
                type="button"
                onClick={() => executeSlashCommand(cmd)}
                onMouseEnter={() => setSlashMenuSelectedIdx(idx)}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-left text-xs transition-colors ${
                  isSelected
                    ? (isDarkMode ? 'bg-customBlue/20 text-white font-semibold' : 'bg-customBlue/10 text-customBlue font-semibold')
                    : (isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-slate-100 text-slate-600')
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-customBlue' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{cmd.label}</div>
                  <div className={`text-[9px] truncate ${isSelected ? (isDarkMode ? 'text-gray-300' : 'text-customBlue/70') : 'text-gray-500'}`}>{cmd.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <CustomDialogModal />
    </div>
  );
}
