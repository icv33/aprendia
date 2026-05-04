import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/tiktok/generate',
    '/api/tiktok/posts/:path*',
    '/api/tiktok/feedback',
    '/api/tiktok/settings',
    '/api/tiktok/zip',
    '/api/tiktok/render',
    '/api/generate',
    '/api/ebooks/:path*',
  ],
}
