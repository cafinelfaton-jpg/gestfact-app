import { createContext, useContext, useState } from 'react'

const ConfirmContext = createContext()

export function ConfirmProvider({ children }) {
  const [config, setConfig] = useState(null)

  function showConfirm(message) {
    return new Promise(resolve => {
      setConfig({ message, resolve })
    })
  }

  function handleReponse(reponse) {
    if (config) config.resolve(reponse)
    setConfig(null)
  }

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {config && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 400,
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❓</div>
            <p style={{ fontSize: 15, color: '#374151', marginBottom: 24, lineHeight: 1.6 }}>
              {config.message}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => handleReponse(true)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>
                Confirmer
              </button>
              <button
                onClick={() => handleReponse(false)}
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
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
