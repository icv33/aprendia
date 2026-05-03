import './landing.css'
import { LandingNew } from '@/components/landing/LandingNew'

export const metadata = {
  title: 'AprendIA — Automatiza. Genera ingresos. Sin programar.',
  description: 'La guía definitiva para usar IA en tu día a día. Automatiza tareas, recupera horas y crea nuevas fuentes de ingresos. Cero código. 100% práctico.',
}

export default function HomePage() {
  return <LandingNew />
}
