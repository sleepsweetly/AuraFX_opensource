/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // Vercel için gerekli değil, kaldırdık
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    
    // 🚀 Web Worker Support - Native Next.js approach
    // Workers are automatically supported with new URL('...', import.meta.url)
    // No additional config needed, just ensuring optimization is correct
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    
    // MythicScribe extension dosyalarını build'den hariç tut
    config.module.rules.push({
      test: /(public|AuraFX\/public)\/extensions\/mythicscribe\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    // AuraFX_opensource klasöründeki tüm TypeScript dosyalarını ignore et
    config.module.rules.push({
      test: /AuraFX_opensource\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    // out klasöründeki dosyaları ignore et
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/out/**', 
        '**/public/extensions/mythicscribe/**',
        '**/AuraFX/public/extensions/mythicscribe/**'
      ]
    };
    
    return config;
  },
};

export default nextConfig;