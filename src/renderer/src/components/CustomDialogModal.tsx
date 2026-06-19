import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';

export function CustomDialogModal() {
  const isDarkMode = useTodoStore((state) => state.isDarkMode);
  const customDialog = useTodoStore((state) => state.customDialog);
  const closeDialog = useTodoStore((state) => state.closeDialog);

  if (!customDialog || !customDialog.isOpen) return null;

  const { title, message, type, confirmLabel, cancelLabel, onConfirm } = customDialog;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeDialog();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div 
        className={`w-full max-w-sm rounded-2xl p-6 border transition-all duration-300 shadow-2xl relative flex flex-col items-center text-center ${
          isDarkMode 
            ? 'bg-[#121420]/95 border-white/5 text-white shadow-black/85' 
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300'
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={closeDialog}
          className={`absolute top-4 right-4 transition-colors p-1 rounded-full hover:bg-white/5 ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md ${
          type === 'confirm'
            ? 'bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-customBlue/5'
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/5'
        }`}>
          {type === 'confirm' ? (
            <HelpCircle className="w-7 h-7" />
          ) : (
            <AlertTriangle className="w-7 h-7" />
          )}
        </div>

        {/* Content */}
        <h4 className={`text-base font-black tracking-tight mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {title}
        </h4>
        <p className={`text-xs font-medium leading-relaxed mb-6 transition-colors ${
          isDarkMode ? 'text-gray-400' : 'text-slate-500'
        }`}>
          {message}
        </p>

        {/* Buttons */}
        <div className="w-full flex gap-3 mt-1 text-xs">
          {type === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={closeDialog}
                className={`flex-1 font-bold py-2.5 px-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isDarkMode 
                    ? 'border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white' 
                    : 'border-slate-200 bg-slate-100 text-slate-650 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {cancelLabel || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-customBlue hover:bg-customBlue/90 text-white font-black py-2.5 px-4 rounded-xl shadow-md shadow-customBlue/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {confirmLabel || 'Confirmar'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-customBlue hover:bg-customBlue/90 text-white font-black py-2.5 px-4 rounded-xl shadow-md shadow-customBlue/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {confirmLabel || 'Aceptar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
