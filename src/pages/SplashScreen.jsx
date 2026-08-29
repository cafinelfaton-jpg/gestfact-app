import { useEffect, useState } from 'react'
import { getParametres, setParametres } from '../api'

export default function SplashScreen({ onTermine, bgImage = '/bg-splash.jpg' }) {
  const [nomEtablissement, setNomEtablissement] = useState('')
  const [input, setInput] = useState('')
  const [rccm, setRccm] = useState('')
  const [ifuEts, setIfuEts] = useState('')
  const [tel1, setTel1] = useState('')
  const [tel2, setTel2] = useState('')
  const [estConfigure, setEstConfigure] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    setEstConfigure(false)
    setNomEtablissement('')
    setTimeout(() => charger(), 800)
  }, [])

  async function charger() {
    try {
      const data = await getParametres()
      if (data && data.nom_etablissement) {
        setNomEtablissement(data.nom_etablissement)
        setEstConfigure(true)
        setTimeout(() => onTermine(data.nom_etablissement), 3000)
      }
    } catch (e) {
      console.error('Erreur:', e)
    }
    setLoading(false)
  }

  async function configurer() {
    if (!input.trim()) { showAlerte('Veuillez entrer le nom de votre établissement'); return }
    setSaving(true)
    try {
      await setParametres({
        nom_etablissement: input.trim(),
        rccm: rccm.trim(),
        ifu: ifuEts.trim(),
        telephone1: tel1.trim(),
        telephone2: tel2.trim(),
      })
      setNomEtablissement(input.trim())
      setEstConfigure(true)
      setTimeout(() => onTermine(input.trim()), 3000)
    } catch(e) {
      console.error('Erreur setParametres:', e)
      showAlerte('Erreur lors de la sauvegarde. Réessayez.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)' }}></div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', padding: '0 32px', width: '100%', maxWidth: 500, overflowY: 'auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>

        {estConfigure ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', color: '#93c5fd', fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>Bienvenue</p>
            <p style={{ fontFamily: 'Georgia, serif', color: 'white', fontSize: 32, fontWeight: 600 }}>{nomEtablissement}</p>
            <p style={{ color: '#93c5fd', fontSize: 14, marginTop: 24 }}>Chargement en cours...</p>
          </div>
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', color: 'white', fontSize: 18, marginBottom: 20, fontWeight: 600 }}>
              Bienvenue ! Configurez votre établissement
            </p>

            <input
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 15, textAlign: 'center', fontFamily: 'Georgia, serif', marginBottom: 10, outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.95)' }}
              placeholder="Nom de votre établissement *"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <input
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 14, textAlign: 'center', fontFamily: 'Georgia, serif', marginBottom: 10, outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)' }}
              placeholder="RCCM (ex: RB/COT/20 A 64388)"
              value={rccm}
              onChange={e => setRccm(e.target.value)}
            />
            <input
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 14, textAlign: 'center', fontFamily: 'Georgia, serif', marginBottom: 10, outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)' }}
              placeholder="N° IFU"
              value={ifuEts}
              onChange={e => setIfuEts(e.target.value)}
            />
            <input
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 14, textAlign: 'center', fontFamily: 'Georgia, serif', marginBottom: 10, outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)' }}
              placeholder="Téléphone 1"
              value={tel1}
              onChange={e => setTel1(e.target.value)}
            />
            <input
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 14, textAlign: 'center', fontFamily: 'Georgia, serif', marginBottom: 16, outline: 'none', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)' }}
              placeholder="Téléphone 2 (optionnel)"
              value={tel2}
              onChange={e => setTel2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && configurer()}
            />
            <button
              onClick={configurer}
              disabled={saving}
              style={{ width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none', background: 'white', color: '#1e3a5f', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              {saving ? 'Enregistrement...' : 'Confirmer'}
            </button>
          </div>
        )}
      </div>

      <div style={{ width: '100%', background: 'rgba(0,0,0,0.7)', padding: '12px 0', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div className="animate-marquee" style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
          <span style={{ fontFamily: 'Georgia, serif', color: '#93c5fd', fontSize: 14, letterSpacing: 2 }}>
            ✦ &nbsp;&nbsp; Réalisé par FATON Cafinel &nbsp;&nbsp; ✦ &nbsp;&nbsp; Réalisé par FATON Cafinel &nbsp;&nbsp; ✦ &nbsp;&nbsp; Réalisé par FATON Cafinel &nbsp;&nbsp; ✦
          </span>
        </div>
      </div>
    </div>
  )
}
