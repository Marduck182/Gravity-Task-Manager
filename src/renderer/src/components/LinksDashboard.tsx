import React, { useState } from 'react';
import { Search, Plus, Trash2, Link, Folder, X, ExternalLink, Edit2 } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';

interface LinkFolder {
  id: string;
  name: string;
  emoji: string;
  isCollapsed?: boolean;
}

interface SavedLink {
  id: string;
  title: string;
  url: string;
  folderId: string;
}

interface LinksDashboardProps {
  isDarkMode: boolean;
  links: SavedLink[];
  linkFolders: LinkFolder[];
  onAddLink: (title: string, url: string, folderId: string) => void;
  onDeleteLink: (id: string) => void;
  onAddFolder: (name: string, emoji: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolderCollapse: (id: string) => void;
}

export function LinksDashboard({
  isDarkMode,
  links,
  linkFolders,
  onAddLink,
  onDeleteLink,
  onAddFolder,
  onDeleteFolder
}: LinksDashboardProps) {
  const showConfirm = useTodoStore((state) => state.showConfirm);
  const updateLink = useTodoStore((state) => state.updateLink);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Link editing state
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  
  // Folder creation state
  const [showAddFolderForm, setShowAddFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('📁');

  // Link creation state (maps folderId -> boolean/active)
  const [activeAddLinkFormFolderId, setActiveAddLinkFormFolderId] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName, newFolderEmoji);
    setNewFolderName('');
    setNewFolderEmoji('📁');
    setShowAddFolderForm(false);
  };

  const handleAddLinkSubmit = (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    onAddLink(newLinkTitle, newLinkUrl, folderId);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setActiveAddLinkFormFolderId(null);
  };

  // Filter links based on search query
  const filteredLinks = links.filter(link => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  });

  // Filter folders: show folder if folder name matches query OR has matching links inside it
  const visibleFolders = linkFolders.filter(folder => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const folderNameMatches = folder.name.toLowerCase().includes(query);
    const hasMatchingLinks = links.some(
      link => link.folderId === folder.id && (
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
      )
    );
    
    return folderNameMatches || hasMatchingLinks;
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      
      {/* 1. Header Notion-Style */}
      <div className="relative mb-6">
        {/* Banner Decorativo */}
        <div className="w-full h-2 rounded-full bg-gradient-to-r from-customBlue via-purple-500 to-customPink mb-5 shadow-sm" />
        
        <div className="flex items-start gap-4">
          <div className="text-4xl p-2 rounded-xl bg-customBlue/10 text-customBlue border border-customBlue/20 shadow-inner">
            🔗
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Mis Enlaces
            </h1>
            <p className={`text-xs font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              Colecciona, organiza y accede a tus sitios web y recursos indispensables en un solo lugar al estilo Notion.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Global Actions Bar */}
      <div className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row items-center gap-3 justify-between transition-colors ${
        isDarkMode ? 'bg-[#121420]/50 border-white/5' : 'bg-slate-100 border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar enlaces o secciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-full pl-9 pr-4 py-1.5 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              isDarkMode 
                ? 'bg-[#090a0f] border-white/5 text-white focus:border-customBlue/35 focus:ring-customBlue/10' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-customBlue/50 focus:ring-customBlue/10 shadow-sm'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Add Folder Button */}
        <button
          onClick={() => { setShowAddFolderForm(!showAddFolderForm); setActiveAddLinkFormFolderId(null); }}
          className="w-full sm:w-auto bg-customBlue hover:bg-customBlue/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-customBlue/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Sección
        </button>
      </div>

      {/* 3. Add Folder Modal-like Form (Inline) */}
      {showAddFolderForm && (
        <div className="mb-6 flex justify-center">
          <form
            onSubmit={handleAddFolderSubmit}
            className={`w-full max-w-md p-5 rounded-xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#121420] border-white/5' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className={`text-xs font-black tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                CREAR NUEVA SECCIÓN
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddFolderForm(false); setNewFolderName(''); }}
                className="text-gray-500 hover:text-red-500 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Nombre de la sección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Herramientas de Dev, Personal, Social..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-customBlue/30 transition-colors ${
                    isDarkMode ? 'bg-[#090a0f] border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Selecciona un Icono
                </label>
                <select
                  value={newFolderEmoji}
                  onChange={(e) => setNewFolderEmoji(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-customBlue/30 cursor-pointer ${
                    isDarkMode ? 'bg-[#090a0f] border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="📁">📁 Carpeta Estándar</option>
                  <option value="🏠">🏠 Inicio / General</option>
                  <option value="🚀">🚀 Proyectos y Lanzamientos</option>
                  <option value="🎓">🎓 Estudios y Aprendizaje</option>
                  <option value="🎨">🎨 Diseño e Inspiración</option>
                  <option value="🔑">🔑 Accesos y Claves</option>
                  <option value="📎">📎 Recursos y Varios</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddFolderForm(false); setNewFolderName(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-650'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-customBlue hover:bg-customBlue/95 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  Crear Sección
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 4. Grid of Folder/Section Cards */}
      {visibleFolders.length === 0 ? (
        <div className={`p-12 text-center border-2 border-dashed rounded-2xl ${
          isDarkMode ? 'border-white/5 bg-[#121420]/10' : 'border-slate-200 bg-slate-50'
        }`}>
          <Folder className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
            No se encontraron secciones
          </h3>
          <p className="text-xs text-gray-500">
            Intenta buscar con otra palabra clave o crea una nueva sección.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFolders.map((folder) => {
            const folderLinks = filteredLinks.filter(l => l.folderId === folder.id);
            const isAddingLink = activeAddLinkFormFolderId === folder.id;

            return (
              <div
                key={folder.id}
                className={`relative group rounded-2xl border p-5 flex flex-col min-h-64 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#121420]/75 border-white/5 shadow-xl hover:border-customBlue/30 hover:shadow-customBlue/5 hover:-translate-y-1' 
                    : 'bg-white border-slate-200/80 shadow-sm hover:border-customBlue/35 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-1.5 rounded-lg bg-customBlue/5 text-customBlue border border-customBlue/5 select-none shrink-0">
                      {folder.emoji}
                    </span>
                    <h2 className={`text-sm font-black truncate tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {folder.name}
                    </h2>
                  </div>

                  {/* Actions (Delete folder) */}
                  <button
                    onClick={() => {
                      showConfirm(
                        "Eliminar Sección",
                        `¿Estás seguro de eliminar la sección "${folder.name}" y todos sus enlaces?`,
                        () => onDeleteFolder(folder.id)
                      );
                    }}
                    className={`opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 p-1 rounded transition-all shrink-0`}
                    title="Eliminar sección completa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body - Links List */}
                <div className="flex-1 overflow-y-auto space-y-1 mb-4 pr-1 scrollbar-thin">
                  {folderLinks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-6 text-center select-none opacity-40">
                      <Link className="w-6 h-6 mb-1 text-gray-600" />
                      <p className="text-[10px] italic">Vacío</p>
                    </div>
                  ) : (
                    folderLinks.map((link) => {
                      const isEditingThisLink = editingLinkId === link.id;
                      
                      return isEditingThisLink ? (
                        <form
                          key={link.id}
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!editLinkTitle.trim() || !editLinkUrl.trim()) return;
                            updateLink(link.id, editLinkTitle, editLinkUrl);
                            setEditingLinkId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`p-2.5 rounded-xl border space-y-2 text-xs transition-colors my-1 ${
                            isDarkMode ? 'bg-[#090a0f] border-white/5' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <input
                            type="text"
                            placeholder="Título del enlace (ej: Figma)"
                            value={editLinkTitle}
                            onChange={(e) => setEditLinkTitle(e.target.value)}
                            className={`w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-customBlue/50 transition-colors ${
                              isDarkMode ? 'bg-[#121420] border border-white/5 text-white' : 'bg-white border border-slate-300 text-slate-850'
                            }`}
                            required
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="URL (ej: figma.com)"
                              value={editLinkUrl}
                              onChange={(e) => setEditLinkUrl(e.target.value)}
                              className={`flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-customBlue/50 transition-colors ${
                                isDarkMode ? 'bg-[#121420] border border-white/5 text-white' : 'bg-white border border-slate-300 text-slate-850'
                              }`}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-customBlue hover:bg-customBlue/90 text-white px-2.5 py-1 rounded text-[10px] font-bold shrink-0"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingLinkId(null)}
                              className={`px-1.5 py-1 rounded text-[10px] transition-colors shrink-0 ${
                                isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-650'
                              }`}
                            >
                              X
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div
                          key={link.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs group/link cursor-pointer transition-colors ${
                            isDarkMode 
                              ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent hover:border-slate-100'
                          }`}
                          onClick={() => {
                            if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
                              window.electronAPI.openExternal(link.url);
                            } else {
                              window.open(link.url, '_blank');
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Link className="w-3.5 h-3.5 text-customBlue shrink-0" />
                            <span className="truncate font-semibold">{link.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-gray-500 shrink-0" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLinkId(link.id);
                                setEditLinkTitle(link.title);
                                setEditLinkUrl(link.url);
                              }}
                              className="text-gray-500 hover:text-customBlue p-0.5 rounded transition-colors shrink-0"
                              title="Editar Enlace"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLink(link.id);
                              }}
                              className="text-gray-500 hover:text-red-500 p-0.5 rounded transition-colors shrink-0"
                              title="Eliminar Enlace"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Card Footer - Inline Form or Add Button */}
                {isAddingLink ? (
                  <form
                    onSubmit={(e) => handleAddLinkSubmit(e, folder.id)}
                    className={`p-3 rounded-xl border space-y-2 text-xs transition-colors ${
                      isDarkMode ? 'bg-[#090a0f] border-white/5' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Título del enlace (ej: Figma)"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className={`w-full rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-customBlue/50 transition-colors ${
                          isDarkMode ? 'bg-[#121420] border border-white/5 text-white' : 'bg-white border border-slate-300 text-slate-850'
                        }`}
                        required
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="URL (ej: figma.com)"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className={`flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-customBlue/50 transition-colors ${
                          isDarkMode ? 'bg-[#121420] border border-white/5 text-white' : 'bg-white border border-slate-300 text-slate-850'
                        }`}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-customBlue hover:bg-customBlue/90 text-white px-2.5 py-1 rounded text-xs font-bold shrink-0"
                      >
                        Añadir
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveAddLinkFormFolderId(null); setNewLinkTitle(''); setNewLinkUrl(''); }}
                        className={`px-1.5 py-1 rounded text-xs transition-colors shrink-0 ${
                          isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        X
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setActiveAddLinkFormFolderId(folder.id);
                      setShowAddFolderForm(false);
                      setNewLinkTitle('');
                      setNewLinkUrl('');
                    }}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold border border-dashed flex items-center justify-center gap-1 transition-all ${
                      isDarkMode 
                        ? 'border-white/5 hover:border-customBlue/20 text-gray-500 hover:text-white bg-white/2 hover:bg-white/3' 
                        : 'border-slate-200 hover:border-customBlue/35 text-slate-500 hover:text-customBlue bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nuevo Enlace
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
