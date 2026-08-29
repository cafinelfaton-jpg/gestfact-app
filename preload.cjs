const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
  getEcoles: () => ipcRenderer.invoke('db:getEcoles'),
  addEcole: (data) => ipcRenderer.invoke('db:addEcole', data),
  updateEcole: (id, data) => ipcRenderer.invoke('db:updateEcole', id, data),
  deleteEcole: (id) => ipcRenderer.invoke('db:deleteEcole', id),


  getArticles: () => ipcRenderer.invoke('db:getArticles'),
  addArticle: (data) => ipcRenderer.invoke('db:addArticle', data),
  updateArticle: (id, data) => ipcRenderer.invoke('db:updateArticle', id, data),
  deleteArticle: (id) => ipcRenderer.invoke('db:deleteArticle', id),

  getFactures: () => ipcRenderer.invoke('db:getFactures'),
  getFacture: (id) => ipcRenderer.invoke('db:getFacture', id),
  addFacture: (data, lignes) => ipcRenderer.invoke('db:addFacture', data, lignes),
  updateFacture: (id, data, lignes) => ipcRenderer.invoke('db:updateFacture', id, data, lignes),
  updateFactureStatut: (id, statut) => ipcRenderer.invoke('db:updateFactureStatut', id, statut),
  deleteFacture: (id) => ipcRenderer.invoke('db:deleteFacture', id),

  getParametres: () => ipcRenderer.invoke('db:getParametres'),
  setParametres: (data) => ipcRenderer.invoke('db:setParametres', data),
  deleteParametres: () => ipcRenderer.invoke('db:deleteParametres'),

  getObjets: () => ipcRenderer.invoke('db:getObjets'),
  addObjet: (nom) => ipcRenderer.invoke('db:addObjet', nom),
  deleteObjet: (id) => ipcRenderer.invoke('db:deleteObjet', id),
  getObjetFacture: (facture_id) => ipcRenderer.invoke('db:getObjetFacture', facture_id),
  setObjetFacture: (facture_id, objet_id) => ipcRenderer.invoke('db:setObjetFacture', facture_id, objet_id),

  getMotDePasse: () => ipcRenderer.invoke('db:getMotDePasse'),
  setMotDePasse: (mdp) => ipcRenderer.invoke('db:setMotDePasse', mdp),
  supprimerMotDePasse: () => ipcRenderer.invoke('db:supprimerMotDePasse'),
  getAppPath: () => ipcRenderer.invoke('db:getAppPath'),

  getMachineId: () => ipcRenderer.invoke('licence:getMachineId'),
  verifierLicence: (cle) => ipcRenderer.invoke('licence:verifier', cle),
  estLicenceValide: () => ipcRenderer.invoke('licence:estValide'),

  getProchainNumero: () => ipcRenderer.invoke('db:getProchainNumero'),
  dupliquerFacture: (id, ecoleId, type) => ipcRenderer.invoke('db:dupliquerFacture', id, ecoleId, type),
  recupererMotDePasse: (code) => ipcRenderer.invoke('licence:recupererMotDePasse', code),
})

