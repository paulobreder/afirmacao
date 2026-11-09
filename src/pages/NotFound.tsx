import { Link } from 'react-router-dom'
import { ArrowRight, MapPinOff } from 'lucide-react'
import { Seo } from '../components/Seo'

export default function NotFound({ mensagem }: { mensagem?: string }) {
  return (
    <section className="bg-waves bg-ice py-24 md:py-32">
      <Seo title="Página não encontrada" description="A página procurada não existe na AfirmAção." />
      <div className="container-site max-w-xl text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <MapPinOff className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-4xl font-extrabold">Página não encontrada</h1>
        <p className="mt-4 text-lg text-ink-muted">{mensagem ?? 'O endereço pode estar incorreto ou a página mudou de lugar.'}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/materiais" className="btn btn-primary">
            Ver materiais <ArrowRight className="size-5" aria-hidden />
          </Link>
          <Link to="/" className="btn btn-secondary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </section>
  )
}
