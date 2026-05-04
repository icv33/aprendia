'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TikTokPost, TikTokSettings, TikTokSlide, TikTokPostType } from '@/lib/supabase'
import { TYPE_META } from '@/lib/tiktok'

type Props = {
  initialPosts: TikTokPost[]
  initialSettings: TikTokSettings
}

function buildRenderUrl(slide: TikTokSlide, type: TikTokPostType, dl = false): string {
  const p = new URLSearchParams({ type })
  if (dl) p.set('dl', '1')

  if (slide.type === 'cover') {
    p.set('slideType', 'cover')
    p.set('titulo', slide.titulo)
    if (slide.subtitulo) p.set('subtitulo', slide.subtitulo)
  } else if (slide.type === 'content') {
    p.set('slideType', 'content')
    p.set('titulo', slide.titulo)
    p.set('contenido', slide.contenido)
    p.set('num', String(slide.num))
  } else {
    p.set('slideType', 'cta')
    p.set('cta', slide.cta)
  }
  return `/api/tiktok/render?${p.toString()}`
}

function SlideThumbnail({ slide, type, size = 120 }: { slide: TikTokSlide; type: TikTokPostType; size?: number }) {
  const url = buildRenderUrl(slide, type)
  return (
    <img
      src={url}
      alt={slide.type}
      width={size}
      height={size}
      style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,.08)' }}
    />
  )
}

function PostCard({ post, onDelete }: { post: TikTokPost; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const meta = TYPE_META[post.type]
  const cover = post.slides[0]

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este post?')) return
    setDeleting(true)
    await fetch(`/api/tiktok/posts/${post.id}`, { method: 'DELETE' })
    onDelete(post.id)
  }

  const scheduledDate = post.scheduled_at
    ? new Date(post.scheduled_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
        {cover && <SlideThumbnail slide={cover} type={post.type} size={72} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: meta.color, background: `${meta.color}18`, padding: '3px 10px', borderRadius: 100 }}>
              {meta.icon} {meta.label}
            </span>
            <StatusBadge status={post.status} />
          </div>
          <div style={{ fontSize: '.82rem', color: '#64748B' }}>
            {scheduledDate ? `Programado: ${scheduledDate}` : publishedDate ? `Publicado: ${publishedDate}` : 'Sin programar'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', background: 'rgba(59,130,246,.08)', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}
          >
            {expanded ? 'Ocultar' : 'Ver slides'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,.07)', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}
          >
            {deleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Expanded slides */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ paddingTop: 16, overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 10, width: 'max-content' }}>
              {post.slides.map((slide, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <a
                    href={buildRenderUrl(slide, post.type, true)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    title="Descargar slide"
                  >
                    <SlideThumbnail slide={slide} type={post.type} size={140} />
                  </a>
                  <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
                    {slide.type === 'cover' ? 'PORTADA' : slide.type === 'cta' ? 'CTA' : `SLIDE ${slide.num}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>
            Haz clic en cada slide para descargarla como PNG.
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Borrador',   color: '#64748B', bg: 'rgba(100,116,139,.1)' },
    approved:  { label: 'Aprobado',   color: '#007A40', bg: 'rgba(0,255,178,.12)' },
    scheduled: { label: 'Programado', color: '#3B82F6', bg: 'rgba(59,130,246,.1)' },
    published: { label: 'Publicado',  color: '#10B981', bg: 'rgba(16,185,129,.1)' },
    error:     { label: 'Error',      color: '#EF4444', bg: 'rgba(239,68,68,.1)'  },
  }
  const s = map[status] ?? map.draft
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 8px', borderRadius: 100 }}>
      {s.label}
    </span>
  )
}

export function TikTokMain({ initialPosts, initialSettings }: Props) {
  const [posts, setPosts] = useState<TikTokPost[]>(initialPosts)
  const [settings, setSettings] = useState<TikTokSettings>(initialSettings)
  const [tab, setTab] = useState<'queue' | 'history'>('queue')
  const [togglingAuto, setTogglingAuto] = useState(false)

  const queue   = posts.filter(p => ['draft', 'approved', 'scheduled'].includes(p.status))
  const history = posts.filter(p => ['published', 'error'].includes(p.status))

  const toggleAuto = async () => {
    setTogglingAuto(true)
    const newVal = !settings.auto_mode
    const res = await fetch('/api/tiktok/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_mode: newVal }),
    })
    const { settings: updated } = await res.json()
    setSettings(updated)
    setTogglingAuto(false)
  }

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      {/* Topbar */}
      <header style={{ height: 60, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>TikTok</div>
          <div style={{ fontSize: '.8rem', color: '#64748B' }}>{queue.length} en cola · {history.length} publicados</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Auto mode toggle */}
          <button
            onClick={toggleAuto}
            disabled={togglingAuto}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: settings.auto_mode ? 'rgba(0,255,178,.12)' : '#F1F5F9',
              border: settings.auto_mode ? '1px solid rgba(0,255,178,.3)' : '1px solid #E2E8F0',
              borderRadius: 100, padding: '7px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              color: settings.auto_mode ? '#007A40' : '#64748B',
              transition: 'all .2s',
            }}
          >
            <div style={{
              width: 28, height: 16, borderRadius: 100,
              background: settings.auto_mode ? '#00CC8F' : '#CBD5E1',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2,
                left: settings.auto_mode ? 14 : 2,
                width: 12, height: 12, borderRadius: '50%', background: '#fff',
                transition: 'left .2s',
              }} />
            </div>
            Modo autónomo
          </button>

          <Link
            href="/dashboard/tiktok/new"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0F172A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10, textDecoration: 'none' }}
          >
            + Nuevo post
          </Link>
        </div>
      </header>

      {/* Auto mode info banner */}
      {settings.auto_mode && (
        <div style={{ background: 'rgba(0,255,178,.07)', borderBottom: '1px solid rgba(0,204,143,.2)', padding: '10px 28px', fontSize: 12, color: '#007A40', fontWeight: 600 }}>
          ⚡ Modo autónomo activado — cada día a las 8:00am se generan y programan 4 posts automáticamente (9h · 12h · 15h · 19h)
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
          {(['queue', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0F172A' : '#64748B',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s',
              }}
            >
              {t === 'queue' ? `Cola (${queue.length})` : `Historial (${history.length})`}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {tab === 'queue' && (
          queue.length === 0 ? (
            <EmptyState
              icon="📱"
              title="Cola vacía"
              desc="Genera tu primer post para empezar"
              action={<Link href="/dashboard/tiktok/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0F172A', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', marginTop: 16 }}>+ Generar primer post</Link>}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {queue.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
            </div>
          )
        )}

        {tab === 'history' && (
          history.length === 0 ? (
            <EmptyState icon="📊" title="Sin historial" desc="Los posts publicados aparecerán aquí" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
            </div>
          )
        )}
      </div>
    </>
  )
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#64748B', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: '#94A3B8' }}>{desc}</p>
      {action}
    </div>
  )
}
