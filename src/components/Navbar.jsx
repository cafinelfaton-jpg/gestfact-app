import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar({ nomEtablissement, onReset }) {
  const location = useLocation()
  const [showConfirm, setShowConfirm] = useState(false)

  const links = [
    { to: '/', label: '🏠 Accueil' },
    { to: '/ecoles', label: '🏫 Écoles' },
    { to: '/articles', label: '📦 Articles' },
    { to: '/factures', label: '🧾 Factures' },
    { to: '/objets', label: '📋 Objets' },
    { to: '/securite', label: '🔒 Sécurité' },
  ]

  async function confirmerReset() {
    setShowConfirm(false)
    await onReset()
  }

  return (
    <>
      <nav style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
        className="px-6 py-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">
              📋
            </div>
            <span style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
              className="font-bold text-white text-xl tracking-wide">
              {nomEtablissement || 'GestFact'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-15'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setShowConfirm(true)}
              className="text-blue-200 hover:text-white text-sm ml-2 opacity-70 hover:opacity-100 transition-all"
              title="Changer d'établissement"
            >
              ⚙️
            </button>
          </div>
        </div>
      </nav>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 8 }}>
                Changer d'établissement
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Cela effacera le nom et les informations de l'établissement actuel. Voulez-vous continuer ?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={confirmerReset}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8,
                  border: '1px solid #d1d5db', background: 'white',
                  color: '#6b7280', fontSize: 14, cursor: 'pointer'
                }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
