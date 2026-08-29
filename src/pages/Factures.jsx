import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { genererPDF } from '../utils/genererPDF'
import { getFactures, deleteFacture, updateFactureStatut, getFacture, getEcoles } from '../api'
import { useConfirm } from '../components/Confirmation'
export default function Factures() {
  const { showConfirm } = useConfirm()
  const [factures, setFactures] = useState([])
  const navigate = useNavigate()
  const [ecoles, setEcoles] = useState([])
  const [showDupliquer, setShowDupliquer] = useState(null)
  const [ecoleIdDup, setEcoleIdDup] = useState('')
  const [typeDocDup, setTypeDocDup] = useState('proforma')

  useEffect(() => {
    charger()
    getEcoles().then(setEcoles)
  }, [])

  async function charger() {
    const data = await getFactures()
    setFactures(data)
  }

  async function supprimer(id) {
    const ok = await showConfirm('Supprimer cette facture ?')
    if (!ok) return
    await deleteFacture(id)
    charger()
  }

  async function telechargerPDF(id) {
    const data = await getFacture(id)
    const params = await window.db.getParametres()
    console.log('params:', params)
    console.log('data:', data)
    if (data) genererPDF(data, params)
  }

  async function changerStatut(id, statut) {
    await updateFactureStatut(id, statut)
    charger()
  }

  async function confirmerDuplication() {
    if (!ecoleIdDup) { showAlerte('Sélectionnez une école'); return }
    await window.db.dupliquerFacture(showDupliquer, ecoleIdDup, typeDocDup)
    setShowDupliquer(null)
    charger()
  }

  const statutColor = {
    brouillon: 'bg-gray-100 text-gray-600',
    envoyée: 'bg-blue-100 text-blue-600',
    payée: 'bg-green-100 text-green-600',
  }

  const typeLabel = {
    proforma: '📄 Proforma',
    simple: '🧾 Simple',
    bordereau: '📦 Bordereau',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Factures</h1>
        <button onClick={() => navigate('/factures/nouvelle')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nouvelle facture
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {factures.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Aucune facture enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">N° Facture</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">École</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Total TTC</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f, i) => (
                <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">{f.numero_facture}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{typeLabel[f.type_document] || '📄 Proforma'}</td>
                  <td className="px-4 py-3 text-gray-600">{f.ecoles?.nom || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(f.date_facture).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-gray-600">{parseFloat(f.total_ttc).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3">
                    <select
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statutColor[f.statut]}`}
                      value={f.statut}
                      onChange={e => changerStatut(f.id, e.target.value)}
                    >
                      <option value="brouillon">brouillon</option>
                      <option value="envoyée">envoyée</option>
                      <option value="payée">payée</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => telechargerPDF(f.id)} className="text-blue-600 hover:underline text-xs">PDF</button>
                    <button onClick={() => navigate(`/factures/modifier/${f.id}`)} className="text-green-600 hover:underline text-xs">Modifier</button>
                    <button onClick={() => { setShowDupliquer(f.id); setEcoleIdDup(''); setTypeDocDup(f.type_document || 'proforma') }} className="text-purple-600 hover:underline text-xs">Dupliquer</button>
                    <button onClick={() => supprimer(f.id)} className="text-red-500 hover:underline text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal duplication */}
      {showDupliquer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 420 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dupliquer la facture</h2>

            <label className="block text-xs text-gray-500 mb-1">École destinataire</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={ecoleIdDup}
              onChange={e => setEcoleIdDup(e.target.value)}
            >
              <option value="">-- Sélectionner une école --</option>
              {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>

            <label className="block text-xs text-gray-500 mb-2">Type de document</label>
            <div className="flex gap-2 mb-6">
              {[
                { val: 'proforma', label: '📄 Proforma' },
                { val: 'simple', label: '🧾 Simple' },
                { val: 'bordereau', label: '📦 Bordereau' },
              ].map(t => (
                <button key={t.val} onClick={() => setTypeDocDup(t.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${typeDocDup === t.val ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={confirmerDuplication}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex-1">
                Confirmer
              </button>
              <button onClick={() => setShowDupliquer(null)}
                className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
