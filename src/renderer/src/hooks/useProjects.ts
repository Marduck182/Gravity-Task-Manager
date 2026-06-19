import { useState } from 'react';
import { useTodoStore, Project } from '../store/useTodoStore';

interface UseProjectsParams {
  taskFormProjectId: string;
  setTaskFormProjectId: React.Dispatch<React.SetStateAction<string>>;
}

export function useProjects({
  taskFormProjectId,
  setTaskFormProjectId
}: UseProjectsParams) {
  const projects = useTodoStore((state) => state.projects);
  const selectedProjectId = useTodoStore((state) => state.selectedProjectId);
  
  const setSelectedProjectId = useTodoStore((state) => state.setSelectedProjectId);

  const storeAddProject = useTodoStore((state) => state.addProject);
  const storeUpdateProject = useTodoStore((state) => state.updateProject);
  const storeArchiveProject = useTodoStore((state) => state.archiveProject);
  const storeUnarchiveProject = useTodoStore((state) => state.unarchiveProject);
  const storeDeleteProject = useTodoStore((state) => state.deleteProject);
  
  const showAlert = useTodoStore((state) => state.showAlert);
  const showConfirm = useTodoStore((state) => state.showConfirm);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [projectFormName, setProjectFormName] = useState('');
  const [projectFormEmoji, setProjectFormEmoji] = useState('💻');
  const [projectFormColor, setProjectFormColor] = useState('#0088ff');

  const openNewProjectModal = () => {
    setEditingProject(null);
    setProjectFormName('');
    setProjectFormEmoji('💻');
    setProjectFormColor('#0088ff');
    setShowProjectModal(true);
  };

  const openEditProjectModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setProjectFormName(proj.name);
    setProjectFormEmoji(proj.emoji);
    setProjectFormColor(proj.color);
    setShowProjectModal(true);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormName.trim()) return;

    if (editingProject) {
      storeUpdateProject({
        ...editingProject,
        name: projectFormName,
        emoji: projectFormEmoji,
        color: projectFormColor
      });
    } else {
      const newProj: Project = {
        id: `p-${Date.now()}`,
        name: projectFormName,
        emoji: projectFormEmoji,
        color: projectFormColor
      };
      storeAddProject(newProj);
    }
    setShowProjectModal(false);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      showAlert("Acción Requerida", "Debes mantener al menos un proyecto activo.");
      return;
    }
    showConfirm(
      "Eliminar Proyecto", 
      "¿Estás seguro de eliminar este proyecto? Todas sus tareas asociadas serán eliminadas permanentemente.",
      () => {
        storeDeleteProject(id);

        const remainingActive = projects.filter(p => p.id !== id && !p.archived);
        const fallbackId = remainingActive.length > 0 ? remainingActive[0].id : '';

        if (taskFormProjectId === id) setTaskFormProjectId(fallbackId);
        if (selectedProjectId === id) setSelectedProjectId(null);
      }
    );
  };

  const archiveProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const activeCount = projects.filter(p => !p.archived).length;
    if (activeCount <= 1) {
      showAlert("Acción Requerida", "Debes mantener al menos un proyecto activo.");
      return;
    }
    showConfirm(
      "Archivar Proyecto",
      "¿Estás seguro de archivar este proyecto? Sus tareas se conservarán pero no se mostrarán en las pantallas principales.",
      () => {
        storeArchiveProject(id);
        
        if (selectedProjectId === id) setSelectedProjectId(null);
        if (taskFormProjectId === id) {
          const remainingActive = projects.filter(p => p.id !== id && !p.archived);
          if (remainingActive.length > 0) {
            setTaskFormProjectId(remainingActive[0].id);
          }
        }
      }
    );
  };

  const unarchiveProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storeUnarchiveProject(id);
  };

  return {
    showProjectModal,
    setShowProjectModal,
    editingProject,
    showArchived,
    setShowArchived,
    projectFormName,
    setProjectFormName,
    projectFormEmoji,
    setProjectFormEmoji,
    projectFormColor,
    setProjectFormColor,
    openNewProjectModal,
    openEditProjectModal,
    handleProjectSubmit,
    deleteProject,
    archiveProject,
    unarchiveProject
  };
}
