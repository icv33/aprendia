import Link from 'next/link'

export const metadata = { title: 'Política de Privacidad | AprendIA' }

export default function PrivacyPage() {
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
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem', color: '#0F172A', marginBottom: 8 }}>Política de Privacidad</h1>
          <p style={{ color: '#64748B', fontSize: '.95rem', marginBottom: 40, lineHeight: 1.7 }}>
            En AprendIA respetamos tu privacidad y nos comprometemos a proteger tus datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos (LOPDGDD).
          </p>

          <Section title="1. Responsable del tratamiento">
            <p><strong>Nombre:</strong> AprendIA</p>
            <p><strong>Sitio web:</strong> aprendia.store</p>
            <p><strong>Email de contacto:</strong> <a href="mailto:hola@aprendia.store" style={{ color: '#00CC8F' }}>hola@aprendia.store</a></p>
          </Section>

          <Section title="2. Datos que recopilamos">
            <p>AprendIA recopila únicamente los datos necesarios para prestar el servicio:</p>
            <ul>
              <li><strong>Dirección de email:</strong> al registrarte en la lista de espera o realizar una compra.</li>
              <li><strong>Nombre:</strong> de forma opcional, al completar el proceso de compra.</li>
              <li><strong>Datos de pago:</strong> procesados directamente por Stripe. AprendIA no accede ni almacena datos de tarjetas de crédito.</li>
              <li><strong>Datos de navegación:</strong> cookies técnicas necesarias para el funcionamiento del sitio. No utilizamos cookies de seguimiento ni publicidad.</li>
            </ul>
          </Section>

          <Section title="3. Finalidad del tratamiento">
            <p>Los datos recopilados se utilizan exclusivamente para:</p>
            <ul>
              <li>Gestionar la lista de espera y comunicar el lanzamiento del producto.</li>
              <li>Procesar y confirmar compras y enviar el acceso al contenido adquirido.</li>
              <li>Enviar actualizaciones de contenido y comunicaciones relevantes del servicio (sin spam).</li>
              <li>Atender consultas y solicitudes de soporte.</li>
            </ul>
          </Section>

          <Section title="4. Base legal del tratamiento">
            <p>El tratamiento de tus datos se basa en:</p>
            <ul>
              <li><strong>Consentimiento explícito:</strong> al completar el formulario de lista de espera.</li>
              <li><strong>Ejecución de contrato:</strong> al realizar una compra, el tratamiento es necesario para cumplir con la relación contractual.</li>
              <li><strong>Interés legítimo:</strong> para el envío de comunicaciones sobre el propio servicio contratado.</li>
            </ul>
          </Section>

          <Section title="5. Conservación de los datos">
            <p>Los datos se conservan durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos y durante los plazos legales que sean de aplicación. Puedes solicitar su eliminación en cualquier momento.</p>
          </Section>

          <Section title="6. Compartición de datos con terceros">
            <p>AprendIA no vende ni cede tus datos a terceros. Únicamente compartimos datos con proveedores de servicio necesarios para operar:</p>
            <ul>
              <li><strong>Stripe</strong> — procesamiento de pagos (política de privacidad en stripe.com/privacy).</li>
              <li><strong>Supabase</strong> — almacenamiento seguro de datos en servidores dentro de la UE.</li>
              <li><strong>Resend</strong> — envío de emails transaccionales.</li>
            </ul>
            <p>Todos los proveedores cumplen con el RGPD y ofrecen garantías adecuadas de protección de datos.</p>
          </Section>

          <Section title="7. Tus derechos">
            <p>De acuerdo con el RGPD, tienes derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos.</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
              <li><strong>Limitación:</strong> solicitar la restricción del tratamiento.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, escribe a <a href="mailto:hola@aprendia.store" style={{ color: '#00CC8F' }}>hola@aprendia.store</a>. Responderemos en un plazo máximo de 30 días. También puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en aepd.es.</p>
          </Section>

          <Section title="8. Cookies">
            <p>AprendIA utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento del sitio (gestión de sesión autenticada). No utilizamos cookies de análisis, publicidad ni redes sociales de terceros.</p>
            <p>Puedes configurar tu navegador para bloquear o eliminar cookies, aunque esto puede afectar al funcionamiento de algunas partes del sitio.</p>
          </Section>

          <Section title="9. Seguridad">
            <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos contra acceso no autorizado, pérdida o divulgación: conexiones cifradas (HTTPS), acceso restringido a datos y uso de proveedores con certificaciones de seguridad reconocidas.</p>
          </Section>

          <Section title="10. Modificaciones">
            <p>Esta política puede actualizarse para reflejar cambios en el servicio o en la legislación aplicable. Te notificaremos de cambios significativos por email. La fecha de última actualización aparece siempre al inicio de esta página.</p>
          </Section>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 24 }}>
            <Link href="/terms" style={{ fontSize: '.85rem', color: '#00CC8F', textDecoration: 'none' }}>Términos y Condiciones →</Link>
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
