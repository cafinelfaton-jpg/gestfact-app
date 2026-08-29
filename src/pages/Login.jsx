import { useState, useEffect } from 'react'
import { getMotDePasse } from '../api'

export default function Login({ onConnecte, bgImage, nomEtablissement = 'GestFact' }) {
  const [mdp, setMdp] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  async function verifier() {
    if (!mdp.trim()) return setErreur('Veuillez entrer le mot de passe')
    setLoading(true)
    setErreur('')
    const data = await getMotDePasse()
    if (data && data.mot_de_passe === mdp) {
      onConnecte()
    } else {
      setErreur('Mot de passe incorrect')
    }
    setLoading(false)
  }
  const [showRecuperation, setShowRecuperation] = useState(false)
  const [codeRec, setCodeRec] = useState('')
  const [erreurRec, setErreurRec] = useState('')
  const [machineId, setMachineId] = useState('')

  useEffect(() => {
    if (window.db && window.db.getMachineId) {
      window.db.getMachineId().then(id => setMachineId(id))
    }
  }, [])

  async function recuperer() {
    if (!codeRec.trim()) return setErreurRec('Entrez le code de récupération')
    const ok = await window.db.recupererMotDePasse(codeRec.trim().toUpperCase())
    if (ok) {
      showAlerte('Mot de passe réinitialisé ! Vous pouvez maintenant définir un nouveau mot de passe dans Sécurité.')
      onConnecte()
    } else {
      setErreurRec('Code incorrect')
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }}></div>

      <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Georgia, serif' }}>{nomEtablissement}</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Entrez votre mot de passe pour continuer</p>
        </div>

        {erreur && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {erreur}
          </div>
        )}

        <input
          type="password"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
          placeholder="Mot de passe"
          value={mdp}
          onChange={e => setMdp(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verifier()}
          autoFocus
        />

        <button
          onClick={verifier}
          disabled={loading}
          style={{ width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Vérification...' : 'Se connecter'}
        </button>

        <button
          onClick={() => setShowRecuperation(!showRecuperation)}
          style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
          Mot de passe oublié ?
        </button>

        {showRecuperation && (
          <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
              Contactez <strong>FATON Cafinel</strong> avec votre ID PC :
            </p>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#1e3a5f', background: '#e8f0fe', padding: '6px 10px', borderRadius: 6, marginBottom: 12, wordBreak: 'break-all' }}>
              {machineId}
            </p>
            {erreurRec && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>{erreurRec}</p>}
            <input
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'monospace' }}
              placeholder="RST-XXXX-XXXX-XXXX-XXXX"
              value={codeRec}
              onChange={e => setCodeRec(e.target.value)}
              maxLength={23}
            />
            <button
              onClick={recuperer}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: '#1e3a5f', color: 'white', fontSize: 13, cursor: 'pointer' }}>
              Valider le code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}