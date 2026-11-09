import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Biblioteca from './pages/Biblioteca'
import Guia from './pages/Guia'
import Sobre from './pages/Sobre'
import NotFound from './pages/NotFound'

// O visualizador de PDF (pdf.js) só é carregado quando um material é aberto.
const MaterialPage = lazy(() => import('./pages/Material'))

function Carregando() {
  return (
    <div className="container-site py-24 text-center text-ink-muted" role="status">
      Carregando…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="materiais" element={<Biblioteca />} />
          <Route
            path="materiais/:slug"
            element={
              <Suspense fallback={<Carregando />}>
                <MaterialPage />
              </Suspense>
            }
          />
          <Route path="guia" element={<Guia />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
