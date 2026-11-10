import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Biblioteca from './pages/Biblioteca'
import Guia from './pages/Guia'
import Sobre from './pages/Sobre'
import NotFound from './pages/NotFound'

// O visualizador de PDF (pdf.js) só é carregado quando um material é aberto.
const MaterialPage = lazy(() => import('./pages/Material'))
// Módulo de simulados: carregado sob demanda, não pesa nas páginas existentes.
const SimuladosHub = lazy(() => import('./pages/simulados/SimuladosHub'))
const IniciarSimulado = lazy(() => import('./pages/simulados/IniciarSimulado'))
const Prova = lazy(() => import('./pages/simulados/Prova'))
const Resultado = lazy(() => import('./pages/simulados/Resultado'))
const RedacaoLab = lazy(() => import('./pages/simulados/RedacaoLab'))
const RedacaoEditor = lazy(() => import('./pages/simulados/RedacaoEditor'))
const Desempenho = lazy(() => import('./pages/simulados/Desempenho'))

const sob = (el: ReactNode) => <Suspense fallback={<Carregando />}>{el}</Suspense>

function Carregando() {
  return (
    <div className="container-site py-24 text-center text-ink-muted" role="status">
      Carregando…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
          <Route path="simulados" element={sob(<SimuladosHub />)} />
          <Route path="simulados/redacao" element={sob(<RedacaoLab />)} />
          <Route path="simulados/redacao/:id" element={sob(<RedacaoEditor />)} />
          <Route path="simulados/desempenho" element={sob(<Desempenho />)} />
          <Route path="simulados/prova/:id" element={sob(<Prova />)} />
          <Route path="simulados/resultado/:id" element={sob(<Resultado />)} />
          <Route path="simulados/:dia" element={sob(<IniciarSimulado />)} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
