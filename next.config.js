/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for better deployment
  output: 'standalone',
  // Transpile Firebase and other packages if needed
  transpilePackages: ['firebase'],
}

export default nextConfig

