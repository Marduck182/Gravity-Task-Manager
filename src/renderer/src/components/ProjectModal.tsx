import React from 'react';
import { X, Check } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  archived?: boolean;
}

interface ProjectModalProps {
  isDarkMode: boolean;
  showProjectModal: boolean;
  setShowProjectModal: (val: boolean) => void;
  editingProject: Project | null;
  projectFormName: string;
  setProjectFormName: (val: string) => void;
  projectFormEmoji: string;
  setProjectFormEmoji: (val: string) => void;
  projectFormColor: string;
  setProjectFormColor: (val: string) => void;
  emojis: string[];
  colors: string[];
  handleProjectSubmit: (e: React.FormEvent) => void;
}

export function ProjectModal({
  isDarkMode,
  showProjectModal,
  setShowProjectModal,
  editingProject,
  projectFormName,
  setProjectFormName,
  projectFormEmoji,
  setProjectFormEmoji,
  projectFormColor,
  setProjectFormColor,
  emojis,
  colors,
  handleProjectSubmit
}: ProjectModalProps) {
  if (!showProjectModal) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`rounded-2xl w-full max-w-sm p-6 shadow-2xl relative border transition-all ${isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200'}`}>
        <button 
          onClick={() => setShowProjectModal(false)}
          className={`absolute top-4 right-4 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
        >
          <X className="w-4 h-4" />
        </button>

        <h4 className={`text-sm font-black mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h4>

        <form onSubmit={handleProjectSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Nombre del Proyecto</label>
            <input 
              type="text" 
              placeholder="ej. Estudios, Finanzas, Gimnasio..."
              value={projectFormName}
              onChange={(e) => setProjectFormName(e.target.value)}
              required
              className={`w-full border rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all ${isDarkMode ? 'bg-[#090a0f] border-white/5 text-white placeholder-gray-500 focus:border-customBlue/35' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-customBlue/50'}`}
            />
          </div>

          {/* Emoji selector */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider block transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Seleccionar Emoji</label>
            <div className={`grid grid-cols-8 gap-1.5 p-2 rounded-xl max-h-24 overflow-y-auto transition-colors ${isDarkMode ? 'bg-[#090a0f]' : 'bg-slate-50 border border-slate-200'}`}>
              {emojis.map(emo => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setProjectFormEmoji(emo)}
                  className={`text-base p-1 rounded transition-colors ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-200/50'
                  } ${
                    projectFormEmoji === emo 
                      ? (isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-slate-200 border border-slate-300') 
                      : ''
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-wider block transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Seleccionar Color</label>
            <div className={`flex gap-2.5 p-3 rounded-xl justify-center transition-colors ${isDarkMode ? 'bg-[#090a0f]' : 'bg-slate-50 border border-slate-200'}`}>
              {colors.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setProjectFormColor(col)}
                  className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform relative flex items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                  style={{ backgroundColor: col }}
                >
                  {projectFormColor === col && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-customBlue hover:bg-customBlue/90 text-white font-extrabold text-xs py-3 rounded-xl mt-2 shadow-md shadow-customBlue/25 transition-transform active:scale-[0.98]"
          >
            {editingProject ? 'Guardar Proyecto' : 'Crear Proyecto'}
          </button>
        </form>
      </div>
    </div>
  );
}
