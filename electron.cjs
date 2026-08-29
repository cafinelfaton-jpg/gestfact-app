const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const os = require('os')

// Empêcher l'app de se figer
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.commandLine.appendSwitch('disable-hang-monitor')
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
app.commandLine.appendSwitch('force-device-scale-factor', '1')

let db = null
let dbPath = null
let dbReady = false

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

async function waitDB() {
  while (!dbReady) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

function getMachineId() {
  const hostname = os.hostname()
  const cpus = os.cpus()[0]?.model || ''
  return `${hostname}-${cpus}`.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 30)
}

function verifierCle(cle) {
  const secret = 'ETONAM_PLUS_SECRET_2025_CAFINEL'
  const machineId = getMachineId()
  const hash = crypto.createHmac('sha256', secret)
    .update(machineId)
    .digest('hex')
    .toUpperCase()
    .slice(0, 20)
  const cleValide = `${hash.slice(0, 5)}-${hash.slice(5, 10)}-${hash.slice(10, 15)}-${hash.slice(15, 20)}`
  return cle === cleValide
}

function getCleStockee() {
  const cheminCle = path.join(app.getPath('userData'), 'licence.key')
  if (fs.existsSync(cheminCle)) {
    return fs.readFileSync(cheminCle, 'utf8').trim()
  }
  return null
}

function stockerCle(cle) {
  const cheminCle = path.join(app.getPath('userData'), 'licence.key')
  fs.writeFileSync(cheminCle, cle)
}

const SECRET_RECOVERY = 'GESTFACT_RECOVERY_2025_CAFINEL'

function verifierCodeRecuperation(code) {
  const machineId = getMachineId()
  const hash = crypto.createHmac('sha256', SECRET_RECOVERY)
    .update(machineId + '-RESET')
    .digest('hex')
    .toUpperCase()
    .slice(0, 16)
  const codeValide = `RST-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`
  return code === codeValide
}

async function initDB() {
  const initSqlJs = require('sql.js')
  const SQL = await initSqlJs({
    locateFile: file => {
      if (process.env.NODE_ENV === 'development') {
        return path.join(__dirname, 'node_modules/sql.js/dist', file)
      }
      return path.join(process.resourcesPath, file)
    }
  })
  dbPath = path.join(app.getPath('userData'), 'etonam.db')
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    createTables()
    saveDB()
  }

  // Migrations automatiques
  try { db.run(`CREATE TABLE IF NOT EXISTS compteur (id TEXT PRIMARY KEY, valeur INTEGER DEFAULT 0)`) } catch (e) { }
  try { db.run(`INSERT OR IGNORE INTO compteur (id, valeur) VALUES ('factures', 0)`) } catch (e) { }
  try { db.run(`ALTER TABLE factures ADD COLUMN type_document TEXT DEFAULT 'proforma'`) } catch (e) { }
  try { db.run(`ALTER TABLE factures ADD COLUMN type_taxe TEXT DEFAULT 'AIB'`) } catch (e) { }
  try { db.run(`CREATE TABLE IF NOT EXISTS securite (id TEXT PRIMARY KEY, mot_de_passe TEXT NOT NULL)`) } catch (e) { }
  try { db.run(`CREATE TABLE IF NOT EXISTS objets (id TEXT PRIMARY KEY, nom TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`) } catch (e) { }
  try { db.run(`CREATE TABLE IF NOT EXISTS objet_facture (facture_id TEXT PRIMARY KEY, objet_id TEXT)`) } catch (e) { }
  try { db.run(`ALTER TABLE parametres ADD COLUMN rccm TEXT DEFAULT ''`) } catch (e) { }
  try { db.run(`ALTER TABLE parametres ADD COLUMN ifu TEXT DEFAULT ''`) } catch (e) { }
  try { db.run(`ALTER TABLE parametres ADD COLUMN telephone1 TEXT DEFAULT ''`) } catch (e) { }
  try { db.run(`ALTER TABLE parametres ADD COLUMN telephone2 TEXT DEFAULT ''`) } catch (e) { }
  saveDB()

  dbReady = true
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS ecoles (id TEXT PRIMARY KEY, nom TEXT NOT NULL, adresse TEXT, telephone TEXT, email TEXT, ifu TEXT, groupe TEXT, created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, nom TEXT NOT NULL, description TEXT, prix_unitaire REAL NOT NULL, unite TEXT DEFAULT 'pièce', created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS factures (id TEXT PRIMARY KEY, ecole_id TEXT, numero_facture TEXT UNIQUE NOT NULL, date_facture TEXT, statut TEXT DEFAULT 'brouillon', total_ht REAL DEFAULT 0, tva REAL DEFAULT 0, total_ttc REAL DEFAULT 0, type_document TEXT DEFAULT 'proforma', type_taxe TEXT DEFAULT 'AIB', created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS lignes_facture (id TEXT PRIMARY KEY, facture_id TEXT, article_id TEXT, quantite REAL NOT NULL, prix_unitaire REAL NOT NULL, remise REAL DEFAULT 0, prix_ligne REAL NOT NULL)`)
  db.run(`CREATE TABLE IF NOT EXISTS parametres (id TEXT PRIMARY KEY, nom_etablissement TEXT NOT NULL, rccm TEXT DEFAULT '', ifu TEXT DEFAULT '', telephone1 TEXT DEFAULT '', telephone2 TEXT DEFAULT '')`)
  db.run(`CREATE TABLE IF NOT EXISTS objets (id TEXT PRIMARY KEY, nom TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`)
  db.run(`CREATE TABLE IF NOT EXISTS objet_facture (facture_id TEXT PRIMARY KEY, objet_id TEXT)`)
  db.run(`CREATE TABLE IF NOT EXISTS securite (id TEXT PRIMARY KEY, mot_de_passe TEXT NOT NULL)`)
  db.run(`CREATE TABLE IF NOT EXISTS compteur (id TEXT PRIMARY KEY, valeur INTEGER DEFAULT 0)`)
  db.run(`INSERT OR IGNORE INTO compteur (id, valeur) VALUES ('factures', 0)`)

  const objetsDefaut = ['Fournitures Scolaires', 'Fournitures de Bureau', 'Petits Outillages', 'Restauration pour 06 personnes', 'Photocopie']
  objetsDefaut.forEach(nom => {
    db.run(`INSERT OR IGNORE INTO objets (id, nom) VALUES (?, ?)`, [uuid(), nom])
  })
}

function saveDB() {
  if (!db || !dbPath) return
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function queryAll(sql, params = []) {
  const result = db.exec(sql, params)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params)
  return rows[0] || null
}

// LICENCE
ipcMain.handle('licence:getMachineId', () => getMachineId())
ipcMain.handle('licence:verifier', (_, cle) => {
  if (verifierCle(cle)) { stockerCle(cle); return true }
  return false
})
ipcMain.handle('licence:estValide', () => {
  const cle = getCleStockee()
  if (!cle) return false
  return verifierCle(cle)
})
ipcMain.handle('licence:recupererMotDePasse', (_, code) => {
  if (verifierCodeRecuperation(code)) {
    db.run('DELETE FROM securite')
    saveDB()
    return true
  }
  return false
})

// ECOLES
ipcMain.handle('db:getEcoles', async () => { await waitDB(); return queryAll('SELECT * FROM ecoles ORDER BY nom') })
ipcMain.handle('db:addEcole', async (_, data) => { await waitDB(); const id = uuid(); db.run('INSERT INTO ecoles (id,nom,adresse,telephone,email,ifu,groupe) VALUES (?,?,?,?,?,?,?)', [id, data.nom, data.adresse || '', data.telephone || '', data.email || '', data.ifu || '', data.groupe || '']); saveDB(); return id })
ipcMain.handle('db:updateEcole', async (_, id, data) => { await waitDB(); db.run('UPDATE ecoles SET nom=?,adresse=?,telephone=?,email=?,ifu=?,groupe=? WHERE id=?', [data.nom, data.adresse || '', data.telephone || '', data.email || '', data.ifu || '', data.groupe || '', id]); saveDB() })
ipcMain.handle('db:deleteEcole', async (_, id) => { await waitDB(); db.run('DELETE FROM ecoles WHERE id=?', [id]); saveDB() })

// ARTICLES
ipcMain.handle('db:getArticles', async () => { await waitDB(); return queryAll('SELECT * FROM articles ORDER BY nom') })
ipcMain.handle('db:addArticle', async (_, data) => { await waitDB(); const id = uuid(); db.run('INSERT INTO articles (id,nom,description,prix_unitaire,unite) VALUES (?,?,?,?,?)', [id, data.nom, data.description || '', data.prix_unitaire, data.unite || 'pièce']); saveDB(); return id })
ipcMain.handle('db:updateArticle', async (_, id, data) => { await waitDB(); db.run('UPDATE articles SET nom=?,description=?,prix_unitaire=?,unite=? WHERE id=?', [data.nom, data.description || '', data.prix_unitaire, data.unite || 'pièce', id]); saveDB() })
ipcMain.handle('db:deleteArticle', async (_, id) => { await waitDB(); db.run('DELETE FROM articles WHERE id=?', [id]); saveDB() })

// FACTURES
ipcMain.handle('db:getFactures', async () => {
  await waitDB()
  const rows = queryAll(`SELECT f.*, e.nom as ecole_nom FROM factures f LEFT JOIN ecoles e ON f.ecole_id=e.id ORDER BY f.created_at DESC`)
  return rows.map(r => ({ ...r, ecoles: { nom: r.ecole_nom } }))
})

ipcMain.handle('db:getFacture', async (_, id) => {
  await waitDB()
  const f = queryOne(`SELECT f.*, e.nom as ecole_nom, e.adresse as ecole_adresse, e.telephone as ecole_telephone, e.ifu as ecole_ifu FROM factures f LEFT JOIN ecoles e ON f.ecole_id=e.id WHERE f.id=?`, [id])
  if (!f) return null
  f.ecoles = { nom: f.ecole_nom, adresse: f.ecole_adresse, telephone: f.ecole_telephone, ifu: f.ecole_ifu }
  const lignes = queryAll(`SELECT l.*, a.nom as article_nom, a.unite as article_unite FROM lignes_facture l LEFT JOIN articles a ON l.article_id=a.id WHERE l.facture_id=?`, [id])
  f.lignes_facture = lignes.map(l => ({ ...l, articles: { nom: l.article_nom, unite: l.article_unite } }))
  const objet = queryOne(`SELECT o.nom FROM objet_facture of2 JOIN objets o ON of2.objet_id=o.id WHERE of2.facture_id=?`, [id])
  f.objet_nom = objet ? objet.nom : null
  return f
})

ipcMain.handle('db:addFacture', async (_, data, lignes) => {
  await waitDB()
  const id = uuid()
  db.run('INSERT INTO factures (id,ecole_id,numero_facture,date_facture,statut,total_ht,tva,total_ttc,type_document,type_taxe) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, data.ecole_id, data.numero_facture, data.date_facture, data.statut, data.total_ht, data.tva, data.total_ttc, data.type_document || 'proforma', data.type_taxe || 'AIB'])
  lignes.forEach(l => db.run('INSERT INTO lignes_facture (id,facture_id,article_id,quantite,prix_unitaire,remise,prix_ligne) VALUES (?,?,?,?,?,?,?)',
    [uuid(), id, l.article_id, l.quantite, l.prix_unitaire, l.remise, l.prix_ligne]))
  saveDB()
  return id
})

ipcMain.handle('db:updateFacture', async (_, id, data, lignes) => {
  await waitDB()
  db.run('UPDATE factures SET ecole_id=?,date_facture=?,statut=?,total_ht=?,tva=?,total_ttc=?,type_document=?,type_taxe=? WHERE id=?',
    [data.ecole_id, data.date_facture, data.statut, data.total_ht, data.tva, data.total_ttc, data.type_document || 'proforma', data.type_taxe || 'AIB', id])
  db.run('DELETE FROM lignes_facture WHERE facture_id=?', [id])
  lignes.forEach(l => db.run('INSERT INTO lignes_facture (id,facture_id,article_id,quantite,prix_unitaire,remise,prix_ligne) VALUES (?,?,?,?,?,?,?)',
    [uuid(), id, l.article_id, l.quantite, l.prix_unitaire, l.remise, l.prix_ligne]))
  saveDB()
})

ipcMain.handle('db:updateFactureStatut', async (_, id, statut) => { await waitDB(); db.run('UPDATE factures SET statut=? WHERE id=?', [statut, id]); saveDB() })

ipcMain.handle('db:deleteFacture', async (_, id) => {
  await waitDB()
  db.run('DELETE FROM lignes_facture WHERE facture_id=?', [id])
  db.run('DELETE FROM factures WHERE id=?', [id])
  saveDB()
})

// COMPTEUR
ipcMain.handle('db:getProchainNumero', async () => {
  await waitDB()
  const row = queryOne('SELECT valeur FROM compteur WHERE id=?', ['factures'])
  const next = (row ? row.valeur : 0) + 1
  db.run('UPDATE compteur SET valeur=? WHERE id=?', [next, 'factures'])
  saveDB()
  const annee = new Date().getFullYear()
  const params = queryOne('SELECT nom_etablissement FROM parametres LIMIT 1')
  const nomEts = params ? params.nom_etablissement.toUpperCase() : 'ETS ETONAM PLUS'
  return `${String(next).padStart(5, '0')}/${nomEts}/${annee}-${annee + 1}`
})
// DUPLICATION
ipcMain.handle('db:dupliquerFacture', async (_, id, nouvelEcoleId, nouveauType) => {
  await waitDB()
  const f = queryOne('SELECT * FROM factures WHERE id=?', [id])
  if (!f) return null
  const row = queryOne('SELECT valeur FROM compteur WHERE id=?', ['factures'])
  const next = (row ? row.valeur : 0) + 1
  db.run('UPDATE compteur SET valeur=? WHERE id=?', [next, 'factures'])
  const annee = new Date().getFullYear()
  const params = queryOne('SELECT nom_etablissement FROM parametres LIMIT 1')
  const nomEts = params ? params.nom_etablissement.toUpperCase() : 'ETS ETONAM PLUS'
  const numero = `${String(next).padStart(5, '0')}/${nomEts}/${annee}-${annee + 1}`
  const newId = uuid()
  db.run('INSERT INTO factures (id,ecole_id,numero_facture,date_facture,statut,total_ht,tva,total_ttc,type_document,type_taxe) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [newId, nouvelEcoleId || f.ecole_id, numero, f.date_facture, 'brouillon', f.total_ht, f.tva, f.total_ttc, nouveauType || f.type_document || 'proforma', f.type_taxe || 'AIB'])
  const lignes = queryAll('SELECT * FROM lignes_facture WHERE facture_id=?', [id])
  lignes.forEach(l => db.run('INSERT INTO lignes_facture (id,facture_id,article_id,quantite,prix_unitaire,remise,prix_ligne) VALUES (?,?,?,?,?,?,?)',
    [uuid(), newId, l.article_id, l.quantite, l.prix_unitaire, l.remise, l.prix_ligne]))
  saveDB()
  return newId
})

// OBJETS
ipcMain.handle('db:getObjets', async () => { await waitDB(); return queryAll('SELECT * FROM objets ORDER BY nom') })
ipcMain.handle('db:addObjet', async (_, nom) => { await waitDB(); const id = uuid(); db.run('INSERT INTO objets (id, nom) VALUES (?,?)', [id, nom]); saveDB(); return id })
ipcMain.handle('db:deleteObjet', async (_, id) => { await waitDB(); db.run('DELETE FROM objets WHERE id=?', [id]); saveDB() })
ipcMain.handle('db:getObjetFacture', async (_, facture_id) => { await waitDB(); return queryOne('SELECT o.* FROM objet_facture of2 JOIN objets o ON of2.objet_id=o.id WHERE of2.facture_id=?', [facture_id]) })
ipcMain.handle('db:setObjetFacture', async (_, facture_id, objet_id) => { await waitDB(); db.run('INSERT OR REPLACE INTO objet_facture (facture_id, objet_id) VALUES (?,?)', [facture_id, objet_id]); saveDB() })

// PARAMETRES
ipcMain.handle('db:getParametres', async () => { await waitDB(); return queryOne('SELECT * FROM parametres LIMIT 1') })
ipcMain.handle('db:setParametres', async (_, data) => {
  await waitDB()
  db.run('DELETE FROM parametres')
  db.run('INSERT INTO parametres (id, nom_etablissement, rccm, ifu, telephone1, telephone2) VALUES (?,?,?,?,?,?)',
    [uuid(), data.nom_etablissement || data, data.rccm || '', data.ifu || '', data.telephone1 || '', data.telephone2 || ''])
  saveDB()
})
ipcMain.handle('db:deleteParametres', async () => { await waitDB(); db.run('DELETE FROM parametres'); saveDB() })

// SECURITE
ipcMain.handle('db:getMotDePasse', async () => { await waitDB(); return queryOne('SELECT * FROM securite LIMIT 1') })
ipcMain.handle('db:setMotDePasse', async (_, mdp) => { await waitDB(); db.run('DELETE FROM securite'); db.run('INSERT INTO securite (id, mot_de_passe) VALUES (?,?)', [uuid(), mdp]); saveDB() })
ipcMain.handle('db:supprimerMotDePasse', async () => { await waitDB(); db.run('DELETE FROM securite'); saveDB() })

// APP PATH
ipcMain.handle('db:getAppPath', () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, 'public')
  }
  return process.resourcesPath
})

app.whenReady().then(async () => {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    protocol.registerFileProtocol('appimg', (request, callback) => {
      const filename = request.url.replace('appimg://', '')
      const filePath = path.join(process.resourcesPath, filename)
      callback({ path: filePath })
    })
  }

  await initDB()

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      backgroundThrottling: false,
    },
    title: 'GestFact',
    autoHideMenuBar: true,
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadURL(`file://${path.join(__dirname, 'dist/index.html')}`)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
