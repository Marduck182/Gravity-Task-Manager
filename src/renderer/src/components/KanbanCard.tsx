import React from 'react';
import { Edit2 } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';

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
  statusChangedAt?: string;
}

interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  archived?: boolean;
}

interface KanbanCardProps {
  task: Task;
  projects: Project[];
  isDarkMode: boolean;
  accentColor: string;
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDropOnTask: (e: React.DragEvent, id: string) => void;
  openEditTaskForm: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

const getLocalTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getDaysSinceStatusChange = (statusChangedAt?: string, id?: string) => {
  try {
    const todayStr = getLocalTodayStr();
    let dateStr = statusChangedAt;
    if (!dateStr && id && id.startsWith('t-')) {
      const timestamp = parseInt(id.split('-')[1], 10);
      if (!isNaN(timestamp)) {
        dateStr = new Date(timestamp).toISOString().split('T')[0];
      }
    }
    if (!dateStr) return 0;
    const changedDate = new Date(dateStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = todayDate.getTime() - changedDate.getTime();
    if (diffTime <= 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

const isOverdue = (task: Task) => {
  if (task.status === 'completada' || !task.endDate) return false;
  return task.endDate < getLocalTodayStr();
};

export function KanbanCard({
  task,
  projects,
  isDarkMode,
  accentColor,
  handleDragStart,
  handleDragOver,
  handleDropOnTask,
  openEditTaskForm,
  toggleSubtask
}: KanbanCardProps) {
  const proj = projects.find(p => p.id === task.projectId);
  const totalSub = task.subtasks ? task.subtasks.length : 0;
  const completedSub = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const pct = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
  
  const setSearchQuery = useTodoStore((state) => state.setSearchQuery);

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [, mm, dd] = parts;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIdx = parseInt(mm, 10) - 1;
    return `${parseInt(dd, 10)} ${months[monthIdx] || ''}`;
  };

  const getTaskDateLabel = () => {
    const s = task.startDate || task.endDate;
    const e = task.endDate || task.startDate || s;
    if (!s) return 'Todo el día';
    if (s === e) return formatShortDate(s);
    return `${formatShortDate(s)} - ${formatShortDate(e)}`;
  };

  const daysStagnant = getDaysSinceStatusChange(task.statusChangedAt, task.id);
  const taskOverdue = isOverdue(task);

  return (
    <div 
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDropOnTask(e, task.id)}
      onClick={() => openEditTaskForm(task)}
      className={`border-l-[3px] p-2.5 rounded-lg flex flex-col justify-between active:scale-[0.98] cursor-grab transition-all ${
        task.status === 'bloqueada'
          ? (isDarkMode 
              ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50 shadow-glow shadow-red-500/5 hover:shadow-lg' 
              : 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md')
          : (isDarkMode 
              ? 'bg-[#1b1d30]/60 border-white/5 hover:shadow-lg' 
              : 'bg-white border-slate-200/80 hover:shadow-md')
      }`}
      style={{ 
        borderLeftColor: task.status === 'bloqueada' ? '#ef4444' : accentColor,
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <h4 className={`text-[11px] font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-slate-800'} ${task.status === 'bloqueada' ? 'text-red-400 dark:text-red-300' : ''}`}>{task.title}</h4>
        <button onClick={(e) => { e.stopPropagation(); openEditTaskForm(task); }} className={`shrink-0 transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
          <Edit2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Alert badges for Stagnant/Overdue */}
      {task.status !== 'completada' && (taskOverdue || daysStagnant >= 3) && (
        <div className="flex flex-wrap gap-1 mt-0.5 mb-1.5 select-none" onClick={(e) => e.stopPropagation()}>
          {taskOverdue && (
            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-500 uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
              🚨 Retrasada
            </span>
          )}
          {daysStagnant >= 3 && (
            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-500 uppercase tracking-wider flex items-center gap-0.5">
              ⚠️ Inactiva {daysStagnant}d
            </span>
          )}
        </div>
      )}

      {/* Tags list */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 mb-1.5">
          {task.tags.map(t => (
            <span 
              key={t}
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery(t);
              }}
              className="text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider cursor-pointer transition-all"
              style={{
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                color: isDarkMode ? '#a1a1aa' : '#475569'
              }}
              title={`Filtrar por etiqueta: ${t}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Subtask checklist */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
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
          {/* Progress bar */}
          <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 mt-1">
            <span>{completedSub}/{totalSub} Subtareas</span>
            <span>{pct}%</span>
          </div>
          <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-dashed border-gray-500/10">
        <span 
          className="text-[8px] px-1 py-0.5 rounded font-black tracking-wider uppercase"
          style={{ backgroundColor: `${proj?.color}15`, color: proj?.color }}
        >
          {proj?.emoji} {proj?.name}
        </span>
        <span className={`text-[8px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{getTaskDateLabel()}</span>
      </div>
    </div>
  );
}
