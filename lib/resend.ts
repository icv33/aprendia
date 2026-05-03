import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendPurchaseEmail({
  to,
  customerName,
  ebookTitle,
  downloadUrl,
}: {
  to: string
  customerName: string
  ebookTitle: string
  downloadUrl: string
}) {
  return resend.emails.send({
    from: 'AprendIA <noreply@aprendia.store>',
    to,
    subject: `Tu guía "${ebookTitle}" está lista ✅`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: -apple-system, sans-serif; background: #f9fafb; padding: 40px 20px; margin: 0;">
        <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 32px 40px; text-align: center;">
            <p style="color: white; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
              Aprend<span style="color: #a5b4fc;">IA</span>
            </p>
          </div>

          <div style="padding: 40px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">
              ¡Gracias por tu compra, ${customerName}! 🎉
            </h1>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
              Tu guía <strong>${ebookTitle}</strong> está lista para descargar. Tienes acceso durante 48 horas a través del enlace de abajo.
            </p>

            <a href="${downloadUrl}"
               style="display: block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; margin-bottom: 24px;">
              Descargar mi guía →
            </a>

            <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
              El enlace expira en 48 horas. Si tienes algún problema, responde a este email.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © ${new Date().getFullYear()} AprendIA · aprendia.store
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
