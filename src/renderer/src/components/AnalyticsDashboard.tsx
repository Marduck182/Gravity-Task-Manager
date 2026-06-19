
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
  subtasks?: any[];
  tags?: string[];
}

interface PomodoroLog {
  id: string;
  date: string;
  duration: number;
  taskId?: string;
}

interface CalendarDay {
  name: string;
  num: number;
  dateStr: string;
}

interface AnalyticsDashboardProps {
  isDarkMode: boolean;
  tasks: Task[];
  pomodoroLogs: PomodoroLog[];
  availableTags: string[];
  calendarDays: CalendarDay[];
}

export function AnalyticsDashboard({
  isDarkMode,
  tasks,
  pomodoroLogs,
  availableTags,
  calendarDays
}: AnalyticsDashboardProps) {
  return (
    <div className="border-t border-dashed border-gray-500/10 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-sm font-black tracking-wide transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Analíticas de Productividad</h3>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>Métricas clave de enfoque y tareas finalizadas</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Task completion rates */}
        <div className={`border rounded-2xl p-5 flex flex-col justify-between h-44 transition-colors ${
          isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Estado de Tareas</h4>
            <p className={`text-[9px] font-bold uppercase tracking-widest text-emerald-500`}>Tasa de Finalización</p>
          </div>

          {(() => {
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'completada').length;
            const pending = total - completed;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div className="mt-2 space-y-3">
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-3xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{pct}%</span>
                  <span className="text-xs font-bold text-gray-500">Completado</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500">
                    <span>{completed} Resueltas</span>
                    <span>{pending} Pendientes</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Heatmap Section */}
        <div className={`border rounded-2xl p-5 transition-colors h-44 flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Heatmap de Enfoque (Últimos 7 Días)</h4>
          <div className="grid grid-cols-7 gap-1 flex-1 items-center">
            {calendarDays.map((day) => {
              const mins = pomodoroLogs
                .filter(log => log.date === day.dateStr)
                .reduce((acc, log) => acc + log.duration, 0);
              
              let bgClass = '';
              if (mins === 0) {
                bgClass = isDarkMode ? 'bg-white/5 border border-white/5 text-gray-500' : 'bg-slate-100 border border-slate-200/50 text-slate-400';
              } else if (mins <= 25) {
                bgClass = 'bg-customBlue/25 border border-customBlue/20 text-customBlue';
              } else if (mins <= 50) {
                bgClass = 'bg-customBlue/60 border border-customBlue/50 text-white';
              } else {
                bgClass = 'bg-customBlue border border-customBlue text-white shadow-md shadow-customBlue/20';
              }
              
              return (
                <div 
                  key={day.dateStr} 
                  title={`${mins} minutos enfocados`}
                  className="flex flex-col items-center justify-between h-20 transition-all hover:scale-105 cursor-help"
                >
                  <span className={`text-[9px] font-semibold transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{day.name}</span>
                  <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${bgClass}`}>
                    {mins > 0 ? `${mins}m` : '-'}
                  </div>
                  <span className={`text-[8px] font-bold transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{day.num}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Distribution Section */}
        <div className={`border rounded-2xl p-5 transition-colors h-44 flex flex-col justify-between ${
          isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Uso de Etiquetas</h4>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {(() => {
              const tagFreqs = availableTags.map(tag => {
                const count = tasks.filter(t => t.tags && t.tags.includes(tag)).length;
                return { tag, count };
              }).sort((a, b) => b.count - a.count);
              
              const maxCount = Math.max(...tagFreqs.map(tf => tf.count), 1);
              
              return tagFreqs.map(({ tag, count }) => {
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={tag} className="space-y-0.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={`font-bold transition-colors ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{tag}</span>
                      <span className={`font-extrabold text-[9px] transition-colors ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-customBlue to-customPink transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
