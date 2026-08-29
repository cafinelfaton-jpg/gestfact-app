import { useState, useEffect } from 'react'

export default function Activation({ onActive, bgImage }) {
  const [cle, setCle] = useState('')
  const [machineId, setMachineId] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.db.getMachineId().then(id => setMachineId(id))
  }, [])

  async function activer() {
    if (!cle.trim()) return setErreur('Veuillez entrer une clé d\'activation')
    setLoading(true)
    setErreur('')
    const valide = await window.db.verifierLicence(cle.trim().toUpperCase())
    if (valide) {
      onActive()
    } else {
      setErreur('Clé invalide ou ne correspond pas à ce PC')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }}></div>
      <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 480, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', fontFamily: 'Georgia, serif' }}>Activation requise</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            Cette application nécessite une clé d'activation.<br/>
            Contactez <strong>FATON Cafinel</strong> pour obtenir votre clé.
          </p>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#6b7280' }}>
          <strong>ID de votre PC :</strong>
          <div style={{ fontFamily: 'monospace', color: '#1e3a5f', marginTop: 4, wordBreak: 'break-all' }}>{machineId}</div>
        </div>

        {erreur && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {erreur}
          </div>
        )}

        <input
          style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, outline: 'none', marginBottom: 16, boxSizing: 'border-box', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', fontFamily: 'monospace' }}
          placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
          value={cle}
          onChange={e => setCle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && activer()}
          maxLength={23}
          autoFocus
        />

        <button
          onClick={activer}
          disabled={loading}
          style={{ width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Vérification...' : 'Activer'}
        </button>
      </div>
    </div>
  )
}
