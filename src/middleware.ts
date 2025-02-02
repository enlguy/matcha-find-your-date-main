import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// import { JWTPayload, jwtVerify } from 'jose';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/login']);

// const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// List of supported locales and public pages
const locales = ['en', 'fr', 'ru', 'es'];
const publicPages = ['/', '/login', '/email-confirmation', '/password-reset'];

// Middleware for internationalization (i18n)
// const intlMiddleware = createMiddleware({
//  locales,
//  localePrefix: 'always', // Prefix all URLs with locale
// defaultLocale: 'en',
// });

{
  /* export async function middleware(req: NextRequest) {
  // Check if the page is public
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  );   */
}

export default clerkMiddleware();

// const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

// If the page is public, apply only i18n, not 'logged-in-?' middleware and return
//if (isPublicPage) {
// return intlMiddleware(req);
//}

/* // Check if the user is logged in
  const token = req.cookies.get('token')?.value;

  if (!token) {
    // If the user is not logged in, redirect to the login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);
    const userId = (payload as JWTPayload & { userId: string }).userId;

    //// Add userId to the query string
    //if (userId) {
    //  req.nextUrl.searchParams.set('userId', userId);
    //}
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
  */

// Apply i18n middleware to the request and return
// return intlMiddleware(req);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
