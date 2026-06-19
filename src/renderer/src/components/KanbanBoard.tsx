import React from 'react';
import { X } from 'lucide-react';
import { KanbanCard } from './KanbanCard';

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

interface KanbanBoardProps {
  isDarkMode: boolean;
  selectedDate: string;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: Project[];
  dayTasks: Task[];
  searchFilter: (task: Task) => boolean;
  
  // Drag-and-drop & card actions
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, status: 'pendiente' | 'en-curso' | 'bloqueada' | 'completada') => void;
  handleDropOnTask: (e: React.DragEvent, targetId: string) => void;
  openEditTaskForm: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function KanbanBoard({
  isDarkMode,
  selectedDate,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  dayTasks,
  searchFilter,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDropOnTask,
  openEditTaskForm,
  toggleSubtask
}: KanbanBoardProps) {
  const filterByProject = (t: Task) => !selectedProjectId || t.projectId === selectedProjectId;

  return (
    <div className="p-6 flex-1 flex flex-col min-h-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tablero Kanban ({selectedDate})</h3>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Arrastra y suelta tareas para cambiar su estado para esta fecha</p>
        </div>
        {selectedProjectId && (
          <button
            onClick={() => setSelectedProjectId(null)}
            className={`text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all border ${isDarkMode ? 'bg-customBlue/15 border-customBlue/20 text-customBlue hover:bg-customBlue/25' : 'bg-customBlue/10 border-customBlue/20 text-customBlue hover:bg-customBlue/20 shadow-sm'}`}
          >
            <span>Filtro: {projects.find(p => p.id === selectedProjectId)?.emoji} {projects.find(p => p.id === selectedProjectId)?.name}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-4 gap-3 min-h-0">
        {/* PENDIENTES COLUMN */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'pendiente')}
          className={`border rounded-xl p-3 flex flex-col min-h-0 transition-colors ${
            isDarkMode ? 'bg-[#121420] border-white/5 hover:bg-[#151725]' : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-2 h-2 rounded-full bg-customPink"></span>
              Pendientes
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-slate-200 text-slate-600'}`}>
              {dayTasks.filter(t => t.status === 'pendiente' && searchFilter(t) && filterByProject(t)).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {dayTasks.filter(t => t.status === 'pendiente' && searchFilter(t) && filterByProject(t)).map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                projects={projects}
                isDarkMode={isDarkMode}
                accentColor="#ff3366"
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDropOnTask={handleDropOnTask}
                openEditTaskForm={openEditTaskForm}
                toggleSubtask={toggleSubtask}
              />
            ))}
          </div>
        </div>

        {/* EN CURSO COLUMN */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'en-curso')}
          className={`border rounded-xl p-3 flex flex-col min-h-0 transition-colors ${
            isDarkMode ? 'bg-[#121420] border-white/5 hover:bg-[#151725]' : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-2 h-2 rounded-full bg-customBlue"></span>
              En Curso
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-slate-200 text-slate-600'}`}>
              {dayTasks.filter(t => t.status === 'en-curso' && searchFilter(t) && filterByProject(t)).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {dayTasks.filter(t => t.status === 'en-curso' && searchFilter(t) && filterByProject(t)).map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                projects={projects}
                isDarkMode={isDarkMode}
                accentColor="#0088ff"
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDropOnTask={handleDropOnTask}
                openEditTaskForm={openEditTaskForm}
                toggleSubtask={toggleSubtask}
              />
            ))}
          </div>
        </div>

        {/* BLOQUEADAS COLUMN */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'bloqueada')}
          className={`border rounded-xl p-3 flex flex-col min-h-0 transition-colors ${
            isDarkMode ? 'bg-[#121420] border-white/5 hover:bg-[#151725]' : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-glow shadow-red-500/50 animate-pulse"></span>
              Bloqueadas
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-slate-200 text-slate-600'}`}>
              {dayTasks.filter(t => t.status === 'bloqueada' && searchFilter(t) && filterByProject(t)).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {dayTasks.filter(t => t.status === 'bloqueada' && searchFilter(t) && filterByProject(t)).map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                projects={projects}
                isDarkMode={isDarkMode}
                accentColor="#ef4444"
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDropOnTask={handleDropOnTask}
                openEditTaskForm={openEditTaskForm}
                toggleSubtask={toggleSubtask}
              />
            ))}
          </div>
        </div>

        {/* COMPLETADO COLUMN */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'completada')}
          className={`border rounded-xl p-3 flex flex-col min-h-0 transition-colors ${
            isDarkMode ? 'bg-[#121420] border-white/5 hover:bg-[#151725]' : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className="w-2 h-2 rounded-full bg-customGreen"></span>
              Completadas
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-slate-200 text-slate-600'}`}>
              {dayTasks.filter(t => t.status === 'completada' && searchFilter(t) && filterByProject(t)).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {dayTasks.filter(t => t.status === 'completada' && searchFilter(t) && filterByProject(t)).map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                projects={projects}
                isDarkMode={isDarkMode}
                accentColor="#00cc66"
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDropOnTask={handleDropOnTask}
                openEditTaskForm={openEditTaskForm}
                toggleSubtask={toggleSubtask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
