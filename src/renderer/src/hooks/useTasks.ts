import { useState } from 'react';
import { useTodoStore, Task, SubTask } from '../store/useTodoStore';

const getLocalTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface UseTasksParams {
  editorRef: React.RefObject<HTMLDivElement>;
  focusTaskId: string;
  setFocusTaskId: React.Dispatch<React.SetStateAction<string>>;
}

export function useTasks({
  editorRef,
  focusTaskId,
  setFocusTaskId
}: UseTasksParams) {
  const tasks = useTodoStore((state) => state.tasks);
  const projects = useTodoStore((state) => state.projects);
  const availableTags = useTodoStore((state) => state.availableTags);
  const selectedProjectId = useTodoStore((state) => state.selectedProjectId);
  
  const setTasks = useTodoStore((state) => state.setTasks);
  const setAvailableTags = useTodoStore((state) => state.setAvailableTags);
  const saveState = useTodoStore((state) => state.saveState);

  const storeAddTask = useTodoStore((state) => state.addTask);
  const storeUpdateTask = useTodoStore((state) => state.updateTask);
  const storeDeleteTask = useTodoStore((state) => state.deleteTask);
  const storeToggleTaskStatus = useTodoStore((state) => state.toggleTaskStatus);
  const storeToggleSubtask = useTodoStore((state) => state.toggleSubtask);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Form Fields
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormProjectId, setTaskFormProjectId] = useState('');
  const [taskFormStartDate, setTaskFormStartDate] = useState(getLocalTodayStr());
  const [taskFormEndDate, setTaskFormEndDate] = useState(getLocalTodayStr());
  const [taskFormStartTime, setTaskFormStartTime] = useState('10:00');
  const [taskFormEndTime, setTaskFormEndTime] = useState('11:30');
  const [taskFormStatus, setTaskFormStatus] = useState<'pendiente' | 'en-curso' | 'bloqueada' | 'completada'>('pendiente');

  // Tags & Subtasks Form State
  const [taskFormTags, setTaskFormTags] = useState<string[]>([]);
  const [taskFormSubtasks, setTaskFormSubtasks] = useState<SubTask[]>([]);
  const [subtaskInputText, setSubtaskInputText] = useState('');
  const [newTagInputText, setNewTagInputText] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTaskStatus = (id: string) => {
    storeToggleTaskStatus(id);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    storeToggleSubtask(taskId, subtaskId);
  };

  const deleteTask = (id: string) => {
    storeDeleteTask(id);
    if (focusTaskId === id) setFocusTaskId('');
  };

  const openAddTaskForm = () => {
    setEditingTask(null);
    setTaskFormTitle('');
    if (selectedProjectId) {
      setTaskFormProjectId(selectedProjectId);
    } else if (projects.length > 0) {
      const firstActive = projects.find(p => !p.archived);
      setTaskFormProjectId(firstActive ? firstActive.id : projects[0].id);
    }
    const todayStr = getLocalTodayStr();
    setTaskFormStartDate(todayStr);
    setTaskFormEndDate(todayStr);
    setTaskFormStartTime('10:00');
    setTaskFormEndTime('11:30');
    setTaskFormStatus('pendiente');
    
    setTaskFormTags([]);
    setTaskFormSubtasks([]);
    setSubtaskInputText('');
    setNewTagInputText('');
    setShowNewTagInput(false);
    
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = '';
    }, 50);
    
    setShowTaskForm(true);
  };

  const openEditTaskForm = (task: Task) => {
    setEditingTask(task);
    setTaskFormTitle(task.title);
    setTaskFormProjectId(task.projectId);
    setTaskFormStartDate(task.startDate);
    setTaskFormEndDate(task.endDate);
    setTaskFormStartTime(task.startTime);
    setTaskFormEndTime(task.endTime);
    setTaskFormStatus(task.status);

    setTaskFormTags(task.tags || []);
    setTaskFormSubtasks(task.subtasks || []);
    setSubtaskInputText('');
    setNewTagInputText('');
    setShowNewTagInput(false);

    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = task.description || '';
    }, 50);

    setShowTaskForm(true);
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInputText.trim();
    if (!trimmed) return;
    let updatedTags = availableTags;
    if (!availableTags.includes(trimmed)) {
      updatedTags = [...availableTags, trimmed];
      setAvailableTags(updatedTags);
    }
    if (!taskFormTags.includes(trimmed)) {
      setTaskFormTags([...taskFormTags, trimmed]);
    }
    setNewTagInputText('');
    setShowNewTagInput(false);
    saveState({ availableTags: updatedTags });
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInputText.trim();
    if (!trimmed) return;
    const newSub: SubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: trimmed,
      completed: false
    };
    setTaskFormSubtasks([...taskFormSubtasks, newSub]);
    setSubtaskInputText('');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle.trim() || !taskFormProjectId) return;

    const editorHtml = editorRef.current ? editorRef.current.innerHTML : '';

    if (editingTask) {
      storeUpdateTask({
        ...editingTask,
        title: taskFormTitle,
        projectId: taskFormProjectId,
        status: taskFormStatus,
        startDate: taskFormStartDate,
        endDate: taskFormEndDate,
        startTime: taskFormStartTime,
        endTime: taskFormEndTime,
        description: editorHtml,
        subtasks: taskFormSubtasks,
        tags: taskFormTags
      });
    } else {
      const newTask: Task = {
        id: `t-${Date.now()}`,
        title: taskFormTitle,
        projectId: taskFormProjectId,
        status: taskFormStatus,
        startDate: taskFormStartDate,
        endDate: taskFormEndDate,
        startTime: taskFormStartTime,
        endTime: taskFormEndTime,
        description: editorHtml,
        subtasks: taskFormSubtasks,
        tags: taskFormTags,
        statusChangedAt: getLocalTodayStr()
      };
      storeAddTask(newTask);
    }

    setShowTaskForm(false);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'pendiente' | 'en-curso' | 'bloqueada' | 'completada') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      const draggedTask = tasks.find(t => t.id === id);
      if (draggedTask) {
        const otherTasks = tasks.filter(t => t.id !== id);
        const statusChangedAt = draggedTask.status !== newStatus ? getLocalTodayStr() : (draggedTask.statusChangedAt || getLocalTodayStr());
        const updatedDragged = { ...draggedTask, status: newStatus, statusChangedAt };
        const updated = [...otherTasks, updatedDragged];
        setTasks(updated);
        saveState({ tasks: updated });
      }
    }
  };

  const handleDropOnTask = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetTaskId) return;

    const draggedTask = tasks.find(t => t.id === draggedId);
    const targetTask = tasks.find(t => t.id === targetTaskId);
    if (!draggedTask || !targetTask) return;

    const targetStatus = targetTask.status;
    const statusChangedAt = draggedTask.status !== targetStatus ? getLocalTodayStr() : (draggedTask.statusChangedAt || getLocalTodayStr());
    const tasksWithoutDragged = tasks.filter(t => t.id !== draggedId);
    const targetIdx = tasksWithoutDragged.findIndex(t => t.id === targetTaskId);

    const updatedDragged = { ...draggedTask, status: targetStatus, statusChangedAt };
    const updatedTasks = [...tasksWithoutDragged];
    updatedTasks.splice(targetIdx, 0, updatedDragged);

    setTasks(updatedTasks);
    saveState({ tasks: updatedTasks });
  };

  return {
    editingTask,
    showTaskForm,
    setShowTaskForm,
    taskFormTitle,
    setTaskFormTitle,
    taskFormProjectId,
    setTaskFormProjectId,
    taskFormStartDate,
    setTaskFormStartDate,
    taskFormEndDate,
    setTaskFormEndDate,
    taskFormStartTime,
    setTaskFormStartTime,
    taskFormEndTime,
    setTaskFormEndTime,
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
    searchQuery,
    setSearchQuery,
    toggleTaskStatus,
    toggleSubtask,
    deleteTask,
    openAddTaskForm,
    openEditTaskForm,
    handleAddNewTag,
    handleAddSubtask,
    handleTaskSubmit,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDropOnTask
  };
}
