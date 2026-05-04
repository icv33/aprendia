'use client'

import { useState, useEffect } from 'react'

const TICKS = [
  'ChatGPT para negocios', 'Automatización con Zapier', 'Prompts que convierten',
  'Ingresos con IA sin código', 'Make & n8n para principiantes', 'Claude y Gemini en la práctica',
  'Contenido automatizado', 'Atención al cliente con IA', 'Copywriting inteligente',
  'Flujos en piloto automático', 'Monetiza con IA hoy', 'Cero programación',
]

const FAQS = [
  { q: '¿Necesito saber programar para usar el eBook?', a: 'No. AprendIA está diseñado específicamente para personas sin conocimientos técnicos. Todas las herramientas que se mencionan son no-code — utilizas interfaces visuales simples, como cualquier app del móvil. Si sabes copiar y pegar, puedes hacerlo.' },
  { q: '¿En cuánto tiempo veo resultados?', a: 'La mayoría de los lectores ya ahorra tiempo en las primeras horas de lectura gracias a los prompts listos. Para automatizaciones más elaboradas, el plazo habitual es de 1 a 7 días. Los resultados económicos varían según el modelo elegido.' },
  { q: '¿Cómo funciona la garantía?', a: 'Si por cualquier motivo el contenido no cumple lo que prometemos, te devolvemos el 100% del importe. Sin preguntas, sin burocracia, sin plazos que cumplir. Tu satisfacción es nuestra única condición.' },
  { q: '¿El eBook se actualiza? Las herramientas de IA cambian muy rápido.', a: '¡Sí! Todas las actualizaciones son vitalicias y gratuitas para los planes Pro y Élite. Cuando publicamos nuevas versiones con herramientas actualizadas, las recibes automáticamente por email. Un único pago para un recurso que evoluciona con la IA.' },
  { q: '¿Cuál es la diferencia entre los tres planes?', a: 'El Starter incluye el eBook base con 30 prompts — perfecto para empezar desde cero. El Pro añade 2 eBooks especializados (secretario IA y negocio en 7 días), 80+ prompts y comunidad de WhatsApp. El Élite incluye todo lo anterior más comunidad privada, mentoría directa por email y templates de negocio listos.' },
  { q: '¿Funciona para cualquier tipo de negocio o profesión?', a: 'Sí. AprendIA tiene aplicaciones para freelancers, emprendedores, trabajadores por cuenta ajena, dueños de pequeñas empresas y creadores de contenido. Los principios y herramientas son adaptables a prácticamente cualquier contexto profesional.' },
  { q: '¿Cómo recibo el eBook tras la compra?', a: 'El acceso es inmediato. Justo después de confirmar el pago, recibes un email con el enlace de descarga. Disponible en PDF optimizado para cualquier dispositivo.' },
]

export function LandingNew() {
  const [activeTab, setActiveTab] = useState<'starter' | 'pro' | 'elite'>('starter')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
    const pricingEl = document.getElementById('pricing')
    if (!stickyEl || !pricingEl) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          stickyEl.style.opacity = e.isIntersecting ? '0' : '1'
          stickyEl.style.pointerEvents = e.isIntersecting ? 'none' : 'auto'
        })
      },
      { threshold: 0.3 }
    )
    obs.observe(pricingEl)
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
          <li><a href="#benefits">Beneficios</a></li>
          <li><a href="#pricing">Precios</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#pricing" className="lp-nav-cta">Quiero el eBook →</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="reveal">
                <div className="hero-kicker">
                  <span className="hero-stars">★★★★★</span>
                  <span>+4.700 personas que ya cambiaron su rutina</span>
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
                  La guía definitiva para usar Inteligencia Artificial en tu día a día — automatiza tareas, recupera horas y crea nuevas fuentes de ingresos. <strong>Cero código. 100% práctico.</strong>
                </p>
              </div>
              <div className="reveal d3">
                <div className="hero-actions">
                  <a href="/api/checkout?pack=pro" className="lp-btn lp-btn-primary lp-btn-lg">Quiero el eBook ahora →</a>
                  <a href="#how" className="lp-btn lp-btn-secondary">Ver cómo funciona</a>
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
                  <span className="t-sm muted"><strong style={{ color: 'var(--lp-text)' }}>4.700+</strong> personas ya usan IA para ganar más</span>
                </div>
              </div>
            </div>

            <div className="hero-visual reveal d2">
              <div className="hero-book">
                <div className="book-glow" />
                <div className="book-spine" />
                <div className="book-cover">
                  <div><div className="book-tag">eBook Digital</div></div>
                  <div>
                    <div className="book-tit">Aprend<span className="ia">IA</span></div>
                    <div className="book-sub">Automatiza tareas y genera ingresos con IA — sin escribir una sola línea de código</div>
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.2)', fontFamily: "'Courier New',monospace" }}>v2.0 — 2025 Edition</div>
                </div>
                <div className="fb fb1">
                  <div className="bi" style={{ background: 'rgba(0,255,178,.12)' }}>⚡</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>2h ahorradas</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>al día de media</div>
                  </div>
                </div>
                <div className="fb fb2">
                  <div className="bi" style={{ background: 'rgba(59,130,246,.1)' }}>💰</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>+800€/mes</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>ingresos extra de media</div>
                  </div>
                </div>
                <div className="fb fb3">
                  <div className="bi" style={{ background: 'rgba(245,158,11,.1)' }}>⭐</div>
                  <div>
                    <div style={{ fontSize: '.76rem', fontWeight: 700 }}>4.9 / 5.0</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--lp-text-muted)' }}>valoración media</div>
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
            <p className="t-md reveal d2">Mientras otros automatizan con IA y facturan casi en piloto automático, la mayoría sigue perdiendo horas en tareas que no aportan valor real.</p>
          </div>
          <div className="prob-grid">
            {[
              { ico: '⏳', title: 'Las tareas repetitivas devoran tu tiempo', desc: 'Responder emails, hacer informes, buscar datos, formatear documentos... 3 a 5 horas al día que desaparecen sin generar valor real.' },
              { ico: '😰', title: 'Sientes que te estás quedando atrás', desc: 'La IA avanza rapidísimo y parece complicada. Sin una guía clara, es difícil saber por dónde empezar cuando no sabes programar.' },
              { ico: '💸', title: 'Oportunidades de ingresos que se escapan', desc: 'Freelancers y emprendedores que dominan la IA cobran 3× más por el mismo trabajo. Tú todavía no eres uno de ellos.' },
              { ico: '🤯', title: 'Demasiada información, poca claridad', desc: 'YouTube, Twitter, cursos de pago… contenido desperdigado por todas partes, sin un camino estructurado y práctico que seguir.' },
            ].map((c, i) => (
              <div key={i} className={`prob-card reveal d${i + 1}`}>
                <div className="prob-ico">{c.ico}</div>
                <div><h3>{c.title}</h3><p>{c.desc}</p></div>
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
            <h2 className="t-h2 reveal d1">Una guía directa al grano.<br />De cero a la <span style={{ color: 'var(--lp-primary-dark)' }}>automatización real</span>.</h2>
            <p className="t-md reveal d2"><strong>Aprend<span style={{ color: 'var(--lp-primary-dark)' }}>IA</span></strong> te da el mapa completo: las herramientas adecuadas, prompts listos para usar y estrategias probadas para que automatices y monetices desde hoy.</p>
          </div>
          <div className="sol-grid">
            <div className="sol-list">
              {[
                { title: 'Sin necesidad de saber programar', desc: 'Todas las automatizaciones usan herramientas no-code. Si sabes usar el móvil y el ordenador, puedes hacerlo.' },
                { title: 'Prompts listos para copiar y usar', desc: 'Más de 80 prompts probados para tareas del día a día: copywriting, atención al cliente, finanzas, contenido y más.' },
                { title: 'Estrategias reales para generar ingresos', desc: '7 modelos de negocio probados que cualquier persona puede poner en marcha usando la IA como palanca.' },
                { title: 'Actualizado con las herramientas de 2025', desc: 'ChatGPT, Gemini, Claude, Make, Zapier, n8n — todo lo que funciona ahora, no lo que funcionaba en 2023.' },
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
                <span className="mkp-title">aprend-ia-automatizacion.ai</span>
              </div>
              <div className="mkp-line"><span className="c-pr">$</span><span className="c-tx">tarea: &quot;redactar propuesta comercial&quot;</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">herramienta: ChatGPT-4</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">prompt: [template_propuesta]</span></div>
              <div className="mkp-line"><span className="c-pr">→</span><span className="c-tx">formato: PDF profesional</span></div>
              <div className="mkp-line"><span className="c-cm">// Tiempo: 2 min (antes: 2 horas)</span></div>
              <div className="mkp-res">
                <div className="mkp-lbl">✓ Resultado generado</div>
                <div className="mkp-txt">Propuesta de 4 páginas, con análisis del cliente, pricing y storytelling — lista para enviar.<span className="cursor" /></div>
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
            <h2 className="t-h2 reveal d1">Lo que cambia en tu vida<br />después de <span className="brand" style={{ fontSize: 'inherit' }}>Aprend<span className="ia">IA</span></span></h2>
          </div>
          <div className="ben-grid">
            {[
              { ico: '⚡', bg: 'bg-g', title: '2–4h recuperadas cada día', desc: 'Automatiza emails, informes, búsquedas y creación de contenido. Recupera tu tiempo para lo que de verdad importa.' },
              { ico: '💰', bg: 'bg-b', title: 'Nueva fuente de ingresos', desc: 'Aprende 7 modelos de negocio probados. Desde freelancing con IA hasta productos digitales — partiendo desde cero.' },
              { ico: '🧠', bg: 'bg-p', title: 'Ventaja competitiva real', desc: 'Quien domina la IA hoy entrega 10× más rápido. Posiciónate por delante antes de que el mercado te lo exija.' },
              { ico: '🎯', bg: 'bg-g', title: 'Resultados desde la primera hora', desc: 'Prompts y flujos listos para usar de inmediato. Sin curva de aprendizaje larga, sin configuraciones técnicas.' },
              { ico: '🔁', bg: 'bg-b', title: 'Automatizaciones que trabajan por ti', desc: 'Crea flujos que funcionan solos: captación de leads, atención al cliente, publicaciones, facturación — en piloto automático.' },
              { ico: '🔄', bg: 'bg-p', title: 'Acceso vitalicio + actualizaciones', desc: 'El eBook evoluciona con la IA. Recibes todas las actualizaciones futuras sin pagar nada más. Una vez, para siempre.' },
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
                  'Buscas generar ingresos extra sin necesidad de saber programar',
                  'Eres freelancer, emprendedor o trabajas por cuenta ajena y quieres diferenciarte',
                  'Has intentado entender la IA pero no sabes por dónde empezar',
                  'Prefieres resultados prácticos e inmediatos, no teoría ni formación interminable',
                  'Quieres estar por delante del mercado antes de que te lo exija',
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
                  'No estás dispuesto a dedicar al menos 1 hora a aplicar lo aprendido',
                  'Ya dominas la IA y tienes automatizaciones funcionando en tu negocio',
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
            <h2 className="t-h2 reveal d1">De la descarga al<br /><span style={{ color: 'var(--lp-primary-dark)' }}>resultado en 3 pasos</span></h2>
            <p className="t-md reveal d2">Sin tecnicismos, sin configuraciones complejas. Funciona desde el primer día.</p>
          </div>
          <div className="how-steps">
            {[
              { n: '1', title: 'Elige tu pack y compra', desc: 'Descarga instantánea tras la compra. Accede desde cualquier dispositivo — móvil, tablet u ordenador. Sin esperas.' },
              { n: '2', title: 'Aplica los prompts y templates', desc: 'Copia los prompts y flujos preconfigurados de tu pack. Solo adáptalos a tu contexto — sin configuraciones técnicas.' },
              { n: '3', title: 'Automatiza, escala y gana', desc: 'Comprueba los resultados desde el primer día. Ahorra horas cada semana y empieza a generar tus primeros ingresos con IA.' },
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
            <h2 className="t-h2 reveal d1" style={{ color: '#fff' }}>Todo lo que necesitas.<br /><span style={{ color: 'var(--primary)' }}>Nada que no necesitas.</span></h2>
            <p className="t-md reveal d2" style={{ color: 'rgba(255,255,255,.5)' }}>Elige tu pack y descubre exactamente qué llevas.</p>
          </div>
          <div className="inc-tabs reveal d1">
            {(['starter', 'pro', 'elite'] as const).map((tab) => (
              <button
                key={tab}
                className={`inc-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'starter' ? 'Starter — 17€' : tab === 'pro' ? 'Pro — 37€ ⭐' : 'Élite — 97€'}
              </button>
            ))}
          </div>
          <div className="inc-panels">
            {/* STARTER */}
            <div className={`inc-panel${activeTab === 'starter' ? ' active' : ''}`}>
              {[
                { ico: '📘', title: 'eBook base — AprendIA (200+ páginas)', desc: 'Fundamentos, herramientas clave, primeros pasos con IA. De cero a productivo en un fin de semana.' },
                { ico: '🧩', title: '30 prompts esenciales', desc: 'Los prompts más utilizados para tareas cotidianas: emails, resúmenes, contenido y más.' },
                { ico: '🔄', title: 'Acceso vitalicio', desc: 'Descarga el eBook y accede para siempre. Sin suscripciones ni costes ocultos.' },
                { ico: '🛡️', title: 'Garantía de satisfacción', desc: 'Si el contenido no cumple lo prometido, te devolvemos el dinero. Sin preguntas.' },
              ].map((item, i) => (
                <div key={i} className="inc-item">
                  <div className="inc-ico">{item.ico}</div>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>

            {/* PRO */}
            <div className={`inc-panel${activeTab === 'pro' ? ' active' : ''}`}>
              {[
                { ico: '📘', title: 'eBook base — AprendIA (200+ páginas)', desc: 'Fundamentos, herramientas clave y primeros pasos con IA incluidos.' },
                { ico: '🤖', title: 'eBook — Tu Secretario IA', desc: 'Cómo montar un asistente personal que gestione emails, agenda, recordatorios y tareas repetitivas por ti.' },
                { ico: '🚀', title: 'eBook — Negocio en 7 Días', desc: 'Cómo lanzar un negocio digital usando IA desde cero: idea, validación, producto y primeras ventas.' },
                { ico: '🧩', title: 'Biblioteca de 80+ prompts', desc: 'Templates listos por categorías: negocios, contenido, atención al cliente, copywriting y más.' },
                { ico: '💬', title: 'Comunidad de WhatsApp', desc: 'Grupo exclusivo con actualizaciones, nuevos prompts, casos reales y acceso directo a la comunidad.' },
                { ico: '🛡️', title: 'Garantía de satisfacción', desc: 'Si el contenido no cumple lo prometido, te devolvemos el dinero. Sin preguntas.' },
              ].map((item, i) => (
                <div key={i} className="inc-item">
                  <div className="inc-ico">{item.ico}</div>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>

            {/* ÉLITE */}
            <div className={`inc-panel${activeTab === 'elite' ? ' active' : ''}`}>
              {[
                { ico: '📦', title: 'Todo lo del pack Pro', desc: 'eBook base + Tu Secretario IA + Negocio en 7 Días + 80+ prompts + comunidad WhatsApp.' },
                { ico: '👑', title: 'Comunidad privada exclusiva', desc: 'Acceso a un grupo más pequeño y selecto (Discord o Telegram) donde se comparten estrategias avanzadas.' },
                { ico: '📧', title: 'Mentoría directa por email', desc: 'Consulta tus dudas directamente al autor. Respuesta garantizada en menos de 48h.' },
                { ico: '🗂️', title: 'Templates de negocio listos', desc: 'Plantillas de propuestas, contratos, emails de ventas y procesos — listas para adaptar a tu sector.' },
                { ico: '⚡', title: 'Actualizaciones priority', desc: 'Eres el primero en recibir nuevo contenido, herramientas y estrategias cuando se publican.' },
                { ico: '🛡️', title: 'Garantía de satisfacción', desc: 'Si el contenido no cumple lo prometido, te devolvemos el dinero. Sin preguntas.' },
              ].map((item, i) => (
                <div key={i} className="inc-item">
                  <div className="inc-ico">{item.ico}</div>
                  <div><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Precios</div>
            <h2 className="t-h2 reveal d1">Invierte una vez.<br /><span style={{ color: 'var(--lp-primary-dark)' }}>Benefíciate para siempre.</span></h2>
            <p className="t-md reveal d2">Sin suscripciones. Sin costes ocultos. Pago único, acceso vitalicio.</p>
          </div>
          <div className="price-cards">
            {/* STARTER */}
            <div className="price-card reveal d1">
              <div className="price-name">Starter</div>
              <p className="price-desc">Para quien quiere empezar a usar IA desde cero</p>
              <div className="price-row">
                <span className="p-amount">17</span><span className="p-currency">€</span>
              </div>
              <div className="p-before">antes 47€</div>
              <hr className="price-hr" />
              <div className="price-feats">
                <div className="pf"><span className="pf-ok">✓</span> eBook base (200+ págs)</div>
                <div className="pf"><span className="pf-ok">✓</span> 30 prompts esenciales</div>
                <div className="pf"><span className="pf-ok">✓</span> Acceso vitalicio</div>
                <div className="pf"><span className="pf-ok">✓</span> Garantía de satisfacción</div>
                <div className="pf pf-off"><span>✗</span> eBooks especializados</div>
                <div className="pf pf-off"><span>✗</span> Biblioteca 80+ prompts</div>
                <div className="pf pf-off"><span>✗</span> Comunidad WhatsApp</div>
              </div>
              <div className="price-cta">
                <a href="/api/checkout?pack=starter" className="lp-btn lp-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Empezar ahora</a>
              </div>
            </div>

            {/* PRO (FEATURED) */}
            <div className="price-card feat reveal d2">
              <div className="price-badge">⭐ Más popular</div>
              <div className="price-name">Pro</div>
              <p className="price-desc">Para quien quiere resultados concretos y rápidos</p>
              <div className="price-row">
                <span className="p-amount" style={{ color: 'var(--primary)' }}>37</span><span className="p-currency">€</span>
              </div>
              <div className="p-before">antes 97€</div>
              <hr className="price-hr" />
              <div className="price-feats">
                <div className="pf"><span className="pf-ok">✓</span> eBook base (200+ págs)</div>
                <div className="pf"><span className="pf-ok">✓</span> eBook Tu Secretario IA</div>
                <div className="pf"><span className="pf-ok">✓</span> eBook Negocio en 7 Días</div>
                <div className="pf"><span className="pf-ok">✓</span> Biblioteca 80+ prompts</div>
                <div className="pf"><span className="pf-ok">✓</span> Comunidad WhatsApp</div>
                <div className="pf"><span className="pf-ok">✓</span> Garantía de satisfacción</div>
              </div>
              <div className="price-cta">
                <a href="/api/checkout?pack=pro" className="lp-btn lp-btn-primary lp-btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Quiero el Pro →</a>
              </div>
            </div>

            {/* ÉLITE */}
            <div className="price-card reveal d3">
              <div className="price-name">Élite</div>
              <p className="price-desc">Para quien va en serio y quiere el nivel máximo</p>
              <div className="price-row">
                <span className="p-amount">97</span><span className="p-currency">€</span>
              </div>
              <div className="p-before">antes 297€</div>
              <hr className="price-hr" />
              <div className="price-feats">
                <div className="pf"><span className="pf-ok">✓</span> Todo lo del pack Pro</div>
                <div className="pf"><span className="pf-ok">✓</span> Comunidad privada exclusiva</div>
                <div className="pf"><span className="pf-ok">✓</span> Mentoría directa por email</div>
                <div className="pf"><span className="pf-ok">✓</span> Templates de negocio listos</div>
                <div className="pf"><span className="pf-ok">✓</span> Actualizaciones priority</div>
                <div className="pf"><span className="pf-ok">✓</span> Garantía de satisfacción</div>
              </div>
              <div className="price-cta">
                <a href="/api/checkout?pack=elite" className="lp-btn lp-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Quiero el Élite</a>
              </div>
            </div>
          </div>
          <div className="price-trust reveal">
            <span>🔒 Pago 100% seguro</span>
            <span>💳 Tarjeta o PayPal</span>
            <span>📱 Acceso inmediato</span>
            <span>🛡️ Garantía de satisfacción</span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials">
        <div className="wrap">
          <div className="sec-hd">
            <div className="lp-pill reveal"><span className="dot" />Testimonios</div>
            <h2 className="t-h2 reveal d1">Quienes lo probaron<br /><span style={{ color: 'var(--lp-primary-dark)' }}>no dan marcha atrás</span></h2>
          </div>
          <div className="testi-grid">
            {[
              { txt: 'Automaticé la atención al cliente de mi tienda online con IA y reduje 3 horas de trabajo al día. En 2 semanas ya había recuperado el precio del eBook', av: 'M', color: '#6366F1', name: 'María Fernández', role: 'Emprendedora Digital, Madrid', res: '+900€/mes' },
              { txt: 'Soy diseñador y jamás supe programar. Con AprendIA aprendí a automatizar presupuestos, contratos y mi portfolio. Ahora cobro el doble por los mismos proyectos', av: 'J', color: '#EC4899', name: 'Javier Morales', role: 'Diseñador Freelance, Barcelona', res: '2× más clientes' },
              { txt: 'El eBook de Negocio en 7 Días me cambió la vida. Lancé un servicio de copywriting con IA y facturé 1.400€ en el primer mes. Lo recomiendo sin dudar', av: 'A', color: '#10B981', name: 'Ana Belén Ruiz', role: 'Copywriter, Valencia', res: '1.400€ en 30 días' },
              { txt: 'Trabajo en RRHH y automaticé el cribado de CVs, el onboarding y los informes mensuales con el pack Pro. Mi jefe flipó. La promoción llegó poco después', av: 'R', color: '#F59E0B', name: 'Roberto Sánchez', role: 'Analista de RRHH, Sevilla', res: 'Ascendido' },
              { txt: 'Pensé que sería otro eBook superficial. Me equivoqué de lleno. El contenido es denso, práctico y directo. Ya he implementado 5 automatizaciones en mi empresa', av: 'F', color: '#3B82F6', name: 'Felipe Castro', role: 'Fundador de Startup, Bilbao', res: '5 automatizaciones activas' },
              { txt: 'Madre soltera, sin tiempo ni dinero para cursos caros. Con el pack Élite y la mentoría directa lancé un canal de contenido monetizado. Hoy es mi ingreso principal', av: 'L', color: '#8B5CF6', name: 'Laura González', role: 'Creadora de Contenido, Málaga', res: 'Ingreso principal' },
            ].map((t, i) => (
              <div key={i} className={`testi-card reveal d${(i % 3) + 1}`}>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-txt">{t.txt}</p>
                <div className="testi-author">
                  <div className="testi-av" style={{ background: t.color }}>{t.av}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                  <div className="testi-res">{t.res}</div>
                </div>
              </div>
            ))}
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
          <div className="lp-pill reveal" style={{ margin: '0 auto 22px', display: 'table' }}>⏰ Oferta por tiempo limitado</div>
          <h2 className="t-hero reveal d1" style={{ marginBottom: '18px' }}>
            Empieza hoy.<br />
            <span className="grad">Ya habrá valido la pena en la primera hora.</span>
          </h2>
          <p className="t-lg reveal d2" style={{ color: 'var(--lp-text-muted)', marginBottom: '44px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            Más de 4.700 personas ya transformaron su rutina con IA.<br />
            El siguiente paso es tuyo — sin riesgos, con garantía de satisfacción.
          </p>
          <div className="reveal d3">
            <a href="/api/checkout?pack=pro" className="lp-btn lp-btn-primary lp-btn-xl">Quiero el AprendIA ahora →</a>
          </div>
          <div className="cta-g reveal d4">
            🛡️ Si el contenido no cumple lo prometido, te devolvemos el dinero
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="wrap">
          <div className="foot-inner">
            <div className="brand" style={{ fontSize: '1.35rem', color: '#fff' }}>Aprend<span className="ia">IA</span></div>
            <div className="foot-links">
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
              <a href="#">Contacto</a>
            </div>
          </div>
          <div className="foot-guarantee">
            <strong>🛡️ Garantía de satisfacción:</strong> Si el contenido no cumple lo prometido, te devolvemos el dinero. Sin plazos, sin preguntas, sin burocracia.
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '.75rem', color: 'rgba(255,255,255,.2)' }}>
            © 2025 AprendIA. Todos los derechos reservados. Producto digital entregado mediante descarga inmediata.
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA (solo mobile) ── */}
      <div className="sticky-cta" id="stickyCta">
        <a href="#pricing">⚡ Quiero el eBook — desde 17€ →</a>
        <div className="sticky-cta-sub">🛡️ Garantía de satisfacción · Acceso inmediato</div>
      </div>
    </div>
  )
}
