import initSqlJs from 'sql.js'
import { app } from '@electron/remote'
import path from 'path'
import fs from 'fs'

let db = null
let dbPath = null

export async function initDB() {
  const SQL = await initSqlJs()
  
  const userDataPath = app.getPath('userData')
  dbPath = path.join(userDataPath, 'etonam.db')
  
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    createTables()
    saveDB()
  }
  
  return db
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS ecoles (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      adresse TEXT,
      telephone TEXT,
      email TEXT,
      ifu TEXT,
      groupe TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      description TEXT,
      prix_unitaire REAL NOT NULL,
      unite TEXT DEFAULT 'pièce',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS factures (
      id TEXT PRIMARY KEY,
      ecole_id TEXT,
      numero_facture TEXT UNIQUE NOT NULL,
      date_facture TEXT,
      date_echeance TEXT,
      statut TEXT DEFAULT 'brouillon',
      total_ht REAL DEFAULT 0,
      tva REAL DEFAULT 0,
      total_ttc REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ecole_id) REFERENCES ecoles(id)
    );

    CREATE TABLE IF NOT EXISTS lignes_facture (
      id TEXT PRIMARY KEY,
      facture_id TEXT,
      article_id TEXT,
      quantite REAL NOT NULL,
      prix_unitaire REAL NOT NULL,
      remise REAL DEFAULT 0,
      prix_ligne REAL NOT NULL,
      FOREIGN KEY (facture_id) REFERENCES factures(id),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    );

    CREATE TABLE IF NOT EXISTS parametres (
      id TEXT PRIMARY KEY,
      nom_etablissement TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)
}

export function saveDB() {
  if (!db || !dbPath) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export function getDB() {
  return db
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// ===== ECOLES =====
export function getEcoles() {
  const result = db.exec('SELECT * FROM ecoles ORDER BY nom')
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
}

export function addEcole(data) {
  const id = uuid()
  db.run('INSERT INTO ecoles (id, nom, adresse, telephone, email, ifu, groupe) VALUES (?,?,?,?,?,?,?)',
    [id, data.nom, data.adresse, data.telephone, data.email, data.ifu, data.groupe])
  saveDB()
  return id
}

export function updateEcole(id, data) {
  db.run('UPDATE ecoles SET nom=?, adresse=?, telephone=?, email=?, ifu=?, groupe=? WHERE id=?',
    [data.nom, data.adresse, data.telephone, data.email, data.ifu, data.groupe, id])
  saveDB()
}

export function deleteEcole(id) {
  db.run('DELETE FROM ecoles WHERE id=?', [id])
  saveDB()
}

// ===== ARTICLES =====
export function getArticles() {
  const result = db.exec('SELECT * FROM articles ORDER BY nom')
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
}

export function addArticle(data) {
  const id = uuid()
  db.run('INSERT INTO articles (id, nom, description, prix_unitaire, unite) VALUES (?,?,?,?,?)',
    [id, data.nom, data.description, data.prix_unitaire, data.unite])
  saveDB()
  return id
}

export function updateArticle(id, data) {
  db.run('UPDATE articles SET nom=?, description=?, prix_unitaire=?, unite=? WHERE id=?',
    [data.nom, data.description, data.prix_unitaire, data.unite, id])
  saveDB()
}

export function deleteArticle(id) {
  db.run('DELETE FROM articles WHERE id=?', [id])
  saveDB()
}

// ===== FACTURES =====
export function getFactures() {
  const result = db.exec(`
    SELECT f.*, e.nom as ecole_nom 
    FROM factures f 
    LEFT JOIN ecoles e ON f.ecole_id = e.id 
    ORDER BY f.created_at DESC
  `)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row => {
    const obj = Object.fromEntries(columns.map((c, i) => [c, row[i]]))
    obj.ecoles = { nom: obj.ecole_nom }
    return obj
  })
}

export function getFacture(id) {
  const result = db.exec(`
    SELECT f.*, e.nom as ecole_nom, e.adresse as ecole_adresse, 
           e.telephone as ecole_telephone, e.ifu as ecole_ifu
    FROM factures f 
    LEFT JOIN ecoles e ON f.ecole_id = e.id 
    WHERE f.id=?
  `, [id])
  if (!result.length) return null
  const { columns, values } = result[0]
  const obj = Object.fromEntries(columns.map((c, i) => [c, values[0][i]]))
  obj.ecoles = { nom: obj.ecole_nom, adresse: obj.ecole_adresse, telephone: obj.ecole_telephone, ifu: obj.ecole_ifu }
  
  const lignesResult = db.exec(`
    SELECT l.*, a.nom as article_nom, a.unite as article_unite
    FROM lignes_facture l
    LEFT JOIN articles a ON l.article_id = a.id
    WHERE l.facture_id=?
  `, [id])
  
  if (lignesResult.length) {
    const { columns: lc, values: lv } = lignesResult[0]
    obj.lignes_facture = lv.map(row => {
      const l = Object.fromEntries(lc.map((c, i) => [c, row[i]]))
      l.articles = { nom: l.article_nom, unite: l.article_unite }
      return l
    })
  } else {
    obj.lignes_facture = []
  }
  
  return obj
}

export function addFacture(data, lignes) {
  const id = uuid()
  db.run('INSERT INTO factures (id, ecole_id, numero_facture, date_facture, statut, total_ht, tva, total_ttc) VALUES (?,?,?,?,?,?,?,?)',
    [id, data.ecole_id, data.numero_facture, data.date_facture, data.statut, data.total_ht, data.tva, data.total_ttc])
  
  lignes.forEach(l => {
    db.run('INSERT INTO lignes_facture (id, facture_id, article_id, quantite, prix_unitaire, remise, prix_ligne) VALUES (?,?,?,?,?,?,?)',
      [uuid(), id, l.article_id, l.quantite, l.prix_unitaire, l.remise, l.prix_ligne])
  })
  
  saveDB()
  return id
}

export function updateFacture(id, data, lignes) {
  db.run('UPDATE factures SET ecole_id=?, date_facture=?, statut=?, total_ht=?, tva=?, total_ttc=? WHERE id=?',
    [data.ecole_id, data.date_facture, data.statut, data.total_ht, data.tva, data.total_ttc, id])
  
  db.run('DELETE FROM lignes_facture WHERE facture_id=?', [id])
  lignes.forEach(l => {
    db.run('INSERT INTO lignes_facture (id, facture_id, article_id, quantite, prix_unitaire, remise, prix_ligne) VALUES (?,?,?,?,?,?,?)',
      [uuid(), id, l.article_id, l.quantite, l.prix_unitaire, l.remise, l.prix_ligne])
  })
  
  saveDB()
}

export function updateFactureStatut(id, statut) {
  db.run('UPDATE factures SET statut=? WHERE id=?', [statut, id])
  saveDB()
}

export function deleteFacture(id) {
  db.run('DELETE FROM lignes_facture WHERE facture_id=?', [id])
  db.run('DELETE FROM factures WHERE id=?', [id])
  saveDB()
}

// ===== PARAMETRES =====
export function getParametres() {
  const result = db.exec('SELECT * FROM parametres LIMIT 1')
  if (!result.length) return null
  const { columns, values } = result[0]
  return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]))
}

export function setParametres(nom_etablissement) {
  db.run('DELETE FROM parametres')
  db.run('INSERT INTO parametres (id, nom_etablissement) VALUES (?,?)', [uuid(), nom_etablissement])
  saveDB()
}

export function deleteParametres() {
  db.run('DELETE FROM parametres')
  saveDB()
}
