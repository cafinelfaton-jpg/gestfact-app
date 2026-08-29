import { createContext, useContext, useState, useEffect } from 'react'

const AlerteContext = createContext()

export function AlerteProvider({ children }) {
  const [alerte, setAlerte] = useState('')

  useEffect(() => {
    if (alerte) {
      const t = setTimeout(() => setAlerte(''), 4000)
      return () => clearTimeout(t)
    }
  }, [alerte])

  return (
    <AlerteContext.Provider value={{ showAlerte: setAlerte }}>
      {children}
      {alerte && (
        <div style={{
          position: 'fixed', top: 24, left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e3a5f', color: 'white',
          padding: '14px 28px', borderRadius: 12,
          fontSize: 14, fontWeight: 500,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          zIndex: 99999, maxWidth: 420, textAlign: 'center',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>⚠️ {alerte}</span>
          <button onClick={() => setAlerte('')}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 18 }}>
            ×
          </button>
        </div>
      )}
    </AlerteContext.Provider>
  )
}

export function useAlerte() {
  return useContext(AlerteContext)
}
