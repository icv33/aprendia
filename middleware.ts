import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/tiktok/generate',
    '/api/tiktok/generate-custom',
    '/api/tiktok/posts/:path*',
    '/api/tiktok/feedback',
    '/api/tiktok/settings',
    '/api/tiktok/zip',
    '/api/tiktok/publish/:path*',
    '/api/generate',
    '/api/ebooks/:path*',
  ],
}
