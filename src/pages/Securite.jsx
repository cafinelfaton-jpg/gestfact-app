import { useEffect, useState } from 'react'
import { getMotDePasse, setMotDePasse, supprimerMotDePasse } from '../api'
import { useConfirm } from '../components/Confirmation'
export default function Securite() {
  const { showConfirm } = useConfirm()
  const [aMotDePasse, setAMotDePasse] = useState(false)
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmer, setConfirmer] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => { charger() }, [])

  async function charger() {
    const data = await getMotDePasse()
    setAMotDePasse(!!data)
  }

  async function sauvegarder() {
    setMessage('')
    setErreur('')
    if (!nouveau.trim()) return setErreur('Le nouveau mot de passe est obligatoire')
    if (nouveau !== confirmer) return setErreur('Les mots de passe ne correspondent pas')
    if (nouveau.length < 4) return setErreur('Le mot de passe doit contenir au moins 4 caractères')

    if (aMotDePasse) {
      const data = await getMotDePasse()
      if (data.mot_de_passe !== ancien) return setErreur('Ancien mot de passe incorrect')
    }

    await setMotDePasse(nouveau)
    setAncien('')
    setNouveau('')
    setConfirmer('')
    setAMotDePasse(true)
    setMessage('Mot de passe enregistré avec succès !')
  }

  async function supprimer() {
    const ok = await showConfirm('Supprimer le mot de passe ? L\'application ne sera plus protégée.')
    if (!ok) return
    const data = await getMotDePasse()
    if (data.mot_de_passe !== ancien) return setErreur('Mot de passe incorrect')
    await supprimerMotDePasse()
    setAMotDePasse(false)
    setAncien('')
    setMessage('Mot de passe supprimé.')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">🔒 Sécurité</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
        <h2 className="text-base font-medium text-gray-700 mb-2">
          {aMotDePasse ? 'Modifier le mot de passe' : 'Définir un mot de passe'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {aMotDePasse
            ? 'Un mot de passe protège l\'accès à l\'application.'
            : 'Aucun mot de passe défini. L\'application est accessible sans restriction.'}
        </p>

        {message && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-2 text-sm mb-4">{message}</div>}
        {erreur && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">{erreur}</div>}

        <div className="flex flex-col gap-3">
          {aMotDePasse && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ancien mot de passe</label>
              <input
                type="password"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={ancien}
                onChange={e => setAncien(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nouveau}
              onChange={e => setNouveau(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmer}
              onChange={e => setConfirmer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sauvegarder()}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={sauvegarder}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {aMotDePasse ? 'Modifier' : 'Définir'}
            </button>
            {aMotDePasse && (
              <button
                onClick={supprimer}
                className="border border-red-300 text-red-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
