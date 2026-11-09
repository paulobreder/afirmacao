import { BookOpen, NotebookPen, ScanSearch, type LucideIcon } from 'lucide-react'
import type { CategoriaId } from '../data/materiais'

/** Ícone e acento de cor de cada categoria (mesma família de ícones em todo o site). */
export const categoriaVisual: Record<CategoriaId, { Icon: LucideIcon; badge: string; iconBg: string; shelf: string }> = {
  revisao: { Icon: BookOpen, badge: 'bg-brand-soft text-brand-strong', iconBg: 'bg-brand-soft text-brand', shelf: 'bg-brand-soft' },
  'raio-x': { Icon: ScanSearch, badge: 'bg-action-soft text-action-strong', iconBg: 'bg-action-soft text-action-strong', shelf: 'bg-action-soft' },
  resumos: { Icon: NotebookPen, badge: 'bg-energy-soft text-[#7a5200]', iconBg: 'bg-energy-soft text-[#8a5d00]', shelf: 'bg-energy-soft' },
}
