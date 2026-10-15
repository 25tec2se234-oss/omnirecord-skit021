import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-generator',
    closeBundle() {
      const distDir = path.resolve('dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const htmlContent = fs.readFileSync(indexPath, 'utf-8');

      // 1. Generate 404.html (standard fallback for static hosts like Render / GitHub Pages)
      fs.writeFileSync(path.join(distDir, '404.html'), htmlContent);

      // 2. Pre-generate physical route folders so direct refresh on Render always succeeds
      const routes = [
        'login',
        'register',
        'dashboard',
        'verification',
        'portfolio',
        'analytics',
        'settings',
        'events',
        'students',
        'credentials',
        'portal'
      ];

      for (const route of routes) {
        const routeDir = path.join(distDir, route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent);
        fs.writeFileSync(path.join(distDir, `${route}.html`), htmlContent);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
})
