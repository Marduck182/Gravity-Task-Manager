import React from 'react';
import { 
  Grid, 
  Columns, 
  ListTodo, 
  FolderPlus, 
  ChevronDown, 
  FolderArchive, 
  Play, 
  Pause, 
  Edit2, 
  Archive, 
  Trash2, 
  Sun, 
  Moon,
  Link,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { useTodoStore, Project, Task } from '../store/useTodoStore';

const getLocalTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface SidebarLeftProps {
  openNewProjectModal: () => void;
  openEditProjectModal: (proj: Project, e: React.MouseEvent) => void;
  archiveProject: (id: string, e: React.MouseEvent) => void;
  unarchiveProject: (id: string, e: React.MouseEvent) => void;
  deleteProject: (id: string, e: React.MouseEvent) => void;
  
  // Pomodoro
  focusActive: boolean;
  focusTimeLeft: number;
  focusDuration: number;
  focusTaskId: string;
  setFocusTaskId: (id: string) => void;
  handleDurationChange: (mins: number) => void;
  toggleFocus: () => void;
  pendingFocusTasks: Task[];
}

export function SidebarLeft({
  openNewProjectModal,
  openEditProjectModal,
  archiveProject,
  unarchiveProject,
  deleteProject,
  focusActive,
  focusTimeLeft,
  focusDuration,
  focusTaskId,
  setFocusTaskId,
  handleDurationChange,
  toggleFocus,
  pendingFocusTasks
}: SidebarLeftProps) {
  const isDarkMode = useTodoStore((state) => state.isDarkMode);
  const setDarkMode = useTodoStore((state) => state.setDarkMode);
  const projects = useTodoStore((state) => state.projects);
  const tasks = useTodoStore((state) => state.tasks);
  const activeView = useTodoStore((state) => state.activeView);
  const setActiveView = useTodoStore((state) => state.setActiveView);
  const selectedProjectId = useTodoStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useTodoStore((state) => state.setSelectedProjectId);
  const showArchived = useTodoStore((state) => state.showArchived);
  const setShowArchived = useTodoStore((state) => state.setShowArchived);
  const selectedDate = useTodoStore((state) => state.selectedDate);
  const setSelectedDate = useTodoStore((state) => state.setSelectedDate);
  const exportData = useTodoStore((state) => state.exportData);
  const importData = useTodoStore((state) => state.importData);
  const showAlert = useTodoStore((state) => state.showAlert);

  const dayTasks = tasks.filter(task => {
    const proj = projects.find(p => p.id === task.projectId);
    return task.startDate === selectedDate && (!proj || !proj.archived);
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getCategoryCount = (projId: string) => {
    return tasks.filter(t => t.projectId === projId).length;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = importData(json);
        if (result.success) {
          showAlert('Copia de Seguridad', '¡Copia de seguridad restaurada correctamente!');
        } else {
          showAlert('Error de Importación', `Error al importar: ${result.error}`);
        }
      } catch (err) {
        showAlert('Archivo Inválido', 'El archivo seleccionado no es un JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyProjectReport = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return;

    const projTasks = tasks.filter(t => t.projectId === projId);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.status === 'completada');
    const enCurso = projTasks.filter(t => t.status === 'en-curso');
    const pendiente = projTasks.filter(t => t.status === 'pendiente');
    const bloqueada = projTasks.filter(t => t.status === 'bloqueada');

    const pct = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    let md = `# Reporte de Proyecto: ${proj.emoji} ${proj.name}\n\n`;
    md += `**Progreso General:** ${completed.length} de ${total} completadas (${pct}%)\n\n`;
    
    md += `## ⚡ En Curso (${enCurso.length})\n`;
    if (enCurso.length === 0) md += `- Sin tareas activas.\n`;
    else enCurso.forEach(t => md += `- ${t.title} (Vence: ${t.endDate || 'N/A'})\n`);
    
    md += `\n## 🚨 Bloqueadas (${bloqueada.length})\n`;
    if (bloqueada.length === 0) md += `- Sin tareas bloqueadas.\n`;
    else bloqueada.forEach(t => md += `- ${t.title} (Desde: ${t.statusChangedAt || t.startDate || 'N/A'})\n`);

    md += `\n## 📋 Pendientes (${pendiente.length})\n`;
    if (pendiente.length === 0) md += `- Sin tareas pendientes.\n`;
    else pendiente.forEach(t => md += `- ${t.title} (Inicio: ${t.startDate || 'N/A'})\n`);

    md += `\n## ✓ Completadas (${completed.length})\n`;
    if (completed.length === 0) md += `- Ninguna completada aún.\n`;
    else completed.forEach(t => md += `- ${t.title}\n`);

    navigator.clipboard.writeText(md).then(() => {
      showAlert('Reporte de Proyecto', `¡El resumen del proyecto "${proj.emoji} ${proj.name}" ha sido copiado al portapapeles en Markdown!`);
    }).catch(() => {
      showAlert('Error', 'No se pudo copiar el reporte al portapapeles.');
    });
  };

  return (
    <div className={`w-64 border-r flex flex-col p-5 select-none shrink-0 transition-colors ${isDarkMode ? 'bg-[#090a0f] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
      {/* User profile */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-customBlue to-customPink p-0.5 shadow-md shadow-customBlue/10">
          <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs text-white ${isDarkMode ? 'bg-[#090a0f]' : 'bg-slate-100 text-slate-800'}`}>
            AJ
          </div>
        </div>
        <div>
          <h2 className={`text-sm font-bold tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Mi Espacio</h2>
          <p className={`text-[10px] font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Solo Productividad</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 mb-6">
        <p className={`text-[10px] font-bold tracking-wider mb-2 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>MI NAVEGACIÓN</p>

        <button 
          onClick={() => setActiveView('panel')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'panel' 
              ? (isDarkMode 
                  ? 'bg-customBlue/15 text-white border border-customBlue/10 shadow-inner' 
                  : 'bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-sm')
              : (isDarkMode 
                  ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Grid className="w-4 h-4 text-customBlue" />
            <span>Mi Panel</span>
          </div>
          {activeView === 'panel' && <span className="w-1.5 h-1.5 rounded-full bg-customBlue"></span>}
        </button>

        <button 
          onClick={() => setActiveView('kanban')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'kanban' 
              ? (isDarkMode 
                  ? 'bg-customBlue/15 text-white border border-customBlue/10 shadow-inner' 
                  : 'bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-sm')
              : (isDarkMode 
                  ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Columns className="w-4 h-4 text-customPink" />
            <span>Tablero Kanban</span>
          </div>
          {activeView === 'kanban' && <span className="w-1.5 h-1.5 rounded-full bg-customPink"></span>}
        </button>

        <button 
          onClick={() => setActiveView('tareas')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'tareas' 
              ? (isDarkMode 
                  ? 'bg-customBlue/15 text-white border border-customBlue/10 shadow-inner' 
                  : 'bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-sm')
              : (isDarkMode 
                  ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ListTodo className="w-4 h-4 text-customOrange" />
            <span>Lista de Tareas</span>
          </div>
          {activeView === 'tareas' && <span className="w-1.5 h-1.5 rounded-full bg-customOrange"></span>}
        </button>

        <button 
          onClick={() => setActiveView('enlaces')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'enlaces' 
              ? (isDarkMode 
                  ? 'bg-customBlue/15 text-white border border-customBlue/10 shadow-inner' 
                  : 'bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-sm')
              : (isDarkMode 
                  ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Link className="w-4 h-4 text-customBlue" />
            <span>Mis Enlaces</span>
          </div>
          {activeView === 'enlaces' && <span className="w-1.5 h-1.5 rounded-full bg-customBlue"></span>}
        </button>
      </div>


      {/* Life Areas / Projects Sidebar Section */}
      <div className="flex flex-col mb-auto overflow-hidden">
        <div className="flex justify-between items-center mb-2 px-1">
          <p className={`text-[10px] font-bold tracking-wider transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>PROYECTOS ({tasks.filter(t => { const p = projects.find(proj => proj.id === t.projectId); return p && !p.archived; }).length})</p>
          <button 
            onClick={openNewProjectModal}
            className="text-gray-500 hover:text-white transition-colors"
            title="Añadir Proyecto"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-0.5 flex-1 pr-1 max-h-48 scrollbar-thin">
          {projects.filter(p => !p.archived).map((proj) => (
            <div 
              key={proj.id}
              onClick={() => { setSelectedProjectId(proj.id); setActiveView('kanban'); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                selectedProjectId === proj.id && activeView === 'kanban'
                  ? (isDarkMode ? 'bg-customBlue/15 text-white font-bold' : 'bg-customBlue/10 text-customBlue font-bold')
                  : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800')
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm select-none">{proj.emoji}</span>
                <span className="truncate">{proj.name}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Hover actions */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => copyProjectReport(proj.id)}
                    className="text-gray-500 hover:text-indigo-400 p-0.5"
                    title="Copiar Reporte de Proyecto"
                  >
                    <FileText className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditProjectModal(proj, e); }}
                    className="text-gray-500 hover:text-white p-0.5"
                    title="Editar Proyecto"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => archiveProject(proj.id, e)}
                    className="text-gray-500 hover:text-indigo-400 p-0.5"
                    title="Archivar Proyecto"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => deleteProject(proj.id, e)}
                    className="text-gray-500 hover:text-red-500 p-0.5"
                    title="Eliminar Proyecto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Badge */}
                <span 
                  className="text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 text-white"
                  style={{ backgroundColor: `${proj.color}22`, border: `1px solid ${proj.color}33`, color: proj.color }}
                >
                  {getCategoryCount(proj.id)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Collapsible Archived Projects Section */}
        {projects.some(p => p.archived) && (
          <div className={`mt-3 pt-2 border-t shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-200/60'}`}>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-colors ${
                isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5" />
                PROYECTOS ARCHIVADOS ({projects.filter(p => p.archived).length})
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showArchived ? 'rotate-180' : ''}`} />
            </button>

            {showArchived && (
              <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                {projects.filter(p => p.archived).map((proj) => (
                  <div 
                    key={proj.id}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs opacity-60 hover:opacity-90 transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm select-none">{proj.emoji}</span>
                      <span className="truncate line-through">{proj.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => unarchiveProject(proj.id, e)}
                        className="text-gray-500 hover:text-emerald-500 p-0.5"
                        title="Desarchivar Proyecto"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => deleteProject(proj.id, e)}
                        className="text-gray-500 hover:text-red-500 p-0.5"
                        title="Eliminar Proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enfoque Pomodoro */}
      <div className={`border rounded-xl p-4 mb-4 shadow-lg transition-all ${isDarkMode ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-slate-100 border-indigo-500/10'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold flex items-center gap-1 transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>⚡ Enfoque Diario</span>
          <button 
            onClick={toggleFocus}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all active:scale-95 ${
              focusActive ? 'bg-red-500 hover:bg-red-400' : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            {focusActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
        
        <div className={`text-xl font-black tracking-widest text-center my-1 font-mono transition-colors ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>
          {formatTimer(focusTimeLeft)}
        </div>

        <div className="flex justify-center gap-1.5 my-2">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => handleDurationChange(mins)}
              disabled={focusActive}
              className={`text-[9px] px-1.5 py-0.5 rounded font-black border transition-all ${
                focusDuration === mins
                  ? (isDarkMode ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-indigo-500/15 border-indigo-500 text-indigo-700')
                  : (isDarkMode ? 'bg-white/5 border-transparent text-gray-400 hover:text-white disabled:opacity-40' : 'bg-slate-200/50 border-transparent text-slate-500 hover:text-slate-800 disabled:opacity-40')
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="mt-2.5 border-t border-indigo-500/10 pt-2 text-[10px]">
          <label className={`font-semibold block mb-1 ${isDarkMode ? 'text-indigo-400/70' : 'text-indigo-600/70'}`}>Tarea enfocada:</label>
          <div className="relative">
            <select
              value={focusTaskId}
              onChange={(e) => setFocusTaskId(e.target.value)}
              className={`w-full border text-[9px] focus:outline-none cursor-pointer appearance-none rounded px-1.5 py-1 ${isDarkMode ? 'bg-slate-900 border-indigo-500/20 text-gray-300' : 'bg-white border-indigo-500/20 text-slate-700'}`}
            >
              <option value="">-- Ninguna --</option>
              {pendingFocusTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-indigo-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Backup Section */}
      <div className={`border rounded-xl p-3 mb-4 transition-all ${isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-slate-200/30 border-slate-200 shadow-sm'}`}>
        <p className={`text-[9px] font-bold tracking-wider mb-2 uppercase transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Copia de Seguridad</p>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border active:scale-95 transition-all ${
              isDarkMode 
                ? 'bg-[#090a0f] border-white/5 hover:border-white/10 text-gray-300 hover:text-white' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-customBlue" /> Exportar
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border active:scale-95 transition-all ${
              isDarkMode 
                ? 'bg-[#090a0f] border-white/5 hover:border-white/10 text-gray-300 hover:text-white' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 shadow-sm'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-customPink" /> Importar
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Theme switcher */}
      <div className="flex bg-white/5 p-1 rounded-lg">
        <button 
          onClick={() => setDarkMode(false)}
          className={`flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            !isDarkMode ? 'bg-white text-slate-800 shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sun className="w-3 h-3" /> Claro
        </button>
        <button 
          onClick={() => setDarkMode(true)}
          className={`flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
            isDarkMode ? 'bg-slate-800 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Moon className="w-3 h-3" /> Oscuro
        </button>
      </div>
    </div>
  );
}
