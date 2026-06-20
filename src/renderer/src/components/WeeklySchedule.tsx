import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useTodoStore, Task } from '../store/useTodoStore';

interface CalendarDay {
  name: string;
  num: number;
  dateStr: string;
}

interface WeeklyScheduleProps {
  searchFilter: (task: Task) => boolean;
  onEditTask: (task: Task) => void;
}

export function WeeklySchedule({
  searchFilter,
  onEditTask
}: WeeklyScheduleProps) {
  const isDarkMode = useTodoStore((state) => state.isDarkMode);
  const selectedDate = useTodoStore((state) => state.selectedDate);
  const setSelectedDate = useTodoStore((state) => state.setSelectedDate);
  const tasks = useTodoStore((state) => state.tasks);
  const projects = useTodoStore((state) => state.projects);

  const [selectedFilterProjId, setSelectedFilterProjId] = useState<string | null>(null);

  // Calendar months helper
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const statusColors = {
    'pendiente': {
      border: '#94a3b8',       // slate-400
      bgDark: 'rgba(148, 163, 184, 0.12)',
      bgLight: 'rgba(148, 163, 184, 0.08)'
    },
    'en-curso': {
      border: '#3b82f6',       // blue-500
      bgDark: 'rgba(59, 130, 246, 0.12)',
      bgLight: 'rgba(59, 130, 246, 0.08)'
    },
    'bloqueada': {
      border: '#ef4444',       // red-500
      bgDark: 'rgba(239, 68, 68, 0.12)',
      bgLight: 'rgba(239, 68, 68, 0.08)'
    },
    'completada': {
      border: '#10b981',       // emerald-500
      bgDark: 'rgba(16, 185, 129, 0.12)',
      bgLight: 'rgba(16, 185, 129, 0.08)'
    }
  };

  // Calculate the 7 days of the week containing the selected date (starting on Saturday to fit mock data dates)
  const getWeekDays = (baseDateStr: string): CalendarDay[] => {
    try {
      const baseDate = new Date(baseDateStr + 'T00:00:00');
      if (isNaN(baseDate.getTime())) {
        return getWeekDays('2026-06-17');
      }
      const day = baseDate.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
      const diffToSaturday = (day + 1) % 7;
      
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() - diffToSaturday);
      
      return Array.from({ length: 7 }).map((_, i) => {
        const current = new Date(startOfWeek);
        current.setDate(startOfWeek.getDate() + i);
        
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        const rawName = current.toLocaleDateString('es-ES', { weekday: 'short' });
        let name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        if (name.endsWith('.')) name = name.slice(0, -1);
        name = name.slice(0, 3);
        
        return {
          name,
          num: current.getDate(),
          dateStr
        };
      });
    } catch (e) {
      return [
        { name: 'Sáb', num: 13, dateStr: '2026-06-13' },
        { name: 'Dom', num: 14, dateStr: '2026-06-14' },
        { name: 'Lun', num: 15, dateStr: '2026-06-15' },
        { name: 'Mar', num: 16, dateStr: '2026-06-16' },
        { name: 'Mié', num: 17, dateStr: '2026-06-17' },
        { name: 'Jue', num: 18, dateStr: '2026-06-18' },
        { name: 'Vie', num: 19, dateStr: '2026-06-19' }
      ];
    }
  };

  const weekDays = getWeekDays(selectedDate);
  const weekStart = weekDays[0].dateStr;
  const weekEnd = weekDays[6].dateStr;

  // Filter tasks that overlap with the current week date range
  const weekTasks = tasks.filter(t => {
    const proj = projects.find(p => p.id === t.projectId);
    const isArchived = proj?.archived || false;
    const matchesSearch = searchFilter(t);
    const start = t.startDate || t.endDate;
    const end = t.endDate || t.startDate || start;
    if (!start) return false;
    
    const overlaps = start <= weekEnd && end >= weekStart;
    const matchesProject = selectedFilterProjId === null || t.projectId === selectedFilterProjId;
    return overlaps && !isArchived && matchesSearch && matchesProject;
  });

  // Sort tasks by startDate to achieve a clean staircase visual flow
  weekTasks.sort((a, b) => {
    const startA = a.startDate || a.endDate;
    const startB = b.startDate || b.endDate;
    return startA.localeCompare(startB);
  });

  // Calculate position details for horizontal Gantt bars
  const getHorizontalMetrics = (startDate: string, endDate: string) => {
    const start = startDate || endDate;
    const end = endDate || startDate || start;

    const taskStartClamped = start < weekStart ? weekStart : start;
    const taskEndClamped = end > weekEnd ? weekEnd : end;

    const foundStart = weekDays.findIndex(d => d.dateStr === taskStartClamped);
    const startIdx = foundStart !== -1 ? foundStart : 0;

    const foundEnd = weekDays.findIndex(d => d.dateStr === taskEndClamped);
    const endIdx = foundEnd !== -1 ? foundEnd : 6;

    const leftPercent = (startIdx / 7) * 100;
    const widthPercent = ((endIdx - startIdx + 1) / 7) * 100;

    return {
      left: `calc(${leftPercent}% + 6px)`,
      width: `calc(${widthPercent}% - 12px)`
    };
  };

  const getShortDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const [, mm, dd] = dateStr.split('-');
    const monthName = months[parseInt(mm, 10) - 1] || '';
    return `${parseInt(dd, 10)} ${monthName}`;
  };

  const getTaskDateRangeLabel = (start: string, end: string) => {
    const s = start || end;
    const e = end || start || s;
    if (!s) return '';
    if (s === e) return getShortDateLabel(s);
    return `${getShortDateLabel(s)} - ${getShortDateLabel(e)}`;
  };

  // Get simulated today string
  const getTodayDateStr = () => {
    const baseYear = new Date(selectedDate).getFullYear();
    if (baseYear === 2026) {
      return '2026-06-17';
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getTodayDateStr();
  const todayIndex = weekDays.findIndex(d => d.dateStr === todayStr);

  return (
    <div className={`flex flex-col border rounded-2xl overflow-hidden transition-colors ${
      isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Project Filter Pills */}
      <div className={`px-4 py-2 border-b flex flex-wrap gap-1.5 items-center select-none transition-colors ${
        isDarkMode ? 'border-white/5 bg-[#141624]' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <span className={`text-[9px] font-black uppercase tracking-wider mr-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
          Filtrar Proyecto:
        </span>
        <button
          onClick={() => setSelectedFilterProjId(null)}
          className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
            selectedFilterProjId === null
              ? 'bg-customBlue border-customBlue text-white shadow-sm font-blackScale'
              : (isDarkMode ? 'bg-transparent border-white/5 text-gray-400 hover:text-white hover:border-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')
          }`}
        >
          Todos
        </button>
        {projects.filter(p => !p.archived).map(proj => {
          const isSelected = selectedFilterProjId === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedFilterProjId(proj.id)}
              className="px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 transition-all"
              style={{
                backgroundColor: isSelected ? proj.color : 'transparent',
                borderColor: isSelected ? proj.color : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'),
                color: isSelected ? '#ffffff' : (isDarkMode ? '#a1a1aa' : '#475569')
              }}
            >
              <span>{proj.emoji}</span>
              <span>{proj.name}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Header Calendar Days (7 columns) */}
      <div className={`grid grid-cols-7 border-b select-none transition-colors ${
        isDarkMode ? 'border-white/5 bg-[#161827]' : 'border-slate-200 bg-slate-50'
      }`}>
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          const isToday = day.dateStr === todayStr;

          return (
            <div
              key={day.dateStr}
              onClick={() => {
                setSelectedDate(day.dateStr);
              }}
              className={`py-3 flex flex-col items-center justify-center cursor-pointer transition-all first:border-l-0 border-l relative ${
                isDarkMode ? 'border-white/5' : 'border-slate-200'
              } ${
                isSelected 
                  ? (isDarkMode ? 'bg-customBlue/10 text-white' : 'bg-customBlue/5 text-customBlue')
                  : (isDarkMode ? 'hover:bg-white/[0.02] text-gray-400' : 'hover:bg-slate-100/50 text-slate-600')
              }`}
            >
              {isToday && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-customBlue animate-pulse" />
              )}
              <span className={`text-[10px] font-bold tracking-wider uppercase ${
                isSelected ? 'text-customBlue font-black' : (isDarkMode ? 'text-gray-500' : 'text-slate-400')
              }`}>
                {day.name}
              </span>
              <span className={`text-sm mt-0.5 font-bold transition-all ${
                isSelected 
                  ? 'text-customBlue text-base font-blackScale scale-105' 
                  : (isDarkMode ? 'text-gray-300' : 'text-slate-700')
              }`}>
                {day.num}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Timeline Grid Container (Staircase/Cascading Rows) */}
      <div className="relative overflow-y-auto max-h-[420px] scrollbar-thin">
        {/* Vertical Column Grid Line Background */}
        <div className="absolute inset-0 pointer-events-none flex">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 border-r last:border-r-0`}
              style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
            />
          ))}
        </div>

        {/* Current Day vertical line backdrop (crosses all rows) */}
        {todayIndex !== -1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(todayIndex / 7) * 100}%`,
              width: `${100 / 7}%`,
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <div 
              className="h-full w-[2px] bg-customBlue/20 dark:bg-customBlue/15 mx-auto"
            />
          </div>
        )}

        {/* Task Rows */}
        <div className="flex flex-col relative py-2 divide-y divide-gray-100/50 dark:divide-white/5 z-10">
          {weekTasks.map((task) => {
            const proj = projects.find(p => p.id === task.projectId);
            const emoji = proj?.emoji || '📋';
            const pos = getHorizontalMetrics(task.startDate, task.endDate);
            const isCompleted = task.status === 'completada';
            const isOverdue = !isCompleted && task.endDate && task.endDate < todayStr;
            const isBlocked = task.status === 'bloqueada';
            const statusConf = statusColors[task.status] || statusColors['pendiente'];

            return (
              <div 
                key={task.id} 
                className="relative w-full h-[52px] flex items-center transition-colors hover:bg-gray-500/[0.01]"
              >
                {/* Horizontal Gantt task bar block */}
                <div
                  onClick={() => onEditTask(task)}
                  style={{
                    position: 'absolute',
                    left: pos.left,
                    width: pos.width,
                    backgroundColor: isBlocked 
                      ? (isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)') 
                      : (isDarkMode ? statusConf.bgDark : statusConf.bgLight),
                    borderColor: isBlocked ? 'rgba(239, 68, 68, 0.3)' : `${statusConf.border}40`,
                    borderLeft: `3.5px solid ${isBlocked ? '#ef4444' : statusConf.border}`,
                    zIndex: 10
                  }}
                  className={`border rounded-xl px-3 py-1.5 h-[40px] flex items-center justify-between cursor-pointer select-none transition-all hover:scale-[1.01] hover:shadow-md group relative ${
                    isCompleted ? 'opacity-60' : ''
                  } ${
                    isBlocked 
                      ? (isDarkMode ? 'shadow-glow shadow-red-500/5' : 'shadow-sm')
                      : ''
                  }`}
                >
                  {/* Left part: project emoji + task title */}
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                    <span className="text-[10px] filter saturate-150 shrink-0">{emoji}</span>
                    <span 
                      className={`text-xs font-extrabold truncate leading-tight transition-colors ${
                        isBlocked 
                          ? 'text-red-400 dark:text-red-300' 
                          : (isDarkMode ? 'text-gray-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900')
                      } ${isCompleted ? 'line-through text-gray-500' : ''}`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Right part: Subtasks & formatted dates */}
                  <div className="flex items-center gap-2.5 shrink-0 text-[8px] font-bold text-gray-500 select-none">
                    {/* Subtasks Count indicator */}
                    {task.subtasks && task.subtasks.length > 0 && (() => {
                      const total = task.subtasks.length;
                      const completed = task.subtasks.filter(st => st.completed).length;
                      return (
                        <span 
                          className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          ✓ {completed}/{total}
                        </span>
                      );
                    })()}

                    {/* Overdue alert badge */}
                    {isOverdue && (
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse uppercase tracking-wider text-[7.5px] font-black shrink-0">
                        🚨 Retrasada
                      </span>
                    )}
                    
                    {/* Date label */}
                    <span 
                      className="px-1.5 py-0.5 rounded border tracking-wider"
                      style={{
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        color: isDarkMode ? '#8e9aa8' : '#64748b'
                      }}
                    >
                      {getTaskDateRangeLabel(task.startDate, task.endDate)}
                    </span>

                    {/* Status checkbox indicator */}
                    {isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">✓</span>
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center text-[8px] shrink-0`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {weekTasks.length === 0 && (
            <div className={`text-center py-16 text-xs font-bold uppercase tracking-wider transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-slate-400'
            }`}>
              <div className="flex flex-col items-center justify-center gap-2.5">
                <Calendar className="w-6 h-6 text-gray-500/50" />
                <span>Sin actividades agendadas para esta semana</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
