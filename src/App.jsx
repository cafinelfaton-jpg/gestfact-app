import { HashRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Ecoles from './pages/Ecoles'
import Articles from './pages/Articles'
import Factures from './pages/Factures'
import NouvelleFacture from './pages/NouvelleFacture'
import ModifierFacture from './pages/ModifierFacture'
import SplashScreen from './pages/SplashScreen'
import Objets from './pages/Objets'
import Login from './pages/Login'
import Securite from './pages/Securite'
import { getMotDePasse, deleteParametres } from './api'
import Activation from './pages/Activation'
import Alerte from './components/Alerte'
import { AlerteProvider } from './context/AlerteContext'
import { ConfirmProvider } from './components/Confirmation'
function App() {
  const [splashTermine, setSplashTermine] = useState(false)
  const [nomEtablissement, setNomEtablissement] = useState('')
  const [connecte, setConnecte] = useState(false)
  const [aMotDePasse, setAMotDePasse] = useState(false)
  const [alerte, setAlerte] = useState('')
  const isDev = window.location.href.includes('localhost')
  const bgSplash = isDev ? '/bg-splash.jpg' : 'appimg://bg-splash.jpg'
  const bgApp = isDev ? '/bg-app.jpg' : 'appimg://bg-app.jpg'
  const [active, setActive] = useState(false)
  const [licenceVerifiee, setLicenceVerifiee] = useState(false)
  useEffect(() => {
    async function verif() {
      if (window.db && window.db.estLicenceValide) {
        const valide = await window.db.estLicenceValide()
        setActive(valide)
      }
      setLicenceVerifiee(true)
    }
    verif()
  }, [])
  if (!licenceVerifiee) return null

  if (!active) {
    return <Activation onActive={() => setActive(true)} bgImage={bgSplash} />
  }
  async function handleSplashTermine(nom) {
    setNomEtablissement(nom)
    const mdp = await getMotDePasse()
    setAMotDePasse(!!mdp)
    setSplashTermine(true)
  }

  async function handleReset() {
    await deleteParametres()
    setNomEtablissement('')
    setConnecte(false)
    setAMotDePasse(false)
    setSplashTermine(false)
  }


  if (!splashTermine) {
    return <SplashScreen onTermine={handleSplashTermine} bgImage={bgSplash} />
  }

  if (aMotDePasse && !connecte) {
    return <Login onConnecte={() => setConnecte(true)} bgImage={bgSplash} nomEtablissement={nomEtablissement} />
  }

  return (
  <AlerteProvider>
    <ConfirmProvider>
      <HashRouter>
        <div className="min-h-screen" style={{ backgroundImage: `url('${bgApp}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <Navbar nomEtablissement={nomEtablissement} onReset={handleReset} />
          <main className="max-w-5xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ecoles" element={<Ecoles />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/factures" element={<Factures />} />
              <Route path="/factures/nouvelle" element={<NouvelleFacture />} />
              <Route path="/factures/modifier/:id" element={<ModifierFacture />} />
              <Route path="/objets" element={<Objets />} />
              <Route path="/securite" element={<Securite />} />
            </Routes>
          </main>
        </div>
        <Alerte message={alerte} onClose={() => setAlerte('')} />
      </HashRouter>
    </ConfirmProvider>
  </AlerteProvider>
  )
}


export default App
