import { Sparkles, Minimize2, Maximize2, X } from 'lucide-react';

interface TitlebarProps {
  isDarkMode: boolean;
  handleMinimize: () => void;
  handleMaximize: () => void;
  handleClose: () => void;
}

export function Titlebar({ isDarkMode, handleMinimize, handleMaximize, handleClose }: TitlebarProps) {
  return (
    <div className={`h-8 flex items-center justify-between px-3 border-b drag-region select-none shrink-0 transition-colors ${isDarkMode ? 'bg-[#090a0f] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-customBlue animate-pulse" />
        <span className={`text-[10px] font-extrabold tracking-wider transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>GRAVITY TASK MANAGER</span>
      </div>
      
      {/* Controls */}
      <div className="flex items-center h-full no-drag-region">
        <button 
          onClick={handleMinimize} 
          className={`h-8 w-11 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
          title="Minimizar"
        >
          <Minimize2 className="w-3 h-3 text-gray-400" />
        </button>
        <button 
          onClick={handleMaximize} 
          className={`h-8 w-11 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
          title="Maximizar"
        >
          <Maximize2 className="w-3 h-3 text-gray-400" />
        </button>
        <button 
          onClick={handleClose} 
          className={`h-8 w-11 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-red-600 hover:text-white' : 'hover:bg-red-500 hover:text-white'}`}
          title="Cerrar"
        >
          <X className="w-3 h-3 text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
