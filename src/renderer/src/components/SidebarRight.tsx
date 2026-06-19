import React from 'react';
import { 
  Check, 
  Plus, 
  Calendar,
  Edit2, 
  Trash2, 
  X, 
  Bold, 
  List, 
  Palette 
} from 'lucide-react';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
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

interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  archived?: boolean;
}

interface SidebarRightProps {
  isDarkMode: boolean;
  selectedDate: string;
  projects: Project[];
  dayTasks: Task[];
  rightSidebarTasks: Task[];
  activeTab: 'Todas' | 'Pendientes' | 'Listas';
  setActiveTab: (tab: 'Todas' | 'Pendientes' | 'Listas') => void;
  
  // Drawer visibility
  showTaskForm: boolean;
  setShowTaskForm: (val: boolean) => void;
  openAddTaskForm: () => void;
  openEditTaskForm: (task: Task) => void;
  
  // Task status operations
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Form fields
  editingTask: Task | null;
  taskFormTitle: string;
  setTaskFormTitle: (val: string) => void;
  taskFormProjectId: string;
  setTaskFormProjectId: (val: string) => void;
  taskFormStartDate: string;
  setTaskFormStartDate: (val: string) => void;
  taskFormEndDate: string;
  setTaskFormEndDate: (val: string) => void;
  taskFormStartTime: string;
  setTaskFormStartTime: (val: string) => void;
  taskFormEndTime: string;
  setTaskFormEndTime: (val: string) => void;
  taskFormStatus: 'pendiente' | 'en-curso' | 'bloqueada' | 'completada';
  setTaskFormStatus: (val: 'pendiente' | 'en-curso' | 'bloqueada' | 'completada') => void;
  
  // Tags/Subtasks form state
  taskFormTags: string[];
  setTaskFormTags: (tags: string[]) => void;
  taskFormSubtasks: SubTask[];
  setTaskFormSubtasks: (subtasks: SubTask[]) => void;
  subtaskInputText: string;
  setSubtaskInputText: (val: string) => void;
  newTagInputText: string;
  setNewTagInputText: (val: string) => void;
  showNewTagInput: boolean;
  setShowNewTagInput: (val: boolean) => void;
  availableTags: string[];
  
  // Helper handlers
  handleAddNewTag: () => void;
  handleAddSubtask: () => void;
  handleTaskSubmit: (e: React.FormEvent) => void;

  // Editor Command/Selection toolbar
  handleEditorCommand: (e: React.MouseEvent, command: string, value?: string) => void;
  showTextColorPicker: boolean;
  setShowTextColorPicker: (val: boolean) => void;
  showBgColorPicker: boolean;
  setShowBgColorPicker: (val: boolean) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  handleEditorKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleEditorInput: () => void;
}

export function SidebarRight({
  isDarkMode,
  selectedDate,
  projects,
  dayTasks,
  rightSidebarTasks,
  activeTab,
  setActiveTab,
  showTaskForm,
  setShowTaskForm,
  openAddTaskForm,
  openEditTaskForm,
  toggleTaskStatus,
  deleteTask,
  toggleSubtask,
  editingTask,
  taskFormTitle,
  setTaskFormTitle,
  taskFormProjectId,
  setTaskFormProjectId,
  taskFormStartDate,
  setTaskFormStartDate,
  taskFormEndDate,
  setTaskFormEndDate,
  taskFormStatus,
  setTaskFormStatus,
  taskFormTags,
  setTaskFormTags,
  taskFormSubtasks,
  setTaskFormSubtasks,
  subtaskInputText,
  setSubtaskInputText,
  newTagInputText,
  setNewTagInputText,
  showNewTagInput,
  setShowNewTagInput,
  availableTags,
  handleAddNewTag,
  handleAddSubtask,
  handleTaskSubmit,
  handleEditorCommand,
  showTextColorPicker,
  setShowTextColorPicker,
  showBgColorPicker,
  setShowBgColorPicker,
  editorRef,
  handleEditorKeyDown,
  handleEditorInput
}: SidebarRightProps) {

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [, mm, dd] = parts;
    const monthIdx = parseInt(mm, 10) - 1;
    return `${parseInt(dd, 10)} ${months[monthIdx] || ''}`;
  };

  const formatTaskDates = (start: string, end: string) => {
    const s = start || end;
    const e = end || start || s;
    if (!s) return 'Todo el día 📅';
    if (s === e) return formatShortDate(s);
    return `${formatShortDate(s)} - ${formatShortDate(e)}`;
  };

  return (
    <div className={`w-96 border-l flex flex-col p-6 shrink-0 relative transition-colors ${isDarkMode ? 'bg-[#090a0f] border-l-white/5' : 'bg-white border-l-slate-200'}`}>
      
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className={`text-base font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tareas del Día</h3>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
            {selectedDate}
          </p>
        </div>
        
        <button 
          onClick={openAddTaskForm}
          className="w-8 h-8 rounded-full bg-customBlue hover:bg-customBlue/90 flex items-center justify-center text-white active:scale-95 shadow-md shadow-customBlue/25 transition-all"
          title="Añadir Tarea"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs header */}
      <div className={`flex border-b text-xs font-bold mb-5 transition-colors ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-slate-200 text-slate-500'}`}>
        <button 
          onClick={() => setActiveTab('Todas')}
          className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'Todas' ? `border-customBlue ${isDarkMode ? 'text-white' : 'text-slate-800'}` : `border-transparent ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-slate-600'}`
          }`}
        >
          Todas <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>{dayTasks.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('Pendientes')}
          className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'Pendientes' ? `border-customBlue ${isDarkMode ? 'text-white' : 'text-slate-800'}` : `border-transparent ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-slate-600'}`
          }`}
        >
          Pendientes <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>{dayTasks.filter(t => t.status !== 'completada').length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('Listas')}
          className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'Listas' ? `border-customBlue ${isDarkMode ? 'text-white' : 'text-slate-800'}` : `border-transparent ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-slate-600'}`
          }`}
        >
          Completas <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'}`}>{dayTasks.filter(t => t.status === 'completada').length}</span>
        </button>
      </div>

      {/* Task list Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {rightSidebarTasks.map((task) => {
          const proj = projects.find(p => p.id === task.projectId);
          const color = proj?.color || '#737373';
          const isCompleted = task.status === 'completada';
          
          return (
            <div 
              key={task.id}
              className={`border rounded-xl p-4 flex items-start gap-3.5 transition-all ${
                isDarkMode 
                  ? 'bg-[#121420] border-white/5 hover:border-white/10' 
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-sm'
              } ${isCompleted ? 'opacity-50' : ''}`}
            >
              <button 
                onClick={() => toggleTaskStatus(task.id)}
                className={`mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border transition-all ${
                  isCompleted 
                    ? 'bg-customBlue border-customBlue text-white' 
                    : `hover:border-customBlue ${isDarkMode ? 'border-gray-500' : 'border-slate-400'}`
                }`}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 font-bold" />}
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-extrabold leading-tight mb-1 transition-colors ${
                  isCompleted 
                    ? (isDarkMode ? 'line-through text-gray-500' : 'line-through text-slate-400') 
                    : (isDarkMode ? 'text-white' : 'text-slate-800')
                }`}>
                  {task.title}
                </h4>
                
                {/* Tags list */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 mb-1.5">
                    {task.tags.map(t => (
                      <span 
                        key={t}
                        className="text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider"
                        style={{
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          color: isDarkMode ? '#a1a1aa' : '#475569'
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Subtask checklist */}
                {task.subtasks && task.subtasks.length > 0 && (() => {
                  const total = task.subtasks.length;
                  const completed = task.subtasks.filter(st => st.completed).length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div className="mt-2 space-y-1">
                      <div className="space-y-0.5">
                        {task.subtasks.map(st => (
                          <label 
                            key={st.id} 
                            className="flex items-center gap-1.5 cursor-pointer text-[9px] select-none"
                          >
                            <input 
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => toggleSubtask(task.id, st.id)}
                              className="w-2.5 h-2.5 rounded border-gray-400 text-emerald-500 focus:ring-emerald-500 bg-transparent"
                            />
                            <span className={`truncate flex-1 ${st.completed ? 'line-through text-gray-500' : (isDarkMode ? 'text-gray-300' : 'text-slate-600')}`}>
                              {st.title}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 mt-1">
                        <span>{completed}/{total} Subtareas</span>
                        <span>{pct}%</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-dashed border-gray-500/10">
                  <span className="text-[8px] font-black tracking-wider uppercase" style={{ color: color }}>
                    {proj?.emoji} {proj?.name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                  <div className={`flex items-center gap-1 text-[9px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                    <Calendar className={`w-2.5 h-2.5 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                    <span>{formatTaskDates(task.startDate, task.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={() => openEditTaskForm(task)}
                  className={`p-0.5 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className={`p-0.5 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {rightSidebarTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-xs font-bold uppercase tracking-wider">
            No hay tareas en esta sección
          </div>
        )}
      </div>

      {/* Add / Edit Task Slide-over Panel */}
      {showTaskForm && (
        <div className={`absolute inset-0 p-5 flex flex-col z-40 border-l overflow-hidden transition-colors ${isDarkMode ? 'bg-[#090a0f] border-l-white/5' : 'bg-white border-l-slate-200'}`}>
          {/* Drawer Header (pinned) */}
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h4 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {editingTask ? 'Editar Actividad' : 'Nueva Actividad'}
            </h4>
            <button 
              onClick={() => setShowTaskForm(false)} 
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body Container */}
          <form onSubmit={handleTaskSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
            {/* Scrollable Fields Wrapper */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4 scrollbar-thin">
              {/* Title */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Título de la actividad</label>
                <input 
                  type="text" 
                  placeholder="Escribir tarea..."
                  value={taskFormTitle}
                  onChange={(e) => setTaskFormTitle(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all ${isDarkMode ? 'bg-[#121420] border-white/5 text-white placeholder-gray-500 focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-customBlue/50'}`}
                />
              </div>

              {/* Project Selector */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Proyecto Asignado</label>
                <select
                  value={taskFormProjectId}
                  onChange={(e) => setTaskFormProjectId(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer ${isDarkMode ? 'bg-[#121420] border-white/5 text-white focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-customBlue/50'}`}
                >
                  {projects.filter(p => !p.archived).map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.emoji} {proj.name}</option>
                  ))}
                </select>
              </div>

              {/* Dates range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Fecha Inicio</label>
                  <input 
                    type="date" 
                    value={taskFormStartDate}
                    onChange={(e) => setTaskFormStartDate(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${isDarkMode ? 'bg-[#121420] border-white/5 text-white focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-customBlue/50'}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Fecha Fin</label>
                  <input 
                    type="date" 
                    value={taskFormEndDate}
                    onChange={(e) => setTaskFormEndDate(e.target.value)}
                    required
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${isDarkMode ? 'bg-[#121420] border-white/5 text-white focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-customBlue/50'}`}
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Estado de la Actividad</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['pendiente', 'en-curso', 'bloqueada', 'completada'] as const).map((stat) => (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => setTaskFormStatus(stat)}
                      className={`py-1.5 rounded-lg text-[9px] font-bold border transition-colors ${
                        taskFormStatus === stat 
                          ? (isDarkMode ? 'bg-customBlue/15 border-customBlue text-white' : 'bg-customBlue/10 border-customBlue text-customBlue font-bold') 
                          : (isDarkMode ? 'bg-[#121420] border-white/5 text-gray-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700')
                      }`}
                    >
                      {stat === 'pendiente' ? 'Pendiente' :
                       stat === 'en-curso' ? 'En Curso' :
                       stat === 'bloqueada' ? 'Bloqueada' : 'Completa'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time range input removed (hidden) */}

              {/* Tags Selector */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Etiquetas</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {availableTags.map(tag => {
                    const isSelected = taskFormTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTaskFormTags(taskFormTags.filter(t => t !== tag));
                          } else {
                            setTaskFormTags([...taskFormTags, tag]);
                          }
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? (isDarkMode ? 'bg-customBlue/20 border-customBlue text-white' : 'bg-customBlue/15 border-customBlue text-customBlue')
                            : (isDarkMode ? 'bg-[#121420]/50 border-white/5 text-gray-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  
                  {!showNewTagInput ? (
                    <button
                      type="button"
                      onClick={() => setShowNewTagInput(true)}
                      className={`px-2.5 py-1 rounded text-[10px] font-extrabold border border-dashed transition-colors flex items-center gap-1 ${
                        isDarkMode ? 'border-white/10 text-gray-400 hover:text-white hover:border-white/20' : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Plus className="w-3 h-3" /> Nueva
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Tag..."
                        value={newTagInputText}
                        onChange={(e) => setNewTagInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewTag();
                          }
                        }}
                        className={`border rounded px-1.5 py-0.5 text-[10px] focus:outline-none w-20 ${
                          isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewTag}
                        className="text-emerald-500 hover:text-emerald-400 p-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTagInput(false);
                          setNewTagInputText('');
                        }}
                        className="text-red-500 hover:text-red-400 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtasks / Checklist */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Subtareas</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nueva subtarea..."
                    value={subtaskInputText}
                    onChange={(e) => setSubtaskInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none transition-all ${
                      isDarkMode ? 'bg-[#121420] border-white/5 text-white placeholder-gray-500 focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-customBlue/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className={`px-3 rounded-xl border flex items-center justify-center transition-all ${
                      isDarkMode ? 'bg-indigo-950/40 border-indigo-500/25 text-indigo-400 hover:bg-[#121420]' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {taskFormSubtasks.length > 0 && (
                  <div className={`border rounded-xl p-2.5 space-y-2 max-h-40 overflow-y-auto ${
                    isDarkMode ? 'bg-[#121420]/40 border-white/5' : 'bg-slate-50/50 border-slate-200'
                  }`}>
                    {taskFormSubtasks.map((st, idx) => (
                      <div key={st.id || idx} className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => {
                              const updated = taskFormSubtasks.map((item, i) =>
                                i === idx ? { ...item, completed: !item.completed } : item
                              );
                              setTaskFormSubtasks(updated);
                            }}
                            className={`rounded border-gray-400 text-customBlue focus:ring-customBlue ${
                              isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-300'
                            }`}
                          />
                          <span className={`text-xs truncate ${st.completed ? 'line-through text-gray-500' : (isDarkMode ? 'text-gray-300' : 'text-slate-700')}`}>
                            {st.title}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskFormSubtasks(taskFormSubtasks.filter((_, i) => i !== idx));
                          }}
                          className="text-gray-500 hover:text-red-500 p-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rich Text Editor for Description */}
              <div className="space-y-1.5 flex flex-col h-48">
                <label className={`text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Descripción Enriquecida</label>
                
                {/* Editor Toolbar */}
                <div className={`border rounded-t-xl px-3 py-2 flex items-center gap-2.5 shrink-0 select-none transition-colors ${isDarkMode ? 'bg-[#171a2b] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                  <button 
                    type="button"
                    onMouseDown={(e) => handleEditorCommand(e, 'bold')}
                    className={`p-1 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}
                    title="Negrita"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onMouseDown={(e) => handleEditorCommand(e, 'insertUnorderedList')}
                    className={`p-1 rounded transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}
                    title="Lista con viñetas"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Text Color selection dropdown trigger */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => { setShowTextColorPicker(!showTextColorPicker); setShowBgColorPicker(false); }}
                      className={`p-1 rounded flex items-center gap-0.5 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}
                      title="Color de Texto"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold">A</span>
                    </button>

                    {showTextColorPicker && (
                      <div className={`absolute top-7 left-0 border rounded-lg p-2 flex gap-1.5 z-50 shadow-lg ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                        {['#ffffff', '#0088ff', '#ff3366', '#ffaa00', '#00cc66'].map(col => (
                          <button 
                            key={col}
                            type="button"
                            onMouseDown={(e) => handleEditorCommand(e, 'foreColor', col)}
                            className={`w-4 h-4 rounded-full border hover:scale-110 transition-transform ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* BG Color selection (Highlighter) */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowTextColorPicker(false); }}
                      className={`p-1 rounded flex items-center gap-0.5 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'}`}
                      title="Resaltado"
                    >
                      <Palette className="w-3.5 h-3.5 text-customOrange" />
                      <span className="text-[8px] font-bold">Resaltar</span>
                    </button>

                    {showBgColorPicker && (
                      <div className={`absolute top-7 left-0 border rounded-lg p-2 flex gap-1.5 z-50 shadow-lg ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                        {['transparent', '#0088ff44', '#ff336644', '#ffaa0044', '#00cc6644'].map(col => (
                          <button 
                            key={col}
                            type="button"
                            onMouseDown={(e) => handleEditorCommand(e, 'backColor', col)}
                            className={`w-4 h-4 rounded-full border hover:scale-110 transition-transform flex items-center justify-center text-[8px] ${isDarkMode ? 'border-white/10 text-gray-400' : 'border-slate-200 text-slate-500'}`}
                            style={{ backgroundColor: col === 'transparent' ? (isDarkMode ? '#1c1c1c' : '#f1f5f9') : col }}
                          >
                            {col === 'transparent' && '❌'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editable Area */}
                <div 
                  ref={editorRef}
                  contentEditable
                  onKeyDown={handleEditorKeyDown}
                  onInput={handleEditorInput}
                  data-placeholder="Escribe una descripción enriquecida de la actividad (selecciona texto para aplicar negritas o colores)..."
                  className={`editor-content border-x border-b rounded-b-xl px-4 py-3 text-xs overflow-y-auto flex-1 focus:outline-none transition-all ${isDarkMode ? 'bg-[#121420] border-x-white/5 border-b-white/5 text-white focus:border-customBlue/35' : 'bg-white border-slate-200 text-slate-800 focus:border-customBlue/50'}`}
                />
              </div>
            </div>

            {/* Save Button (pinned at bottom) */}
            <div className={`pt-3 border-t shrink-0 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
              <button 
                type="submit"
                className="w-full bg-customBlue hover:bg-customBlue/90 text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-customBlue/25 transition-transform active:scale-[0.98]"
              >
                {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Right Sidebar Footer */}
      <div className={`mt-5 pt-3 border-t flex justify-between items-center text-[9px] font-bold tracking-wider transition-colors ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-slate-200 text-slate-400'}`}>
        <span>SPRINT PERSONAL</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow shadow-emerald-400/50"></span>
          ALMACENADO LOCAL
        </span>
      </div>
    </div>
  );
}
