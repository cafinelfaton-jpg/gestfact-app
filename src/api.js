function isElectron() {
  return typeof window !== 'undefined' && typeof window.db !== 'undefined'
}

// ===== ECOLES =====
export async function getEcoles() {
  if (isElectron()) return await window.db.getEcoles()
  const { supabase } = await import('./supabaseClient')
  const { data } = await supabase.from('ecoles').select('*').order('nom')
  return data || []
}

export async function addEcole(data) {
  if (isElectron()) return await window.db.addEcole(data)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('ecoles').insert(data)
}

export async function updateEcole(id, data) {
  if (isElectron()) return await window.db.updateEcole(id, data)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('ecoles').update(data).eq('id', id)
}

export async function deleteEcole(id) {
  if (isElectron()) return await window.db.deleteEcole(id)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('ecoles').delete().eq('id', id)
}

// ===== ARTICLES =====
export async function getArticles() {
  if (isElectron()) return await window.db.getArticles()
  const { supabase } = await import('./supabaseClient')
  const { data } = await supabase.from('articles').select('*').order('nom')
  return data || []
}

export async function addArticle(data) {
  if (isElectron()) return await window.db.addArticle(data)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('articles').insert(data)
}

export async function updateArticle(id, data) {
  if (isElectron()) return await window.db.updateArticle(id, data)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('articles').update(data).eq('id', id)
}

export async function deleteArticle(id) {
  if (isElectron()) return await window.db.deleteArticle(id)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('articles').delete().eq('id', id)
}

// ===== FACTURES =====
export async function getFactures() {
  if (isElectron()) return await window.db.getFactures()
  const { supabase } = await import('./supabaseClient')
  const { data } = await supabase.from('factures').select('*, ecoles(nom)').order('created_at', { ascending: false })
  return data || []
}

export async function getFacture(id) {
  if (isElectron()) return await window.db.getFacture(id)
  const { supabase } = await import('./supabaseClient')
  const { data } = await supabase.from('factures').select('*, ecoles(*), lignes_facture(*, articles(*))').eq('id', id).single()
  return data
}

export async function addFacture(data, lignes) {
  if (isElectron()) return await window.db.addFacture(data, lignes)
  const { supabase } = await import('./supabaseClient')
  const { data: facture } = await supabase.from('factures').insert(data).select().single()
  await supabase.from('lignes_facture').insert(lignes.map(l => ({ ...l, facture_id: facture.id })))
  return facture.id
}

export async function updateFacture(id, data, lignes) {
  if (isElectron()) return await window.db.updateFacture(id, data, lignes)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('factures').update(data).eq('id', id)
  await supabase.from('lignes_facture').delete().eq('facture_id', id)
  await supabase.from('lignes_facture').insert(lignes.map(l => ({ ...l, facture_id: id })))
}

export async function updateFactureStatut(id, statut) {
  if (isElectron()) return await window.db.updateFactureStatut(id, statut)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('factures').update({ statut }).eq('id', id)
}

export async function deleteFacture(id) {
  if (isElectron()) return await window.db.deleteFacture(id)
  const { supabase } = await import('./supabaseClient')
  await supabase.from('factures').delete().eq('id', id)
}

// ===== PARAMETRES =====
export async function getParametres() {
  if (isElectron()) return await window.db.getParametres()
  const { supabase } = await import('./supabaseClient')
  try {
    const { data } = await supabase.from('parametres').select('*').limit(1).single()
    return data
  } catch {
    return null
  }
}

export async function setParametres(data) {
  if (isElectron()) return await window.db.setParametres(data)
}
export async function deleteParametres() {
  if (isElectron()) return await window.db.deleteParametres()
  const { supabase } = await import('./supabaseClient')
  await supabase.from('parametres').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

export async function getObjets() {
  if (isElectron()) return await window.db.getObjets()
  return []
}

export async function addObjet(nom) {
  if (isElectron()) return await window.db.addObjet(nom)
}

export async function deleteObjet(id) {
  if (isElectron()) return await window.db.deleteObjet(id)
}
export async function getObjetFacture(facture_id) {
  if (isElectron()) return await window.db.getObjetFacture(facture_id)
  return null
}

export async function setObjetFacture(facture_id, objet_id) {
  if (isElectron()) return await window.db.setObjetFacture(facture_id, objet_id)
}
export async function getMotDePasse() {
  if (isElectron()) return await window.db.getMotDePasse()
  return null
}

export async function setMotDePasse(mdp) {
  if (isElectron()) return await window.db.setMotDePasse(mdp)
}

export async function supprimerMotDePasse() {
  if (isElectron()) return await window.db.supprimerMotDePasse()
}
export async function getProchainNumero() {
  if (isElectron()) return await window.db.getProchainNumero()
  return 'FAC-' + Date.now()
}

export async function dupliquerFacture(id) {
  if (isElectron()) return await window.db.dupliquerFacture(id)
}