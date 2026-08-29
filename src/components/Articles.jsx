import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const videForm = { nom: '', description: '', prix_unitaire: '', unite: 'pièce' }

export default function Articles() {
    const [articles, setArticles] = useState([])
    const [form, setForm] = useState(videForm)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { charger() }, [])

    async function charger() {
        const { data } = await supabase.from('articles').select('*').order('nom')
        if (data) setArticles(data)
    }

    async function sauvegarder() {
        if (!form.nom.trim()) return alert('Le nom est obligatoire')
        if (!form.prix_unitaire) return alert('Le prix est obligatoire')
        setLoading(true)
        const payload = { ...form, prix_unitaire: parseFloat(form.prix_unitaire) }
        if (editId) {
            await supabase.from('articles').update(payload).eq('id', editId)
        } else {
            await supabase.from('articles').insert(payload)
        }
        setForm(videForm)
        setEditId(null)
        setLoading(false)
        charger()
    }

    async function supprimer(id) {
        if (!confirm('Supprimer cet article ?')) return
        await supabase.from('articles').delete().eq('id', id)
        charger()
    }

    function editer(a) {
        setEditId(a.id)
        setForm({ nom: a.nom, description: a.description || '', prix_unitaire: a.prix_unitaire, unite: a.unite })
    }

    function annuler() {
        setForm(videForm)
        setEditId(null)
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Catalogue des articles</h1>

            {/* Formulaire */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="text-base font-medium text-gray-700 mb-4">
                    {editId ? 'Modifier l\'article' : 'Ajouter un article'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de l'article *"
                        value={form.nom}
                        onChange={e => setForm({ ...form, nom: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Prix unitaire *"
                            value={form.prix_unitaire}
                            onChange={e => setForm({ ...form, prix_unitaire: e.target.value })}
                        />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.unite}
                            onChange={e => setForm({ ...form, unite: e.target.value })}
                        >
                            <option>pièce</option>
                            <option>carton</option>
                            <option>rame</option>
                            <option>lot</option>
                            <option>kg</option>
                        </select>
                    </div>
                    <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description (optionnel)"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={sauvegarder}
                        disabled={loading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
                    </button>
                    {editId && (
                        <button
                            onClick={annuler}
                            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {articles.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-10">Aucun article enregistré.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nom</th>
                                <th className="text-left px-4 py-3 text-gray-600 font-medium">Description</th>
                                <th className="text-left px-4 py-3 text-gray-600 font-medium">Prix unitaire</th>
                                <th className="text-left px-4 py-3 text-gray-600 font-medium">Unité</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((a, i) => (
                                <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{a.nom}</td>
                                    <td className="px-4 py-3 text-gray-600">{a.description || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{parseFloat(a.prix_unitaire).toLocaleString('fr-FR')} FCFA</td>
                                    <td className="px-4 py-3 text-gray-600">{a.unite}</td>
                                    <td className="px-4 py-3 flex gap-2 justify-end">
                                        <button onClick={() => editer(a)} className="text-blue-600 hover:underline text-xs">Modifier</button>
                                        <button onClick={() => supprimer(a.id)} className="text-red-500 hover:underline text-xs">Supprimer</button>
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