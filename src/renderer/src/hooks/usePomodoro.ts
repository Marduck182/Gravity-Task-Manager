import { useState, useEffect } from 'react';
import { useTodoStore, PomodoroLog } from '../store/useTodoStore';

export function usePomodoro() {
  const tasks = useTodoStore((state) => state.tasks);
  const projects = useTodoStore((state) => state.projects);
  const isDarkMode = useTodoStore((state) => state.isDarkMode);
  const selectedDate = useTodoStore((state) => state.selectedDate);
  const availableTags = useTodoStore((state) => state.availableTags);
  const pomodoroLogs = useTodoStore((state) => state.pomodoroLogs);

  const setTasks = useTodoStore((state) => state.setTasks);
  const setPomodoroLogs = useTodoStore((state) => state.setPomodoroLogs);
  const saveState = useTodoStore((state) => state.saveState);

  const [focusActive, setFocusActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [focusTaskId, setFocusTaskId] = useState<string>('');

  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(523.25 * 2, ctx.currentTime);
      osc2.frequency.setValueAtTime(659.25 * 2, ctx.currentTime + 0.15);
 
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
 
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
 
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error('Failed to play synthesized audio:', e);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (focusActive && focusTimeLeft > 0) {
      timerId = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusActive && focusTimeLeft === 0) {
      setFocusActive(false);
      playNotificationChime();
      
      if (Notification.permission === 'granted') {
        new Notification('Enfoque Completo ⚡', {
          body: '¡Buen trabajo! Has completado tu bloque de enfoque.',
        });
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Enfoque Completo ⚡', {
              body: '¡Buen trabajo! Has completado tu bloque de enfoque.',
            });
          }
        });
      }
      
      const newLog: PomodoroLog = {
        id: `pl-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        duration: focusDuration,
        taskId: focusTaskId || undefined
      };
      const updatedLogs = [...pomodoroLogs, newLog];
      setPomodoroLogs(updatedLogs);
 
      let updatedTasks = tasks;
      if (focusTaskId) {
        updatedTasks = tasks.map(t => t.id === focusTaskId ? { ...t, status: 'completada' as const } : t);
        setTasks(updatedTasks);
      }
      
      saveState({ tasks: updatedTasks, pomodoroLogs: updatedLogs });
      setFocusTimeLeft(focusDuration * 60);
    }
    return () => clearInterval(timerId);
  }, [
    focusActive,
    focusTimeLeft,
    focusDuration,
    focusTaskId,
    tasks,
    projects,
    pomodoroLogs,
    availableTags,
    isDarkMode,
    selectedDate
  ]);

  const handleDurationChange = (mins: number) => {
    setFocusDuration(mins);
    setFocusTimeLeft(mins * 60);
    setFocusActive(false);
  };

  const toggleFocus = () => {
    setFocusActive(prev => !prev);
  };

  return {
    focusActive,
    focusTimeLeft,
    focusDuration,
    focusTaskId,
    setFocusTaskId,
    handleDurationChange,
    toggleFocus
  };
}
