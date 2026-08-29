import { useEffect, useState } from 'react'
import { getObjets, addObjet, deleteObjet } from '../api'
import { useConfirm } from '../components/Confirmation'
export default function Objets() {
  const { showConfirm } = useConfirm()
  const [objets, setObjets] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { charger() }, [])

  async function charger() {
    const data = await getObjets()
    setObjets(data)
  }

  async function ajouter() {
    if (!input.trim()) { showAlerte('Veuillez entrer un objet'); return }
    setLoading(true)
    await addObjet(input.trim())
    setInput('')
    setLoading(false)
    charger()
  }

  async function supprimer(id) {
    const ok = await showConfirm('Supprimer cet objet ?')
    if (!ok) return
    await deleteObjet(id)
    charger()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Objets de facture</h1>

      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-medium text-gray-700 mb-4">Ajouter un objet</h2>
        <div className="flex gap-3">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Fournitures Scolaires"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ajouter()}
          />
          <button
            onClick={ajouter}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {objets.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Aucun objet enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Objet</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {objets.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-800">{o.nom}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => supprimer(o.id)} className="text-red-500 hover:underline text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
