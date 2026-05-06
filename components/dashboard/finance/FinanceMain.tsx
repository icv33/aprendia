'use client'

import { useState, useRef, useEffect } from 'react'
import { FinanceTransaction } from '@/lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────

const CAT_ICONS: Record<string, string> = {
  Infraestructura: '🖥️', Marketing: '📢', Herramientas: '🔧',
  Suscripciones: '🔄', Diseño: '🎨', Ventas: '💰',
  Club: '🎯', Servicios: '💼', Otros: '📦',
}

const EXAMPLES = [
  'Gasté 20€ en Vercel este mes',
  'Venta de ebook por 9.99€',
  'Pago mensual de Supabase 25€',
  'Ingreso de 150€ por consultoría',
  'Compré Canva Pro por 13€',
]

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS_ES[parseInt(m) - 1].slice(0, 3)}`
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCard({ label, amount, color, icon }: { label: string; amount: number; color: string; icon: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '20px 24px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.7rem', color, lineHeight: 1 }}>
        {amount < 0 ? '-' : ''}€{fmt(Math.abs(amount))}
      </div>
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TransactionRow({ tx, onDelete }: { tx: FinanceTransaction; onDelete: (id: string) => void }) {
  const [hover, setHover] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isIncome = tx.type === 'income'
  const color = isIncome ? '#10B981' : '#EF4444'
  const bg    = isIncome ? 'rgba(16,185,129,.07)' : 'rgba(239,68,68,.07)'

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/finance/transactions/${tx.id}`, { method: 'DELETE' })
    onDelete(tx.id)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 12, background: hover ? '#F8FAFC' : '#fff',
        border: '1px solid #F1F5F9', transition: 'background .12s',
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* Category icon */}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {CAT_ICONS[tx.category] ?? '📦'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{tx.category}</div>
      </div>

      {/* Date */}
      <div style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500, flexShrink: 0 }}>
        {formatDate(tx.date)}
      </div>

      {/* Amount */}
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
        {isIncome ? '+' : '-'}€{fmt(tx.amount)}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          width: 28, height: 28, borderRadius: 7, border: 'none',
          background: hover ? 'rgba(239,68,68,.1)' : 'transparent',
          color: hover ? '#EF4444' : 'transparent',
          cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s', flexShrink: 0,
        }}
      >
        {deleting ? '…' : '×'}
      </button>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function FinanceMain({ initialTransactions }: { initialTransactions: FinanceTransaction[] }) {
  const now = new Date()
  const [currentDate, setCurrentDate]         = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [transactions, setTransactions]        = useState<FinanceTransaction[]>(initialTransactions)
  const [input, setInput]                      = useState('')
  const [status, setStatus]                    = useState<'idle' | 'parsing' | 'saving' | 'error'>('idle')
  const [errorMsg, setErrorMsg]                = useState('')
  const [loadingMonth, setLoadingMonth]        = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const key     = monthKey(currentDate)
  const label   = `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  const isToday = key === monthKey(now)

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net     = income - expense

  // Load transactions when month changes
  useEffect(() => {
    if (key === monthKey(now) && initialTransactions.length > 0) return // already loaded
    setLoadingMonth(true)
    fetch(`/api/finance/transactions?month=${key}`)
      .then(r => r.json())
      .then(d => { setTransactions(d.transactions ?? []); setLoadingMonth(false) })
      .catch(() => setLoadingMonth(false))
  }, [key])

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    if (next <= now) setCurrentDate(next)
  }

  const handleSubmit = async () => {
    if (!input.trim() || status !== 'idle') return
    setStatus('parsing')
    setErrorMsg('')

    try {
      const today = now.toISOString().split('T')[0]
      const parseRes = await fetch('/api/finance/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim(), today }),
      })
      const parsed = await parseRes.json()
      if (!parseRes.ok) throw new Error(parsed.error ?? 'Error al interpretar')

      setStatus('saving')
      const saveRes = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      const saved = await saveRes.json()
      if (!saveRes.ok) throw new Error(saved.error ?? 'Error al guardar')

      // Add to list if it belongs to the current month view
      const txMonth = saved.transaction.date.slice(0, 7)
      if (txMonth === key) {
        setTransactions(prev => [saved.transaction, ...prev])
      }
      setInput('')
      setStatus('idle')
      textareaRef.current?.focus()
    } catch (e) {
      setErrorMsg((e as Error).message)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleDelete = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id))

  return (
    <>
      {/* Header */}
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Finanzas</div>

        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={prevMonth}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: 14, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >‹</button>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', color: '#0F172A', minWidth: 140, textAlign: 'center' }}>
            {label}
            {isToday && <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981', background: 'rgba(16,185,129,.1)', borderRadius: 100, padding: '2px 8px', marginLeft: 8 }}>este mes</span>}
          </div>
          <button
            onClick={nextMonth}
            disabled={isToday}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: isToday ? 'not-allowed' : 'pointer', fontSize: 14, color: isToday ? '#CBD5E1' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >›</button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 14 }}>
          <SummaryCard label="Ingresos" amount={income} color="#10B981" icon="💰" />
          <SummaryCard label="Gastos"   amount={expense} color="#EF4444" icon="💸" />
          <SummaryCard
            label="Beneficio neto"
            amount={net}
            color={net >= 0 ? '#10B981' : '#EF4444'}
            icon={net >= 0 ? '📈' : '📉'}
          />
        </div>

        {/* Transactions */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, flex: 1 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 16 }}>
            Movimientos — {transactions.length} {transactions.length === 1 ? 'entrada' : 'entradas'}
          </div>

          {loadingMonth ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 13 }}>Cargando...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💼</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Sin movimientos</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Añade tu primer gasto o ingreso abajo</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(tx => (
                <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Chat input */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.88rem', color: '#0F172A', marginBottom: 4 }}>
            Añadir movimiento
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
            Escríbelo en lenguaje natural y la IA lo interpretará automáticamente.
          </p>

          {/* Examples */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setInput(ex); textareaRef.current?.focus() }}
                style={{ fontSize: 11, color: '#64748B', background: '#F1F5F9', border: 'none', borderRadius: 100, padding: '4px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {ex}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
              placeholder='Ej: "Gasté 50€ en Vercel" o "Venta ebook 9.99€"'
              rows={2}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 13, color: '#0F172A',
                resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#10B981')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || status !== 'idle'}
              style={{
                padding: '0 20px', borderRadius: 10, border: 'none', flexShrink: 0,
                background: !input.trim() || status !== 'idle' ? '#F1F5F9' : '#10B981',
                color: !input.trim() || status !== 'idle' ? '#94A3B8' : '#fff',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                cursor: !input.trim() || status !== 'idle' ? 'not-allowed' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {status === 'parsing' ? '🤖 Leyendo...' : status === 'saving' ? '💾 Guardando...' : '+ Añadir'}
            </button>
          </div>

          {status === 'error' && (
            <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{errorMsg}</p>
          )}
        </div>
      </div>
    </>
  )
}
