import { useEffect } from 'react'

export default function Alerte({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#1e3a5f', color: 'white', padding: '14px 24px',
      borderRadius: 10, fontSize: 14, fontWeight: 500,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 99999, maxWidth: 400, textAlign: 'center',
      animation: 'slideDown 0.3s ease'
    }}>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }`}</style>
      ⚠️ {message}
      <button onClick={onClose} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  )
}
