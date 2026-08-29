import { useAlerte } from '../context/AlerteContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEcoles, getArticles, addFacture, getObjets, setObjetFacture, getProchainNumero } from '../api'

export default function NouvelleFacture() {
  const [ecoles, setEcoles] = useState([])
  const [articles, setArticles] = useState([])
  const [objets, setObjets] = useState([])
  const [ecoleId, setEcoleId] = useState('')
  const [objetId, setObjetId] = useState('')
  const [lignes, setLignes] = useState([])
  const [tvaRate, setTvaRate] = useState(1)
  const [typeTaxe, setTypeTaxe] = useState('AIB')
  const [loading, setLoading] = useState(false)
  const [typeDocument, setTypeDocument] = useState('proforma')
  const [numeroManuel, setNumeroManuel] = useState('')
  const navigate = useNavigate()
  const { showAlerte } = useAlerte()
  
  useEffect(() => {
    getEcoles().then(setEcoles)
    getArticles().then(setArticles)
    getObjets().then(setObjets)
  }, [])

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
    if (typeDocument === 'bordereau') return 0
    return l.quantite * l.prix_unitaire * (1 - (l.remise || 0) / 100)
  }

  const totalHT = lignes.reduce((sum, l) => sum + prixLigne(l), 0)
  const taxe = typeTaxe === 'Exonéré' ? 0 : totalHT * tvaRate / 100
  const totalTTC = totalHT + taxe
  const isBordereau = typeDocument === 'bordereau'

  async function sauvegarder() {
    if (!ecoleId) return showAlerte('Sélectionnez une école')
    if (lignes.length === 0) return showAlerte('Ajoutez au moins un article')
    if (lignes.some(l => !l.article_id)) return showAlerte('Sélectionnez un article pour chaque ligne')
    setLoading(true)
    const numero = (isBordereau && numeroManuel.trim())
      ? numeroManuel.trim()
      : await getProchainNumero()
    const factureId = await addFacture({
      ecole_id: ecoleId,
      numero_facture: numero,
      date_facture: new Date().toISOString().split('T')[0],
      total_ht: totalHT,
      tva: taxe,
      total_ttc: totalTTC,
      statut: 'brouillon',
      type_document: typeDocument,
      type_taxe: typeTaxe
    }, lignes.map(l => ({ ...l, prix_ligne: prixLigne(l) })))
    if (objetId) await setObjetFacture(factureId, objetId)
    setLoading(false)
    navigate('/factures')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Nouvelle facture</h1>
        <button onClick={() => navigate('/factures')} className="text-gray-500 text-sm hover:underline">← Retour</button>
      </div>

      {/* Type de document */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Type de document *</label>
        <div className="flex gap-3 flex-wrap">
          {[
            { val: 'proforma', label: '📄 Facture Proforma' },
            { val: 'simple', label: '🧾 Facture Simple' },
            { val: 'bordereau', label: '📦 Bordereau de livraison' },
          ].map(t => (
            <button key={t.val} onClick={() => setTypeDocument(t.val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${typeDocument === t.val ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numéro manuel pour bordereau */}
      {isBordereau && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de référence (optionnel)</label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 00001/ETS GESTFACT PREM/2026-2027"
            value={numeroManuel}
            onChange={e => setNumeroManuel(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Laissez vide pour générer automatiquement</p>
        </div>
      )}

      {/* École */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">École *</label>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={ecoleId} onChange={e => setEcoleId(e.target.value)}>
          <option value="">-- Sélectionner une école --</option>
          {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
      </div>

      {/* Objet */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Objet de la facture</label>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={objetId} onChange={e => setObjetId(e.target.value)}>
          <option value="">-- Sélectionner un objet --</option>
          {objets.map(o => <option key={o.id} value={o.id}>{o.nom}</option>)}
        </select>
      </div>

      {/* Articles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-700">Articles</h2>
          <button onClick={ajouterLigne} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">+ Ajouter une ligne</button>
        </div>
        {lignes.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucun article ajouté.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Article</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">Qté</th>
                {!isBordereau && <th className="text-left px-3 py-2 text-gray-600 font-medium">Prix unit.</th>}
                {!isBordereau && <th className="text-left px-3 py-2 text-gray-600 font-medium">Remise %</th>}
                {!isBordereau && <th className="text-left px-3 py-2 text-gray-600 font-medium">Total</th>}
                {isBordereau && <th className="text-left px-3 py-2 text-gray-600 font-medium">Observations</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-3 py-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      value={l.article_id} onChange={e => modifierLigne(i, 'article_id', e.target.value)}>
                      <option value="">-- Article --</option>
                      {articles.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="1" className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                      value={l.quantite} onChange={e => modifierLigne(i, 'quantite', parseFloat(e.target.value) || 1)} />
                  </td>
                  {!isBordereau && <td className="px-3 py-2 text-gray-600">{l.prix_unitaire.toLocaleString('fr-FR')} FCFA</td>}
                  {!isBordereau && (
                    <td className="px-3 py-2">
                      <input type="number" min="0" max="100" className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                        value={l.remise} onChange={e => modifierLigne(i, 'remise', parseFloat(e.target.value) || 0)} />
                    </td>
                  )}
                  {!isBordereau && <td className="px-3 py-2 font-medium text-gray-800">{prixLigne(l).toLocaleString('fr-FR')} FCFA</td>}
                  {isBordereau && <td className="px-3 py-2 text-gray-400 text-xs italic">—</td>}
                  <td className="px-3 py-2">
                    <button onClick={() => supprimerLigne(i)} className="text-red-500 hover:underline text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totaux — seulement si pas bordereau */}
      {!isBordereau && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex gap-8">
              <span className="text-gray-600">Total HT</span>
              <span className="font-medium w-40 text-right">{totalHT.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex gap-8 items-center">
              <select className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={typeTaxe} onChange={e => setTypeTaxe(e.target.value)}>
                <option>AIB</option>
                <option>TVA</option>
                <option>TPS</option>
                <option>Exonéré</option>
              </select>
              <div className="flex items-center gap-2 w-40 justify-end">
                {typeTaxe !== 'Exonéré' && (
                  <>
                    <input type="number" min="0" max="100" className="border border-gray-300 rounded px-2 py-1 text-sm w-16 text-center"
                      value={tvaRate} onChange={e => setTvaRate(parseFloat(e.target.value) || 0)} />
                    <span className="text-gray-500">%</span>
                  </>
                )}
                <span className="font-medium">{taxe.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            <div className="flex gap-8 border-t border-gray-200 pt-2 mt-1">
              <span className="font-semibold text-gray-800">Total TTC</span>
              <span className="font-bold text-blue-600 w-40 text-right text-base">{totalTTC.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>
      )}

      <button onClick={sauvegarder} disabled={loading}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  )
}
