/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/index.html',
            },
            {
                source: '/verify.php',
                destination: '/verify',
            },
            {
                source: '/verification.php',
                destination: '/search',
            },
            {
                source: '/site/verification',
                destination: '/index.html',
            },
            {
                source: '/DAS_approved_letter_:id.pdf',
                destination: '/api/pdf/DAS_approved_letter_:id.pdf',
            },
            {
                source: '/DAS_revamped_AppForm_:id.pdf',
                destination: '/api/pdf/DAS_revamped_AppForm_:id.pdf',
            }
        ];
    },

    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: false,

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'X-Permitted-Cross-Domain-Policies',
                        value: 'none',
                    },
                    {
                        key: 'X-Download-Options',
                        value: 'noopen',
                    },
                ],
            },
            {
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/assets/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/hec-admin/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                    },
                    {
                        key: 'CDN-Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
        ];
    },

    experimental: {
        serverComponentsExternalPackages: ['puppeteer']
    }
};

export default nextConfig;
