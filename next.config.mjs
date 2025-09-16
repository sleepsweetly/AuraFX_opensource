/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // Vercel için gerekli değil, kaldırdık
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    
    // MythicScribe extension dosyalarını build'den hariç tut
    config.module.rules.push({
      test: /(public|AuraFX\/public)\/extensions\/mythicscribe\/.*\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    
    // AuraFX klasöründeki tüm TypeScript dosyalarını ignore et
    config.module.rules.push({
      test: /AuraFX\/.*\.(ts|tsx|js|jsx)$/,
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