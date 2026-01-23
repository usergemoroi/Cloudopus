export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/profile/:path*', '/cart', '/checkout', '/admin/:path*'],
}
