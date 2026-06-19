import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data: any) => ipcRenderer.invoke('save-data', data),
  openExternal: (url: string) => ipcRenderer.send('open-external', url)
});
