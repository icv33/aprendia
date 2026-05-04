import Link from 'next/link'

export const metadata = { title: 'Términos y Condiciones | AprendIA' }

export default function TermsPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#0F172A', padding: '18px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#fff', textDecoration: 'none' }}>
            Aprend<span style={{ color: '#00FFB2' }}>IA</span>
          </Link>
          <Link href="/" style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>← Volver</Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '48px 56px' }}>
          <p style={{ fontSize: '.82rem', color: '#94A3B8', marginBottom: 8 }}>Última actualización: 4 de mayo de 2025</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#0F172A', marginBottom: 8 }}>Términos y Condiciones</h1>
          <p style={{ color: '#64748B', fontSize: '.95rem', marginBottom: 40, lineHeight: 1.7 }}>
            Por favor, lee estos términos detenidamente antes de utilizar los servicios de AprendIA.
          </p>

          <Section title="1. Información del titular">
            <p>El presente sitio web <strong>aprendia.store</strong> es titularidad de <strong>AprendIA</strong>. Para cualquier consulta puedes contactarnos en <a href="mailto:hola@aprendia.store" style={{ color: '#00CC8F' }}>hola@aprendia.store</a>.</p>
          </Section>

          <Section title="2. Objeto y aceptación">
            <p>Estas condiciones regulan el acceso y uso del sitio web aprendia.store, así como la adquisición de los productos digitales ofrecidos (eBooks, prompts, acceso a comunidades y servicios de mentoría).</p>
            <p>El uso del sitio web o la realización de cualquier compra implica la aceptación plena y sin reservas de los presentes términos. Si no estás de acuerdo, te rogamos que no utilices el servicio.</p>
          </Section>

          <Section title="3. Descripción del servicio">
            <p>AprendIA ofrece productos digitales educativos sobre el uso práctico de la Inteligencia Artificial, sin necesidad de conocimientos de programación. Los productos incluyen:</p>
            <ul>
              <li><strong>Pack Starter:</strong> eBook base + 30 prompts esenciales + acceso vitalicio.</li>
              <li><strong>Pack Pro:</strong> eBooks especializados + biblioteca de 80+ prompts + comunidad de WhatsApp.</li>
              <li><strong>Pack Élite:</strong> Todo lo anterior + comunidad privada + mentoría directa por email + templates de negocio.</li>
            </ul>
            <p>Los contenidos se entregan en formato digital (PDF) mediante enlace de descarga enviado al email facilitado en el momento de la compra.</p>
          </Section>

          <Section title="4. Proceso de compra y pago">
            <p>El proceso de compra se realiza a través de <strong>Stripe</strong>, plataforma segura de pagos. AprendIA no almacena datos de tarjetas de crédito en ningún momento.</p>
            <p>Los precios indicados incluyen los impuestos aplicables. Una vez confirmado el pago, recibirás el acceso al contenido de forma inmediata en el email indicado.</p>
          </Section>

          <Section title="5. Política de devolución y garantía">
            <p>AprendIA ofrece una <strong>garantía de satisfacción</strong>: si el contenido no cumple lo descrito, puedes solicitar la devolución completa del importe abonado, sin límite de plazo, sin preguntas y sin burocracia.</p>
            <p>Para solicitar una devolución, escribe a <a href="mailto:hola@aprendia.store" style={{ color: '#00CC8F' }}>hola@aprendia.store</a> indicando tu email de compra.</p>
          </Section>

          <Section title="6. Propiedad intelectual">
            <p>Todos los contenidos del sitio web y de los productos digitales (textos, imágenes, prompts, estructuras, diseños) son propiedad exclusiva de AprendIA y están protegidos por las leyes de propiedad intelectual vigentes.</p>
            <p>La compra de un producto otorga una <strong>licencia personal, no exclusiva e intransferible</strong> para su uso. Queda expresamente prohibida la reproducción, distribución, reventa o comunicación pública de los contenidos sin autorización previa por escrito.</p>
          </Section>

          <Section title="7. Limitación de responsabilidad">
            <p>AprendIA no garantiza resultados económicos específicos derivados del uso de sus productos. Los resultados dependen del esfuerzo, contexto y aplicación de cada usuario.</p>
            <p>AprendIA no será responsable de daños indirectos, pérdidas de beneficios o perjuicios derivados del uso o imposibilidad de uso del servicio.</p>
          </Section>

          <Section title="8. Modificaciones">
            <p>AprendIA se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta misma página con la fecha de actualización. El uso continuado del servicio tras la publicación implica la aceptación de las nuevas condiciones.</p>
          </Section>

          <Section title="9. Legislación aplicable">
            <p>Estos términos se rigen por la legislación española. Para cualquier controversia derivada del uso del servicio, las partes se someten a los juzgados y tribunales del domicilio del consumidor, de acuerdo con la normativa aplicable de protección al consumidor.</p>
          </Section>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 24 }}>
            <Link href="/privacy" style={{ fontSize: '.85rem', color: '#00CC8F', textDecoration: 'none' }}>Política de Privacidad →</Link>
            <Link href="/" style={{ fontSize: '.85rem', color: '#94A3B8', textDecoration: 'none' }}>Volver al inicio →</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', marginBottom: 12 }}>{title}</h2>
      <div style={{ color: '#475569', fontSize: '.92rem', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}
