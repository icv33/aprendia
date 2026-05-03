import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Acceso | AprendIA' }

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm px-4">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow-indigo-sm">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              Aprend<span className="gradient-text font-bold">IA</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Panel de administración</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-center mb-1 text-slate-800">Acceder al panel</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Solo disponible para el administrador</p>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Acceso restringido · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
