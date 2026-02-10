import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/landing',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-email',
];

const ROOT_ROUTE = '/';
const LANDING_ROUTE = '/landing';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 1. If user is authenticated (has refreshToken)
  if (refreshToken) {
    // Prevent access to public routes (like login, landing)
    // Redirect to Dashboard (/)
    if (
      PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) &&
      pathname !== '/verify-email'
    ) {
      return NextResponse.redirect(new URL(ROOT_ROUTE, request.url));
    }
  }

  // 2. If user is NOT authenticated (no refreshToken)
  else {
    // Prevent access to protected routes (everything except public routes)
    // Redirect to Landing Page (/landing)
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) =>
        pathname.startsWith(route) ||
        (pathname === '/' && route === LANDING_ROUTE),
    );

    // Check if it's the root route specifically, which is protected
    if (pathname === ROOT_ROUTE) {
      return NextResponse.redirect(new URL(LANDING_ROUTE, request.url));
    }

    // Checking if route is NOT public -> it's protected
    if (
      !isPublicRoute &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/static') &&
      !pathname.includes('.')
    ) {
      return NextResponse.redirect(new URL(LANDING_ROUTE, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
