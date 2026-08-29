import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEcoles, getArticles, getFacture, updateFacture } from '../api'

export default function ModifierFacture() {
  const { id } = useParams()
  const [ecoles, setEcoles] = useState([])
  const [articles, setArticles] = useState([])
  const [ecoleId, setEcoleId] = useState('')
  const [lignes, setLignes] = useState([])
  const [tvaRate, setTvaRate] = useState(18)
  const [dateFacture, setDateFacture] = useState('')
  const [statut, setStatut] = useState('brouillon')
  const [numeroFacture, setNumeroFacture] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getEcoles().then(setEcoles)
    getArticles().then(setArticles)
    chargerFacture()
  }, [])

  async function chargerFacture() {
    const data = await getFacture(id)
    if (!data) return
    setEcoleId(data.ecole_id)
    setDateFacture(data.date_facture)
    setStatut(data.statut)
    setNumeroFacture(data.numero_facture)
    setTvaRate(data.total_ht > 0 ? Math.round(data.tva / data.total_ht * 100) : 18)
    setLignes((data.lignes_facture || []).map(l => ({
      id: l.id,
      article_id: l.article_id,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      remise: l.remise || 0,
    })))
  }

  function ajouterLigne() {
    setLignes([...lignes, { article_id: '', quantite: 1, prix_unitaire: 0, remise: 0 }])
  }

  function supprimerLigne(i) {
    setLignes(lignes.filter((_, idx) => idx !== i))
  }

  function modifierLigne(i, champ, val) {
    const nouvelles = [...lignes]
    nouvelles[i][champ] = val
    if (champ === 'article_id') {
      const article = articles.find(a => a.id === val)
      if (article) nouvelles[i].prix_unitaire = parseFloat(article.prix_unitaire)
    }
    setLignes(nouvelles)
  }

  function prixLigne(l) {
    return l.quantite * l.prix_unitaire * (1 - l.remise / 100)
  }

  const totalHT = lignes.reduce((sum, l) => sum + prixLigne(l), 0)
  const tva = totalHT * tvaRate / 100
  const totalTTC = totalHT + tva

  async function sauvegarder() {
    if (!ecoleId) { showAlerte('Sélectionnez une école'); return }
    if (lignes.length === 0) { showAlerte('Ajoutez au moins un article'); return }
    if (lignes.some(l => !l.article_id)) { showAlerte('Sélectionnez un article pour chaque ligne'); return }
    setLoading(true)
    await updateFacture(id, {
      ecole_id: ecoleId,
      date_facture: dateFacture,
      statut,
      total_ht: totalHT,
      tva,
      total_ttc: totalTTC,
    }, lignes.map(l => ({ ...l, prix_ligne: prixLigne(l) })))
    setLoading(false)
    navigate('/factures')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Modifier la facture</h1>
        <button onClick={() => navigate('/factures')} className="text-gray-500 text-sm hover:underline">← Retour</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-base font-medium text-gray-700 mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">N° Facture</label>
            <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 text-gray-400" value={numeroFacture} disabled />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">École *</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" value={ecoleId} onChange={e => setEcoleId(e.target.value)}>
              <option value="">-- Sélectionner une école --</option>
              {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date de facture</label>
            <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" value={dateFacture} onChange={e => setDateFacture(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Statut</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="brouillon">Brouillon</option>
              <option value="envoyée">Envoyée</option>
              <option value="payée">Payée</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-700">Articles</h2>
          <button onClick={ajouterLigne} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">+ Ajouter une ligne</button>
        </div>
        {lignes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucun article.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Article</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Prix unit.</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Qté</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Remise %</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-3 py-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm w-full" value={l.article_id} onChange={e => modifierLigne(i, 'article_id', e.target.value)}>
                      <option value="">-- Article --</option>
                      {articles.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{l.prix_unitaire.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-3 py-2">
                    <input type="number" min="1" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={l.quantite} onChange={e => modifierLigne(i, 'quantite', parseFloat(e.target.value) || 1)} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" max="100" className="border border-gray-300 rounded px-2 py-1 text-sm w-20" value={l.remise} onChange={e => modifierLigne(i, 'remise', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-800">{prixLigne(l).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-3 py-2">
                    <button onClick={() => supprimerLigne(i)} className="text-red-500 hover:underline text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex gap-8">
            <span className="text-gray-600">Total HT</span>
            <span className="font-medium w-40 text-right">{totalHT.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex gap-8 items-center">
            <span className="text-gray-600">TVA</span>
            <div className="flex items-center gap-2 w-40 justify-end">
              <input type="number" min="0" max="100" className="border border-gray-300 rounded px-2 py-1 text-sm w-16 text-center" value={tvaRate} onChange={e => setTvaRate(parseFloat(e.target.value) || 0)} />
              <span className="text-gray-500">%</span>
              <span className="font-medium">{tva.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div className="flex gap-8 border-t border-gray-200 pt-2 mt-1">
            <span className="font-semibold text-gray-800">Total TTC</span>
            <span className="font-bold text-blue-600 w-40 text-right text-base">{totalTTC.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>
      <button onClick={sauvegarder} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </button>
    </div>
  )
}
