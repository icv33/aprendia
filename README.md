# AprendIA

Editorial digital de guías sobre inteligencia artificial, con un panel que automatiza casi todo el trabajo: crear el ebook, su página de venta, el cobro y el contenido para redes.

> Proyecto personal (abril–mayo de 2026). Ya no está en marcha.

## Qué hace

- **Generador de ebooks con IA**: a partir de un tema y un público, Claude escribe el ebook y el texto de su landing (promesa, problema, módulos, preguntas frecuentes…).
- **Landing de venta por producto** (`/productos/[slug]`) con pago por Stripe Checkout y entrega por correo (Resend).
- **Panel privado** (`/dashboard`, NextAuth):
  - Resumen, contenido, ventas y lista de espera.
  - **TikTok**: genera ideas y carruseles, los renderiza como imágenes, las genera solas con un cron y tiene en cuenta tu feedback.
  - **Vídeos**: guion con IA, voz (ElevenLabs), avatar (D-ID) e imágenes de Pexels.
  - **Finanzas**: ingresos y gastos; se pueden pegar en texto libre y la IA los clasifica.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4, shadcn/ui, Framer Motion
- Supabase (Postgres + Storage), esquemas en `supabase/`
- NextAuth (acceso de administrador)
- Anthropic (Claude), Stripe, Resend, ElevenLabs, D-ID, Pexels, API de TikTok

## Arrancarlo en local

```bash
npm install
npm run dev
```

Crea un `.env.local` con estas variables (los valores, de cada servicio):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
ELEVENLABS_API_KEY=
DID_API_KEY=
PEXELS_API_KEY=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
CRON_SECRET=
```

Y aplica los SQL de `supabase/` en tu proyecto de Supabase.

---

Hecho por [Ignacio Cabrera Villanova](https://www.linkedin.com/in/ignacio-cabrera-villanova) · Ahora construyendo [Birdeo](https://birdeo.app).
