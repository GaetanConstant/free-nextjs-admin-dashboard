import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that don't require authentication
    const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');

    // Public assets and API routes (some might be public)
    const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next');

    if (isPublicFile) {
        return NextResponse.next();
    }

    if (!token && !isAuthPage) {
        // Redirect to signin if no token and trying to access protected page
        const loginUrl = new URL('/signin', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (token && isAuthPage) {
        // Redirect to dashboard if already logged in and trying to access signin
        const dashUrl = new URL('/', request.url);
        return NextResponse.redirect(dashUrl);
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
