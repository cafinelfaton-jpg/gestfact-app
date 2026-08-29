import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFactures } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, brouillon: 0, envoyee: 0, payee: 0, montantMois: 0 })
  const [dernieres, setDernieres] = useState([])
  const navigate = useNavigate()

  useEffect(() => { charger() }, [])

  async function charger() {
    const data = await getFactures()
    if (!data) return
    const now = new Date()
    const montantMois = data
      .filter(f => new Date(f.created_at).getMonth() === now.getMonth())
      .reduce((sum, f) => sum + parseFloat(f.total_ttc || 0), 0)
    setStats({
      total: data.length,
      brouillon: data.filter(f => f.statut === 'brouillon').length,
      envoyee: data.filter(f => f.statut === 'envoyée').length,
      payee: data.filter(f => f.statut === 'payée').length,
      montantMois,
    })
    setDernieres(data.slice(0, 5))
  }

  const cartes = [
    { label: 'Total factures', value: stats.total, couleur: '#2563eb', bg: '#eff6ff', icon: '🧾' },
    { label: 'Brouillons', value: stats.brouillon, couleur: '#6b7280', bg: '#f9fafb', icon: '📝' },
    { label: 'Envoyées', value: stats.envoyee, couleur: '#0891b2', bg: '#ecfeff', icon: '📤' },
    { label: 'Payées', value: stats.payee, couleur: '#16a34a', bg: '#f0fdf4', icon: '✅' },
  ]

  const statutStyle = {
    brouillon: { bg: '#f3f4f6', color: '#6b7280' },
    envoyée: { bg: '#dbeafe', color: '#2563eb' },
    payée: { bg: '#dcfce7', color: '#16a34a' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <button onClick={() => navigate('/factures/nouvelle')}
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          className="text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
          + Nouvelle facture
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cartes.map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg, borderLeft: `4px solid ${c.couleur}` }}
            className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p style={{ color: c.couleur }} className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
        className="rounded-2xl p-6 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200 mb-1">💰 Chiffre d'affaires du mois</p>
            <p className="text-4xl font-bold">{stats.montantMois.toLocaleString('fr-FR')} <span className="text-2xl font-normal text-blue-200">FCFA</span></p>
          </div>
          <div className="text-6xl opacity-20">📈</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700">🕐 Dernières factures</h2>
          <button onClick={() => navigate('/factures')} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">Voir tout →</button>
        </div>
        {dernieres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 text-sm">Aucune facture enregistrée.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f8fafc' }} className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">N° Facture</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">École</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Total TTC</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {dernieres.map((f, i) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-800">{f.numero_facture}</td>
                  <td className="px-6 py-4 text-gray-600">{f.ecoles?.nom || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{parseFloat(f.total_ttc).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4">
                    <span style={{ backgroundColor: statutStyle[f.statut]?.bg, color: statutStyle[f.statut]?.color }}
                      className="px-3 py-1 rounded-full text-xs font-semibold">{f.statut}</span>
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
