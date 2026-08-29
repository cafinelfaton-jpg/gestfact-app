import { useConfirm } from '../components/Confirmation'
import { useEffect, useState } from 'react'
import { getEcoles, addEcole, updateEcole, deleteEcole } from '../api'

const videForm = { nom: '', adresse: '', telephone: '', email: '', ifu: '', groupe: '' }

export default function Ecoles() {
  const { showConfirm } = useConfirm()
  const [ecoles, setEcoles] = useState([])
  const [form, setForm] = useState(videForm)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { charger() }, [])

  async function charger() {
    const data = await getEcoles()
    setEcoles(data)
  }

  async function sauvegarder() {
    if (!form.nom.trim()) { showAlerte('Le nom est obligatoire'); return }
    setLoading(true)
    if (editId) {
      await updateEcole(editId, form)
    } else {
      await addEcole(form)
    }
    setForm(videForm)
    setEditId(null)
    setLoading(false)
    charger()
  }

  async function supprimer(id) {
    const ok = await showConfirm('Supprimer cette école ?')
    if (!ok) return
    await deleteEcole(id)
    charger()
  }

  function editer(ecole) {
    setEditId(ecole.id)
    setForm({ nom: ecole.nom, adresse: ecole.adresse || '', telephone: ecole.telephone || '', email: ecole.email || '', ifu: ecole.ifu || '', groupe: ecole.groupe || '' })
  }

  function annuler() {
    setForm(videForm)
    setEditId(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Gestion des écoles</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-medium text-gray-700 mb-4">
          {editId ? "Modifier l'école" : "Ajouter une école"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom de l'école *" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          <div className="flex gap-2">
            <span className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 flex items-center">+229</span>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="01 00 00 00 00"
              value={form.telephone.replace('+229', '')}
              maxLength={10}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                setForm({ ...form, telephone: '+229' + val })
              }}
            />
          </div>
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="IFU" value={form.ifu} onChange={e => setForm({ ...form, ifu: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Groupe (ex: Groupe A/B)" value={form.groupe} onChange={e => setForm({ ...form, groupe: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={sauvegarder} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && <button onClick={annuler} className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Annuler</button>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {ecoles.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">Aucune école enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Téléphone</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Adresse</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">IFU</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Groupe</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ecoles.map((e, i) => (
                <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{e.telephone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.adresse || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.ifu || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.groupe || '—'}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button onClick={() => editer(e)} className="text-blue-600 hover:underline text-xs">Modifier</button>
                    <button onClick={() => supprimer(e.id)} className="text-red-500 hover:underline text-xs">Supprimer</button>
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
