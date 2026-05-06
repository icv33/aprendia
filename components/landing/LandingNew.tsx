'use client'

import { useState, useEffect } from 'react'

const TICKS = [
  'Prompts prácticos', 'IA para ahorrar tiempo', 'Automatizaciones simples',
  'Club AprendIA', 'Comunidad privada', 'Recursos desde cero',
  'Sin programar', 'Sin humo', 'Ideas realistas con IA',
  'ChatGPT desde cero', 'Claude en tu día a día', 'Cero programación',
]

const FAQS = [
  { q: '¿Qué es Club AprendIA?', a: 'Es una comunidad gratuita para aprender a aplicar IA de forma práctica: prompts, recursos, ebooks, sistemas y ejemplos reales para ahorrar tiempo y detectar oportunidades.' },
  { q: '¿Entrar es gratis?', a: 'Sí. La entrada al Club AprendIA es gratuita en esta primera fase.' },
  { q: '¿Qué recibiré dentro?', a: 'Recibirás acceso al grupo privado de WhatsApp, recursos iniciales, prompts, avisos prioritarios y acceso anticipado a futuros materiales.' },
  { q: '¿Necesito saber programar?', a: 'No. AprendIA está pensado para empezar desde cero y aplicar IA sin necesidad de saber código.' },
  { q: '¿Habrá grupo de WhatsApp?', a: 'Sí. El Club AprendIA tendrá un grupo privado de WhatsApp para compartir recursos, avisos y novedades.' },
  { q: '¿Cuándo estarán los recursos completos?', a: 'Estamos preparando ebooks, bibliotecas de prompts y sistemas más completos. Los miembros del Club tendrán prioridad cuando se publiquen.' },
  { q: '¿Esto es otro curso más de IA?', a: 'No. La idea es crear una comunidad práctica, clara y sin humo. No prometemos dinero fácil ni resultados mágicos.' },
  { q: '¿Puedo salir cuando quiera?', a: 'Sí. Puedes salir del grupo o dejar de recibir comunicaciones cuando quieras.' },
]

const WA_URL = 'https://whatsapp.com/channel/0029VbCPfkzElah0V93Ils2J'

export function LandingNew() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [wlEmail, setWlEmail] = useState('')
  const [wlStatus, setWlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [wlError, setWlError] = useState('')

  const submitWaitlist = async () => {
    if (!wlEmail.trim()) { setWlError('Introduce tu email'); return }
    setWlStatus('loading')
    setWlError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: wlEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setWlError(data.error || 'Error al guardar. Inténtalo de nuevo.'); setWlStatus('error'); return }
      setWlStatus('success')
    } catch {
      setWlError('Error de conexión. Inténtalo de nuevo.')
      setWlStatus('error')
    }
  }

  useEffect(() => {
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            ro.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.lp-root .reveal').forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const stickyEl = document.getElementById('stickyCta')
    const waitlistEl = document.getElementById('waitlist')
    if (!stickyEl || !waitlistEl) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          stickyEl.style.opacity = e.isIntersecting ? '0' : '1'
          stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto'
        })
      },
      { threshold: 0.3 }
    )
    obs.observe(waitlistEl)
    return () => obs.disconnect()
  }, [])

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)

  return (
    <div className="lp-root">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand brand">Aprend<span className="ia">IA</span></div>
        <ul className="lp-nav-links">
          <li><a href="#problem">El problema</a></li>
          <li><a href="#included">Qué incluye</a></li>
          <li><a href="#waitlist">Club AprendIA</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#waitlist" className="lp-nav-cta">Entrar gratis →</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="reveal">
                <div className="hero-kicker">
                  <span>🚀 Únete gratis a Club AprendIA</span>
                </div>
              </div>
              <div className="reveal d1">
                <h1 className="t-hero" style={{ marginBottom: '22px' }}>
                  Trabaja menos.<br />
                  <span className="grad">Gana más.</span><br />
                  Sin programar.
                </h1>
              </div>
              <div className="reveal d2">
                <p className="t-lg hero-sub">
                  Únete gratis a Club AprendIA: una comunidad práctica con prompts, ebooks, sistemas y recursos para aplicar IA desde cero, <strong>sin humo y sin cursos carísimos.</strong>
                </p>
              </div>
              <div className="reveal d3">
                <div className="hero-actions">
                  <a href="#waitlist" className="lp-btn lp-btn-primary lp-btn-lg">Entrar gratis al Club AprendIA →</a>
                  <a href="#included" className="lp-btn lp-btn-secondary">Ver qué incluye</a>
                </div>
              </div>
              <div className="reveal d4">
                <div className="hero-proof">
                  <div className="avatars">
                    <div className="av av1">M</div>
                    <div className="av av2">J</div>
                    <div className="av av3">A</div>
                    <div className="av av4">R</div>
                    <div className="av av5">L</div>
                  </div>
                  <span className="t-sm muted">Sé de los <strong style={{ color: 'var(--lp-text)' }}>primeros</strong> en unirte al Club</span>
                </div>
              </div>
            </div>

            <div className="hero-visual reveal d2">
              <div className="hero-book">
                <div className="book-glow" />
                <div className="book-spine" />
                <div className="book-cover">
                  <div><div className="book-tag">Club AprendIA</div></div>
                  <div>
                    <div className="book-tit">Aprend<span className="ia">IA</span></div>
                    <div className="book-sub">Comunidad práctica · Prompts · Ebooks · Sistemas · WhatsApp</div>
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.2)', fontFamily: "'Courier New',monospace" }}>Fase 1 — 2025</div>
                </div>
                <div className="fb fb1">
                  <div className="bi" style={{ background: 'rgba(0,255,178,.12)' }}>⚡</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>Tiempo ahorrado</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>con IA en tu día a día</div>
                  </div>
                </div>
                <div className="fb fb2">
                  <div className="bi" style={{ background: 'rgba(59,130,246,.1)' }}>💬</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>Comunidad</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>grupo privado WhatsApp</div>
                  </div>
                </div>
                <div className="fb fb3">
                  <div className="bi" style={{ background: 'rgba(245,158,11,.1)' }}>📦</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>Recursos</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>prompts, ebooks y más</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          {[...TICKS, ...TICKS].map((t, i) => (
            <span key={i} className="tick-item">
              <span className="tick-dot">◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ── */}
      <section id="problem">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />El Problema</div>
            <h2 className="t-h2 reveal d1">Trabajas demasiado.<br />Pero la IA todavía no trabaja <em>por ti</em>.</h2>
            <p className="t-md reveal d2">Entre cursos caros, vídeos sueltos y promesas exageradas, mucha gente sigue sin saber cómo aplicar la IA de verdad en su día a día.</p>
          </div>
          <div className="prob-grid">
            {[
              { ico: '⏳', title: 'Las tareas repetitivas devoran tu tiempo', desc: 'Emails, informes, búsquedas, resúmenes y contenido siguen quitándote horas cada semana.' },
              { ico: '😰', title: 'Demasiada información, poca claridad', desc: 'Hay miles de vídeos, herramientas y prompts sueltos, pero casi ningún camino claro para empezar.' },
              { ico: '💸', title: 'Cursos caros que prometen demasiado', desc: 'Muchos venden la IA como si fuera magia, pero luego entregan contenido básico o poco aplicable.' },
              { ico: '🤯', title: 'Oportunidades que otros ya están aprovechando', desc: 'Quien aprende a usar IA bien puede trabajar más rápido, crear mejores sistemas y detectar nuevas oportunidades.' },
            ].map((c, i) => (
              <div key={i} className={`prob-card reveal d${i + 1}`}>
                <div className="prob-ico">{c.ico}</div>
                <div><h3>{c.title}</h3><p>{c.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ── */}
      <section id="why">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Nuestra razón</div>
            <h2 className="t-h2 reveal d1">Por qué he creado <span className="brand" style={{ fontSize: 'inherit' }}>Aprend<span className="ia">IA</span></span></h2>
            <p className="t-md reveal d2" style={{ maxWidth: 640, margin: '0 auto' }}>
              AprendIA nace al ver cómo muchas personas pagaban cursos carísimos de IA que prometían ingresos rápidos y entregaban contenido básico. Queremos crear una alternativa más práctica, clara y accesible: recursos útiles, comunidad y ejemplos reales para aplicar IA desde cero.
            </p>
          </div>
          <div className="ben-grid" style={{ marginTop: 40 }}>
            {[
              { ico: '🚫', bg: 'bg-g', title: 'Sin cursos carísimos', desc: 'Acceso gratuito a recursos prácticos desde el primer día.' },
              { ico: '🚫', bg: 'bg-b', title: 'Sin promesas de dinero fácil', desc: 'Hablamos de formas realistas de ahorrar tiempo y crear oportunidades.' },
              { ico: '🚫', bg: 'bg-p', title: 'Sin tecnicismos innecesarios', desc: 'Todo está explicado para alguien que empieza desde cero.' },
              { ico: '✅', bg: 'bg-g', title: 'Con recursos prácticos', desc: 'Prompts, ebooks, sistemas y ejemplos aplicables desde hoy.' },
              { ico: '✅', bg: 'bg-b', title: 'Con comunidad real', desc: 'Un espacio donde compartir avances, recursos y dudas.' },
              { ico: '✅', bg: 'bg-p', title: 'Con enfoque en aplicar', desc: 'Menos teoría, más resultados concretos en tu día a día.' },
            ].map((b, i) => (
              <div key={i} className={`ben-card reveal d${(i % 3) + 1}`}>
                <div className={`ben-ico ${b.bg}`}>{b.ico}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />La Solución</div>
            <h2 className="t-h2 reveal d1">Club AprendIA:<br /><span style={{ color: 'var(--lp-primary-dark)' }}>IA práctica, sin humo y desde cero.</span></h2>
            <p className="t-md reveal d2">Recursos, prompts, ebooks y sistemas para ahorrar tiempo, automatizar tareas y descubrir formas realistas de generar ingresos con IA.</p>
          </div>
          <div className="sol-grid">
            <div className="sol-list">
              {[
                { title: 'Sin necesidad de saber programar', desc: 'Aprende a usar herramientas de IA y automatización sin tocar código.' },
                { title: 'Prompts listos para copiar y usar', desc: 'Recursos prácticos para tareas del día a día: emails, resúmenes, contenido, organización y más.' },
                { title: 'Sistemas prácticos para ahorrar tiempo', desc: 'Ideas y métodos para reducir tareas repetitivas y trabajar mejor.' },
                { title: 'Ideas realistas para generar ingresos', desc: 'Formas posibles de aplicar IA a servicios, contenido o pequeños proyectos.' },
                { title: 'Comunidad privada de WhatsApp', desc: 'Un espacio inicial para compartir recursos, avances y oportunidades.' },
                { title: 'Acceso anticipado a futuros recursos', desc: 'Los miembros del Club tendrán prioridad cuando lancemos nuevos materiales.' },
              ].map((item, i) => (
                <div key={i} className={`sol-item reveal d${i + 1}`}>
                  <div className="sol-chk">
                    <svg viewBox="0 0 13 13" fill="none" width={12} height={12}>
                      <polyline points="2,7 5,10 11,3" stroke="#00CC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="mockup reveal d2">
              <div className="mkp-hd">
                <div className="mkp-dot" style={{ background: '#EF4444' }} />
                <div className="mkp-dot" style={{ background: '#F59E0B' }} />
                <div className="mkp-dot" style={{ background: '#10B981' }} />
                <span className="mkp-title">club.aprendia.store</span>
              </div>
              <div className="mkp-line"><span className="c-pr">$</span><span className="c-tx">tarea: &quot;resumir este PDF de 30 páginas&quot;</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">herramienta: ChatGPT</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">prompt: [template_resumen]</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">formato: bullet points claros</span></div>
              <div className="mkp-line"><span className="c-cm">// Tiempo: 1 min (antes: 45 min)</span></div>
              <div className="mkp-res">
                <div className="mkp-lbl">✓ Resumen generado</div>
                <div className="mkp-txt">5 puntos clave, sin perderte nada importante.<span className="cursor" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Beneficios</div>
            <h2 className="t-h2 reveal d1">Lo que puedes empezar a cambiar<br />con <span className="brand" style={{ fontSize: 'inherit' }}>Aprend<span className="ia">IA</span></span></h2>
          </div>
          <div className="ben-grid">
            {[
              { ico: '⚡', bg: 'bg-g', title: 'Horas recuperadas', desc: 'Automatiza tareas repetitivas y aprende a usar IA para ahorrar tiempo cada semana.' },
              { ico: '🎯', bg: 'bg-b', title: 'Nuevas oportunidades', desc: 'Descubre formas realistas de usar IA para crear servicios, contenido o sistemas útiles.' },
              { ico: '🧠', bg: 'bg-p', title: 'Ventaja competitiva', desc: 'Aprende herramientas que cada vez serán más importantes en trabajo, estudio y negocios.' },
              { ico: '🚀', bg: 'bg-g', title: 'Aplicación desde el primer día', desc: 'Prompts y recursos simples para empezar sin configuraciones complicadas.' },
              { ico: '🔁', bg: 'bg-b', title: 'Automatizaciones útiles', desc: 'Ideas y sistemas para dejar de hacer siempre las mismas tareas manualmente.' },
              { ico: '💬', bg: 'bg-p', title: 'Comunidad y recursos', desc: 'Accede a una comunidad con ganas, recursos prácticos y futuras actualizaciones.' },
            ].map((b, i) => (
              <div key={i} className={`ben-card reveal d${(i % 3) + 1}`}>
                <div className={`ben-ico ${b.bg}`}>{b.ico}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section id="forwho">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />¿Para quién es?</div>
            <h2 className="t-h2 reveal d1">Esto es para ti.<br /><span className="muted" style={{ fontWeight: 400, fontSize: '.75em' }}>Y también lo que <em>no</em> es.</span></h2>
          </div>
          <div className="forwho-grid">
            <div className="fw-card fw-yes reveal d1">
              <div className="fw-title"><span style={{ fontSize: '1.3rem' }}>✅</span> AprendIA ES para ti si…</div>
              <div className="fw-list">
                {[
                  'Quieres ahorrar tiempo en tu trabajo o negocio con herramientas de IA',
                  'Buscas formas realistas de generar ingresos o mejorar tu situación laboral',
                  'Eres freelancer, emprendedor o trabajas por cuenta ajena y quieres diferenciarte',
                  'Has intentado entender la IA pero no sabes por dónde empezar',
                  'Prefieres recursos prácticos e inmediatos, no teoría ni formación interminable',
                  'Quieres estar por delante antes de que el mercado te lo exija',
                ].map((txt, i) => (
                  <div key={i} className="fw-item"><span className="fw-ico">→</span><span>{txt}</span></div>
                ))}
              </div>
            </div>
            <div className="fw-card fw-no reveal d2">
              <div className="fw-title"><span style={{ fontSize: '1.3rem' }}>❌</span> NO es para ti si…</div>
              <div className="fw-list">
                {[
                  'Buscas un curso técnico de programación o desarrollo de software',
                  'Esperas hacerte rico de la noche a la mañana sin esfuerzo',
                  'No estás dispuesto a dedicar tiempo a aplicar lo aprendido',
                ].map((txt, i) => (
                  <div key={i} className="fw-item"><span className="fw-ico">✗</span><span>{txt}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Cómo funciona</div>
            <h2 className="t-h2 reveal d1">Empieza en<br /><span style={{ color: 'var(--lp-primary-dark)' }}>3 pasos simples</span></h2>
            <p className="t-md reveal d2">Sin tecnicismos, sin configuraciones complejas. Funciona desde el primer día.</p>
          </div>
          <div className="how-steps">
            {[
              { n: '1', title: 'Reserva tu plaza gratis', desc: 'Introduce tu email y reserva tu sitio en Club AprendIA. Es completamente gratuito en esta primera fase.' },
              { n: '2', title: 'Únete al grupo de WhatsApp', desc: 'Accede al grupo privado donde compartimos recursos, prompts y novedades antes que nadie.' },
              { n: '3', title: 'Aplica desde el primer día', desc: 'Usa los prompts y recursos desde el inicio. Sin curva de aprendizaje larga, sin configuraciones técnicas.' },
            ].map((s, i) => (
              <div key={i} className={`how-step reveal d${i + 1}`}>
                <div className="step-num">{s.n}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCLUDED ── */}
      <section id="included">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Qué incluye</div>
            <h2 className="t-h2 reveal d1" style={{ color: '#fff' }}>Todo lo que incluye<br /><span style={{ color: 'var(--primary)' }}>Club AprendIA.</span></h2>
            <p className="t-md reveal d2" style={{ color: 'rgba(255,255,255,.5)' }}>Acceso gratuito. Sin compromiso. Empieza cuando quieras.</p>
          </div>
          <div className="inc-panels">
            <div className="inc-panel active">
              {[
                { ico: '💬', title: 'Grupo privado de WhatsApp', desc: 'Comunidad inicial para compartir recursos, avances, prompts y oportunidades.' },
                { ico: '🧩', title: 'Prompts listos para usar', desc: 'Recursos prácticos para tareas del día a día: emails, resúmenes, contenido y organización.' },
                { ico: '📘', title: 'Ebooks iniciales', desc: 'Materiales descargables para empezar a aplicar IA desde cero.' },
                { ico: '🔔', title: 'Avisos prioritarios', desc: 'Serás el primero en recibir nuevos recursos, actualizaciones y futuros lanzamientos.' },
                { ico: '🚀', title: 'Acceso anticipado a futuros materiales', desc: 'Los miembros del Club tendrán prioridad cuando publiquemos nuevos contenidos.' },
                { ico: '🛡️', title: 'Sin spam. Sin compromiso.', desc: 'Puedes salir del grupo o dejar de recibir comunicaciones cuando quieras.' },
              ].map((item, i) => (
                <div key={i} className="inc-item">
                  <div className="inc-ico">{item.ico}</div>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }} className="reveal">
            <a href="#waitlist" className="lp-btn lp-btn-primary lp-btn-lg">Entrar gratis al Club →</a>
          </div>
        </div>
      </section>

      {/* ── PRÓXIMAMENTE ── */}
      <section id="coming-soon">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Próximamente</div>
            <h2 className="t-h2 reveal d1">Próximamente dentro<br /><span style={{ color: 'var(--lp-primary-dark)' }}>de Club AprendIA</span></h2>
            <p className="t-md reveal d2" style={{ maxWidth: 600, margin: '0 auto' }}>
              Estamos preparando recursos más completos para los miembros del Club: ebooks, bibliotecas de prompts, sistemas prácticos y futuras formaciones. Los miembros tendrán acceso prioritario cuando se abran.
            </p>
          </div>
          <div className="ben-grid" style={{ marginTop: 40 }}>
            {[
              { ico: '📘', bg: 'bg-g', title: 'Ebooks prácticos', desc: 'Guías completas para aplicar IA en áreas concretas de tu vida o negocio.' },
              { ico: '🧩', bg: 'bg-b', title: 'Biblioteca de prompts', desc: 'Colección organizada de prompts probados por categorías y casos de uso.' },
              { ico: '🔁', bg: 'bg-p', title: 'Sistemas de automatización', desc: 'Flujos y plantillas para automatizar tareas sin necesidad de programar.' },
              { ico: '💬', bg: 'bg-g', title: 'Comunidad privada', desc: 'Espacio activo para aprender, compartir y crecer junto a otros miembros.' },
              { ico: '🔄', bg: 'bg-b', title: 'Recursos actualizados', desc: 'El contenido evoluciona con la IA. Los miembros siempre tienen lo más reciente.' },
              { ico: '🎓', bg: 'bg-p', title: 'Futuras formaciones', desc: 'Materiales más completos para quien quiera profundizar en áreas específicas.' },
            ].map((b, i) => (
              <div key={i} className={`ben-card reveal d${(i % 3) + 1}`}>
                <div className={`ben-ico ${b.bg}`}>{b.ico}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }} className="reveal">
            <a href="#waitlist" className="lp-btn lp-btn-primary lp-btn-lg">Entrar gratis al Club →</a>
          </div>
        </div>
      </section>

      {/* ── DIFERENTE ── */}
      <section id="diferente">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Sin humo</div>
            <h2 className="t-h2 reveal d1">Qué hace diferente<br /><span style={{ color: 'var(--lp-primary-dark)' }}>a AprendIA</span></h2>
            <p className="t-md reveal d2">AprendIA no nace para ser otro curso más de IA. Nace como una comunidad práctica para aprender, aplicar y compartir recursos útiles desde el primer día.</p>
          </div>
          <div className="prob-grid" style={{ marginTop: 40 }}>
            {[
              { ico: '✅', title: 'No vendemos humo', desc: 'Prometemos lo que podemos entregar: recursos prácticos, comunidad y acceso anticipado.' },
              { ico: '✅', title: 'No prometemos dinero fácil', desc: 'Hablamos de formas realistas de ahorrar tiempo, crear oportunidades y trabajar mejor.' },
              { ico: '✅', title: 'No necesitas saber programar', desc: 'Todo está pensado para alguien que empieza desde cero, sin conocimientos técnicos.' },
              { ico: '✅', title: 'No tendrás que pagar cursos absurdos', desc: 'El acceso al Club es gratuito. Los recursos son prácticos y aplicables desde el inicio.' },
            ].map((c, i) => (
              <div key={i} className={`prob-card reveal d${i + 1}`}>
                <div className="prob-ico">{c.ico}</div>
                <div><h3>{c.title}</h3><p>{c.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="waitlist">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Club AprendIA</div>
            <h2 className="t-h2 reveal d1" style={{ color: '#fff', marginBottom: 14 }}>
              Entra gratis a<br />
              <span style={{ color: 'var(--primary)' }}>Club AprendIA</span>
            </h2>
            <p className="t-md reveal d2" style={{ color: 'rgba(255,255,255,.5)', marginBottom: 0 }}>
              Reserva tu plaza y recibe acceso al grupo privado de WhatsApp, recursos iniciales y aviso prioritario del lanzamiento.
            </p>
          </div>

          <div className="wl-inner reveal d3">
            {wlStatus === 'success' ? (
              <div className="wl-success">
                <div style={{ fontSize: '2.8rem' }}>🎉</div>
                <h3>Plaza reservada.</h3>
                <p>Ahora únete al grupo privado de WhatsApp para recibir los primeros recursos.</p>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wl-wa-btn">
                  💬 Unirme al grupo de WhatsApp
                </a>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  className="wl-input"
                  placeholder="tu@email.com"
                  value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitWaitlist()}
                />
                {wlError && <p className="wl-err">{wlError}</p>}
                <button className="wl-submit" onClick={submitWaitlist} disabled={wlStatus === 'loading'}>
                  {wlStatus === 'loading' ? 'Guardando...' : 'Reservar mi plaza gratis →'}
                </button>
                <p className="wl-hint">Sin spam. Sin compromiso. Podrás salir cuando quieras.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq">
        <div className="wrap-sm">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />FAQ</div>
            <h2 className="t-h2 reveal d1">Preguntas frecuentes</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => toggleFaq(i)}>
                  <span>{f.q}</span>
                  <div className="faq-chev">
                    <svg viewBox="0 0 12 12" fill="none" width={11} height={11}>
                      <polyline points="2,4 6,8 10,4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
                <div className="faq-ans">
                  <div className="faq-ans-in">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="final-cta">
        <div className="cta-glow" />
        <div className="wrap cta-inner">
          <div className="lp-pill reveal" style={{ margin: '0 auto 22px', display: 'table' }}>🚀 Acceso gratuito</div>
          <h2 className="t-hero reveal d1" style={{ marginBottom: '18px' }}>
            Entra hoy al Club AprendIA.<br />
            <span className="grad">Es gratis.</span>
          </h2>
          <p className="t-lg reveal d2" style={{ color: 'var(--lp-text-muted)', marginBottom: '44px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            Reserva tu plaza, accede a la comunidad y recibe los primeros recursos antes del lanzamiento.
          </p>
          <div className="reveal d3">
            <a href="#waitlist" className="lp-btn lp-btn-primary lp-btn-xl">Entrar gratis al Club →</a>
          </div>
          <div className="cta-g reveal d4">
            Sin spam. Sin compromiso. Podrás salir cuando quieras.
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="wrap">
          <div className="foot-inner">
            <div className="brand" style={{ fontSize: '1.35rem', color: '#fff' }}>Aprend<span className="ia">IA</span></div>
            <div className="foot-links">
              <a href="/privacy">Privacidad</a>
              <a href="/terms">Términos</a>
              <a href="mailto:hola@aprendia.store">Contacto</a>
            </div>
          </div>
          <div className="foot-guarantee">
            <strong>Club AprendIA:</strong> recursos prácticos, comunidad y acceso anticipado a futuros lanzamientos.
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '.75rem', color: 'rgba(255,255,255,.2)' }}>
            © 2025 AprendIA. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA (solo mobile) ── */}
      <div className="sticky-cta" id="stickyCta">
        <a href="#waitlist">🚀 Entrar gratis al Club →</a>
        <div className="sticky-cta-sub">Sin spam · Sin compromiso · Gratis</div>
      </div>
    </div>
  )
}
